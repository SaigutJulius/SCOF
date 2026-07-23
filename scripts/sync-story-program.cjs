const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const jsonPath = path.join(root, "assets", "stories", "story-program.json");
const jsPath = path.join(root, "assets", "stories", "story-program.js");
const program = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const payload = JSON.stringify(program, null, 2);
const output = `/* Generated from story-program.json. Run scripts/sync-story-program.cjs after manifest edits. */\n(() => {\n  const program = ${payload};\n  window.STFirmStoryProgram = Object.freeze(program);\n})();\n`;

fs.writeFileSync(jsPath, output, "utf8");
console.log(`Synced ${path.relative(root, jsPath)} from ${path.relative(root, jsonPath)}.`);
