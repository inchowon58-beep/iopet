/**
 * 아이오펫 (inchowon58-beep/iopet / iopet.cattery.co.kr) 전용 배포 가드
 * 디어펫(dearpet) 및 이전 브랜드와 절대 섞이지 않도록 합니다.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ALLOWED_REMOTE = /github\.com[:/]+inchowon58-beep\/iopet(\.git)?$/i;
const BLOCKED_REMOTE =
  /inchowon58-beep\/dearpet(\.git)?$|deatpet|maincoonmar|mainyou|maincoonpshop|maincooninfo|maincoondmc|maincoonag|smpinfo|infowedding|pruwedding|dmcwedding|inchowon58-beep\/globalwedding(\.git)?$|pupmaincoon|enmaincoon|puppydoodle|agadoodle|doodlekorea|catterydoodle|muzi02|muzi01|muziga|inchowon58-beep\/eanimal(\.git)?$|inchowon58-beep\/funeral(\.git)?$|inchowon58-beep\/doodle(\.git)?$|cloudshelter|jejumilgam|dogboho|구름이네/i;

const BLOCKED_VERCEL =
  /^(dearpet|mainyou|maincoonpshop|maincooninfo|maincoondmc|maincoonag|smpinfo|infowedding|pruwedding|dmcwedding|globalwedding|pupmaincoon|enmaincoon|puppydoodle|eanimal|muziga|muzi01|muzi02|catterydoodle|doodle|doodlekorea|agadoodle|maincoonmar|wild-coon-mar)$/i;

function fail(msg) {
  console.error("이 프로젝트는 iopet (아이오펫 / iopet.cattery.co.kr) 전용입니다.");
  console.error("디어펫(dearpet) 및 기존 사이트에는 절대 push/deploy 하지 마세요.\n");
  console.error(msg);
  process.exit(1);
}

function readVercelProject() {
  const p = path.join(process.cwd(), ".vercel", "project.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const vercel = readVercelProject();
if (vercel?.projectName && BLOCKED_VERCEL.test(vercel.projectName)) {
  fail(
    `Vercel 연결이 기존 '${vercel.projectName}' 입니다. 이전 프로젝트는 사용하지 않습니다.\n` +
      `iopet.cattery.co.kr / inchowon58-beep/iopet 전용으로 다시 연결하세요.`
  );
}
if (vercel?.projectName && !/^iopet$/i.test(vercel.projectName)) {
  fail(
    `Vercel 프로젝트 이름은 iopet 이어야 합니다.\n  현재: ${vercel.projectName}`
  );
}

let remote = "";
try {
  remote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
} catch {
  fail("git origin이 없습니다. https://github.com/inchowon58-beep/iopet.git 로 설정하세요.");
}

if (BLOCKED_REMOTE.test(remote)) {
  fail(`git origin이 이전 저장소입니다 (기존 저장소 사용 금지):\n  ${remote}`);
}
if (!ALLOWED_REMOTE.test(remote)) {
  fail(
    `git origin은 https://github.com/inchowon58-beep/iopet.git 이어야 합니다.\n  현재: ${remote}`
  );
}

console.log("✅ 배포 대상 확인: 아이오펫 (iopet / iopet.cattery.co.kr)");
