const fs = require('fs');
const readline = require('readline');

async function findAnyCall() {
  const fileStream = fs.createReadStream('C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('onboarding/page.tsx') || line.includes('onboarding\\\\page.tsx')) {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          console.log('Step', obj.step_index, tc.name, tc.args?.Path);
        }
      }
    }
  }
}
findAnyCall();
