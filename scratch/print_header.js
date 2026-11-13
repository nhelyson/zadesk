const fs = require("fs");
const lines = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_before_user_prompt.tsx", "utf8").split("\n");

console.log("=== HEADER (lines 250-310) ===");
console.log(lines.slice(249, 310).join("\n"));

console.log("=== HERO CARD (lines 400-450) ===");
console.log(lines.slice(399, 450).join("\n"));

