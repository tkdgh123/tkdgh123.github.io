// 한 줄 실행: 단위 테스트(node --test) → E2E. 하나라도 실패하면 exit 1.
// `node tests/run.mjs [E1 …] [--root <폴더>]` 인자는 E2E에 넘기고, --root면 단위 테스트도 <폴더>/jobmap을 읽는다.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL(".", import.meta.url));
const args = process.argv.slice(2), ri = args.indexOf("--root");
const env = ri >= 0 ? { ...process.env, JOBMAP_DIR: join(args[ri + 1], "jobmap") } : process.env;
const tests = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs")).map((f) => join(DIR, f));

console.log("== 단위 테스트 ==");
const unit = spawnSync(process.execPath, ["--test", ...tests], { stdio: "inherit", env });
console.log("\n== E2E ==");
const e2e = spawnSync(process.execPath, [join(DIR, "e2e", "run.mjs"), ...args], { stdio: "inherit", env });
console.log(`\n단위 ${unit.status === 0 ? "통과" : "실패"} · E2E ${e2e.status === 0 ? "통과" : "실패"}`);
process.exit(unit.status === 0 && e2e.status === 0 ? 0 : 1);
