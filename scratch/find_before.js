const fs = require("fs");
const readline = require("readline");

async function findBefore10800() {
  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  let matches = [];
  for await (const line of rl) {
    lineIdx++;
    if (lineIdx < 10800 && line.includes("CompanyConversationalView.tsx")) {
      matches.push(lineIdx);
    }
  }
  console.log("Matches before 10800:", matches.slice(-15));
}
findBefore10800();

