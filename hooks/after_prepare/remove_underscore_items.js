#!/usr/bin/env node

/**
 * Cordova Electron after_prepare hook
 * ------------------------------------------------------
 * ✅ 역할:
 *   - platforms/electron/www 내부에서 "_"로 시작하는 파일/폴더 삭제
 *   - 단, 특정 경로(예: node_modules, libs 등)는 제외
 * ------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// 📍 대상 플랫폼 경로
const PLATFORM_WWW = path.join(__dirname, "../../platforms/electron/www");

// ✅ 탐색 제외(스킵) 폴더 리스트
const EXCLUDE_DIRS = [
  "node_modules"
];

/**
 * 재귀적으로 "_"로 시작하는 항목을 제거
 * @param {string} dirPath
 */
function removeUnderscoreItems(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const ent of entries) {
    const name = ent.name;
    const full = path.join(dirPath, name);

    // 🚫 EXCLUDE_DIRS 배열에 있는 경로는 무시
    if (EXCLUDE_DIRS.includes(name)) {
      // console.log(`⏭️  Skipping excluded directory: ${full}`);
      continue;
    }

    // "_"로 시작하는 파일 또는 폴더 삭제
    if (name.startsWith("_")) {
      try {
        if (ent.isDirectory()) {
          fs.rmSync(full, { recursive: true, force: true });
          console.log(`🚫 Excluded directory: ${full}`);
        } else if (ent.isFile()) {
          fs.unlinkSync(full);
          console.log(`🚫 Excluded file:      ${full}`);
        }
      } catch (e) {
        console.warn(`⚠️  Failed to remove: ${full}\n   -> ${e.message}`);
      }
      continue;
    }

    // 하위 폴더 재귀 탐색 (exclude 목록은 이미 필터링됨)
    if (ent.isDirectory()) {
      removeUnderscoreItems(full);
    }
  }
}

console.log("🧹 Cleaning underscore-prefixed files & folders in platform build copy...");
removeUnderscoreItems(PLATFORM_WWW);
console.log("✅ Done. (platforms/electron/www cleaned)\n");
