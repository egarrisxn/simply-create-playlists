import fs from "fs";

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/add-shebang.mjs <path-to-cli.js>");
  process.exit(1);
}

const content = fs.readFileSync(target, "utf8");
if (content.startsWith("#!/usr/bin/env node")) process.exit(0);

fs.writeFileSync(target, `#!/usr/bin/env node\n${content}`, "utf8");
