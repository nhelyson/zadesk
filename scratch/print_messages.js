const fs = require("fs");
const lines = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_before_user_prompt.tsx", "utf8").split("\n");

console.log("=== MESSAGES & PROMPT CHIPS (lines 520-580) ===");
console.log(lines.slice(519, 580).join("\n"));

