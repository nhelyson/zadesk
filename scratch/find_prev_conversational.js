const fs = require("fs");
const readline = require("readline");

async function findInTranscript() {
  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (line.includes("CompanyConversationalView.tsx")) {
      console.log(`Line ${lineIdx}: ${line.slice(0, 180)}`);
    }
  }
}
findInTranscript();

