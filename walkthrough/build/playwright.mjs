// Playwright through require(), so a globally installed copy (NODE_PATH)
// works as well as the project's own devDependency.

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let playwright;
try {
  playwright = require("playwright");
} catch {
  console.error(
    "The walkthrough needs Playwright. Run:\n  npm install\n  npx playwright install chromium",
  );
  process.exit(1);
}

export const { chromium } = playwright;
