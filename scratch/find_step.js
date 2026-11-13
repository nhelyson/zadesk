const fs = require('fs');
const readline = require('readline');

async function findStepFull() {
  const fileStream = fs.createReadStream('C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"step_index":2771')) {
      const obj = JSON.parse(line);
      console.log('Step 2771 full length:', obj.content ? obj.content.length : 0);
      fs.writeFileSync('C:\\Users\\japhet\\Downloads\\zadesk\\scratch\\step_2771.txt', obj.content);
      console.log('Wrote scratch/step_2771.txt');
      break;
    }
  }
}
findStepFull();
