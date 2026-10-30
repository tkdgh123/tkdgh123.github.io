// 헤드리스 Chrome을 CDP(node 내장 WebSocket·fetch)로 조종한다. dev/cdp.mjs 이식.
// 소켓 경쟁 조건 수정: 소켓은 한 번만 만들고 open을 기다린 뒤 쓴다.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function chromePath() {
  const list = [process.env.CHROME, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"];
  const p = list.find((x) => x && existsSync(x));
  if (!p) throw new Error("Chrome을 찾지 못했어요. CHROME 환경 변수로 경로를 주세요.");
  return p;
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((ok, no) => { ws.addEventListener("open", ok, { once: true }); ws.addEventListener("error", () => no(new Error("CDP 연결 실패 " + url)), { once: true }); });
  let id = 0;
  const wait = new Map(), handlers = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && wait.has(m.id)) { const [ok, no] = wait.get(m.id); wait.delete(m.id); m.error ? no(new Error(`${m.error.message} ${m.error.data || ""}`)) : ok(m.result); }
    else if (m.method) handlers.forEach((h) => h(m));
  });
  ws.addEventListener("close", () => wait.forEach(([, no]) => no(new Error("CDP 소켓이 닫혔어요"))));
  return {
    // 닫힌 소켓의 send는 조용히 버려져 영원히 기다리므로 바로 실패시킨다
    send: (method, params = {}) => new Promise((ok, no) => {
      if (ws.readyState !== WebSocket.OPEN) return no(new Error(`CDP 소켓이 닫혀 있어요: ${method}`));
      const i = ++id; wait.set(i, [ok, no]); ws.send(JSON.stringify({ id: i, method, params }));
    }),
    on: (h) => handlers.push(h),
    close: () => ws.close()
  };
}

