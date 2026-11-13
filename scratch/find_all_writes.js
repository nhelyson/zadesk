const fs = require("fs");
const readline = require("readline");

async function findWrites() {
  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  for await (const line of rl) {
    lineIdx++;
    if (line.includes("CompanyConversationalView.tsx") && line.includes('"name":"write_file"')) {
      const obj = JSON.parse(line);
      for (const tc of obj.tool_calls || []) {
        if (tc.name === "write_file" && tc.args.Path.includes("CompanyConversationalView.tsx")) {
          console.log(`Found write_file at line ${lineIdx}, step ${obj.step_index}`);
          fs.writeFileSync(`c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\conversational_step_${obj.step_index}.tsx`, tc.args.Content);
        }
      }
    }
  }
}
findWrites();

