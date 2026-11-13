const fs = require("fs");
const lines = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_before_user_prompt.tsx", "utf8").split("\n");

console.log("=== HANDLE SEND (lines 130-220) ===");
console.log(lines.slice(129, 220).join("\n"));

