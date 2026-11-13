const fs = require("fs");
const code = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_before_user_prompt.tsx", "utf8");

// Search for colors, brandPalette, style, animation, isTyping
console.log("Length:", code.length);
const lines = code.split("\n");
console.log("Total lines:", lines.length);

lines.forEach((l, i) => {
  if (l.includes("brand") || l.includes("animate") || l.includes("typing") || l.includes("Typing") || l.includes("style=")) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

