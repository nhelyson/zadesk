const fs = require("fs");
const readline = require("readline");

async function replayModalEdits() {
  let content = fs.readFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\modal_step_1149.tsx", "utf8");

  const p = "C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl";
  const fileStream = fs.createReadStream(p);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineIdx = 0;
  let editsCount = 0;

  for await (const line of rl) {
    lineIdx++;
    if (lineIdx > 1150 && lineIdx < 10800) {
      if (line.includes("CompanyInfoBubbleModal.tsx") && line.includes('"name":"edit_file"')) {
        const obj = JSON.parse(line);
        for (const tc of obj.tool_calls || []) {
          if (tc.name === "edit_file" && tc.args.Path.includes("CompanyInfoBubbleModal.tsx")) {
            const { Target, Replacement } = tc.args;
            if (content.includes(Target)) {
              content = content.replace(Target, Replacement);
              editsCount++;
              console.log(`Applied modal edit at line ${lineIdx}, step ${obj.step_index}`);
            } else {
              console.warn(`Target not found for modal edit at line ${lineIdx}, step ${obj.step_index}!`);
            }
          }
        }
      }
    }
  }

  console.log(`Replayed ${editsCount} modal edits.`);
  fs.writeFileSync("c:\\Users\\japhet\\Downloads\\zadesk\\scratch\\modal_before_user_prompt.tsx", content);
  console.log("Saved to modal_before_user_prompt.tsx!");
}

replayModalEdits();

