const fs = require("fs");
const readline = require("readline");

async function inspectLines() {
  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (lineIdx >= 10764 && lineIdx <= 10796) {
      const obj = JSON.parse(line);
      console.log(`Line ${lineIdx}: type=${obj.type}, step=${obj.step_index}`);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          console.log(`  tool: ${tc.name}`);
          if (tc.name === "write_file") {
            fs.writeFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\extracted_conversational_from_write.tsx", tc.args.Content);
            console.log("  WROTE extracted_conversational_from_write.tsx from write_file!");
          }
        }
      }
      if (obj.content && obj.content.includes("Showing lines 1-")) {
        console.log(`  content length=${obj.content.length}`);
      }
    }
  }
}
inspectLines();

