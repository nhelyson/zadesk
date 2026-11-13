const fs = require("fs");
const readline = require("readline");

async function extractPrevious() {
  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    // We saw line 10874 / 10875
    if (lineIdx >= 10870 && lineIdx <= 10880) {
      const obj = JSON.parse(line);
      console.log(`Line ${lineIdx}, type: ${obj.type}, step: ${obj.step_index}`);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          console.log(`  tool: ${tc.name}`, tc.args?.Path || "");
        }
      }
      if (obj.content && obj.content.includes("Showing lines")) {
        console.log(`  content snippet: ${obj.content.slice(0, 300)}`);
      }
    }
  }
}
extractPrevious();

