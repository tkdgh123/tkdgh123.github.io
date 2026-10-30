// 정적 파일 서버(node:http). `node serve.mjs <port> [root]`, root 기본값은 작업실 폴더라 ../ 링크도 열린다.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json; charset=utf-8" };

export function start(port = 0, root = ROOT) {
  root = resolve(root);
  const server = http.createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = resolve(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) {
        if (!path.endsWith("/")) { res.writeHead(301, { location: path + "/" }).end(); return; }
        file = join(file, "index.html");
      }
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" }).end(body);
    } catch { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found"); }
  });
  return new Promise((ok, no) => { server.once("error", no); server.listen(port, "127.0.0.1", () => ok(server)); });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [port = 8781, root = ROOT] = process.argv.slice(2);
  const s = await start(+port, root);
  console.log(`http://127.0.0.1:${s.address().port}/jobmap/  (root ${resolve(root)})`);
}
