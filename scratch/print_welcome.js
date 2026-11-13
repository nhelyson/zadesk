const fs = require("fs");
const lines = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_before_user_prompt.tsx", "utf8").split("\n");

console.log("=== WELCOME MESSAGE (lines 40-75) ===");
console.log(lines.slice(39, 75).join("\n"));

