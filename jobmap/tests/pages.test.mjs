// 검색용 정적 페이지(jobs/·depts/·faq/·ai/·sitemap.xml)가 지금 데이터·화면과 같은지 본다. 다르면 다시 만들라고 알려 준다.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const DIR = process.env.JOBMAP_DIR || fileURLToPath(new URL("../", import.meta.url));
const GEN = join(DIR, "tools/pages.mjs");

test("검색용 페이지가 최신이다", () => {
  const tmp = mkdtempSync(join(tmpdir(), "jobmap-pages-"));
  const r = spawnSync(process.execPath, [GEN, DIR, tmp], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const files = readdirSync(tmp, { recursive: true }).filter((f) => f.endsWith(".html"));
  assert.ok(files.length > 30, `${files.length}쪽`);
  // 그리기 함수가 빈 본문을 내면 쪽 수만으로는 못 잡는다: 직무 카드 본문 글자 수(띄어쓰기 포함)를 본다
  const body = (f) => (readFileSync(join(tmp, f), "utf8").match(/<article[\s\S]*<\/article>/)?.[0] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const thin = files.filter((f) => /^jobs[\\/][\w-]+[\\/]/.test(f) && body(f).length < 500);
  assert.deepEqual(thin, [], "직무 페이지 본문 500자 미만");
  const stale = files.filter((f) => !existsSync(join(DIR, f)) || readFileSync(join(DIR, f), "utf8") !== readFileSync(join(tmp, f), "utf8"));
  assert.deepEqual(stale, [], "node tools/pages.mjs 로 다시 만드세요");
  const locs = (readFileSync(join(DIR, "sitemap.xml"), "utf8").match(/<loc>/g) || []).length;
  assert.equal(locs, files.length + 1, "sitemap 주소 수 = 페이지 수 + 1(/jobmap/)");
});