export async function launch({ scrollbars = false } = {}) {
  const prof = mkdtempSync(join(tmpdir(), "jobmap-chrome-"));
  const proc = spawn(chromePath(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${prof}`, "--mute-audio", "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", ...(scrollbars ? [] : ["--hide-scrollbars"]), "about:blank"], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 120 && !port; i++) { try { port = +readFileSync(join(prof, "DevToolsActivePort"), "utf8").split("\n")[0]; } catch {} if (!port) await sleep(250); }
  if (!port) { proc.kill(); throw new Error("Chrome 디버그 포트를 얻지 못했어요"); }
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const b = await connect(ver.webSocketDebuggerUrl);
  await b.send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });

  async function newPage({ width = 1280, height } = {}) {
    const { targetId } = await b.send("Target.createTarget", { url: "about:blank" });
    const c = await connect(`ws://127.0.0.1:${port}/devtools/page/${targetId}`);
    const errs = [], reqs = new Map();
    let loaded = null;
    const add = (kind, text, url = "") => {
      let origin = "site";
      try { if (url && !/^(127\.0\.0\.1|localhost)$/.test(new URL(url).hostname) && /^https?:/.test(url)) origin = "cdn"; } catch {}
      errs.push({ origin, kind, text: String(text).slice(0, 300), url });
    };
    c.on((m) => {
      const p = m.params;
      if (m.method === "Page.loadEventFired") loaded?.();
      else if (m.method === "Runtime.exceptionThrown") add("예외", p.exceptionDetails.exception?.description || p.exceptionDetails.text, p.exceptionDetails.url || p.exceptionDetails.stackTrace?.callFrames?.[0]?.url);
      else if (m.method === "Runtime.consoleAPICalled" && p.type === "error") add("console", p.args.map((a) => a.value ?? a.description).join(" "), p.stackTrace?.callFrames?.[0]?.url);
      else if (m.method === "Log.entryAdded" && p.entry.level === "error" && !["network", "console-api"].includes(p.entry.source)) add("log", p.entry.text, p.entry.url);
      else if (m.method === "Network.requestWillBeSent") reqs.set(p.requestId, p.request.url);
      else if (m.method === "Network.loadingFailed" && !p.canceled) add("요청 실패", p.errorText, reqs.get(p.requestId));
      else if (m.method === "Network.responseReceived" && p.response.status >= 400) add(`HTTP ${p.response.status}`, p.response.url, p.response.url);
    });
    for (const m of ["Page.enable", "Runtime.enable", "Log.enable", "Network.enable"]) await c.send(m);
    await c.send("Network.setCacheDisabled", { cacheDisabled: true });

    const page = {
      keys: 0, width, height,
      send: c.send,
      async viewport(w, h = w < 600 ? 844 : 900) {
        page.width = w; page.height = h;
        await c.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
      },
      async media({ colorScheme = "", reducedMotion = "", media = "" } = {}) {
        await c.send("Emulation.setEmulatedMedia", { media, features: [{ name: "prefers-color-scheme", value: colorScheme }, { name: "prefers-reduced-motion", value: reducedMotion }] });
      },
      async goto(url, timeout = 15000) {
        let timer;
        const done = new Promise((r) => { loaded = r; timer = setTimeout(r, timeout); });
        const res = await c.send("Page.navigate", { url });
        if (res.errorText) throw new Error(`이동 실패 ${url}: ${res.errorText}`);
        if (res.loaderId) await done;
        clearTimeout(timer);
        loaded = null;
      },
      // 문자열 식 또는 함수(+인자)를 페이지에서 실행하고 값을 돌려준다
      async eval(fn, ...args) {
        const expression = typeof fn === "function" ? `(${fn})(...${JSON.stringify(args)})` : fn;
        const r = await c.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
        return r.result.value;
      },
      // 요소 가운데를 실제 마우스로 누른다. 화면 밖이면 먼저 보이게 한다
      async click(sel) {
        const at = await page.eval((s) => {
          const e = document.querySelector(s); if (!e) return null;
          let b = e.getBoundingClientRect();
          if (b.top < 0 || b.bottom > innerHeight || b.left < 0 || b.right > document.documentElement.clientWidth) { e.scrollIntoView({ block: "center", behavior: "instant" }); b = e.getBoundingClientRect(); }
          return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
        }, sel);
        if (!at) throw new Error(`누를 요소가 없어요: ${sel}`);
        await c.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at });
        for (const type of ["mousePressed", "mouseReleased"]) await c.send("Input.dispatchMouseEvent", { type, ...at, button: "left", clickCount: 1 });
      },
      async key(k, { shift = false } = {}) {
        const named = { Tab: [9, ""], Enter: [13, "\r"], Space: [32, " "], Escape: [27, ""], Backspace: [8, ""], ArrowLeft: [37, ""], ArrowUp: [38, ""], ArrowRight: [39, ""], ArrowDown: [40, ""] };
        const [code, text] = named[k] || [k.toUpperCase().charCodeAt(0), k];
        const base = { key: k === "Space" ? " " : k, code: k === "Space" ? "Space" : /^\d$/.test(k) ? "Digit" + k : k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code, modifiers: shift ? 8 : 0 };
        await c.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...base });
        if (text) await c.send("Input.dispatchKeyEvent", { type: "char", ...base, text, unmodifiedText: text });
        await c.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
        page.keys++;
      },
      async shot(path, { full = false } = {}) {
        mkdirSync(dirname(path), { recursive: true });
        let clip;
        if (full) { const m = await c.send("Page.getLayoutMetrics"); clip = { x: 0, y: 0, width: page.width, height: Math.min(Math.ceil(m.cssContentSize.height), 16000), scale: 1 }; }
        const r = await c.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, ...(clip ? { clip } : {}) });
        writeFileSync(path, Buffer.from(r.data, "base64"));
        return path;
      },
      async waitFor(expr, timeout = 5000) {
        const end = Date.now() + timeout;
        let last;
        while (Date.now() < end) { try { last = await page.eval(expr); if (last) return last; } catch (e) { last = e.message; } await sleep(50); }
        throw new Error(`기다려도 안 됨(${timeout}ms): ${typeof expr === "function" ? expr.toString().slice(0, 120) : expr}`);
      },
      // 돌고 있는 애니메이션이 없을 때까지 기다린다. 시간이 넘으면 false
      async idle(timeout = 3000) {
        try { await page.waitFor(`document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)`, timeout); } catch { return false; }
        await page.eval("new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))");
        return true;
      },
      errors: () => errs.slice(),
      close: async () => { c.close(); await b.send("Target.closeTarget", { targetId }).catch(() => {}); }
    };
    await page.viewport(width, height);
    return page;
  }

  return {
    newPage,
    async close() { b.close(); proc.kill(); await sleep(300); try { rmSync(prof, { recursive: true, force: true }); } catch {} }
  };
}
