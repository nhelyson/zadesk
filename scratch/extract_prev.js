const fs = require('fs');
const readline = require('readline');

async function extractBeforePhase3() {
  const fileStream = fs.createReadStream('C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  const stepsToFind = [2771, 2773, 2775, 2777, 2779, 2781]; // Results of steps 2770, 2772, etc.
  let fullText = '';
  
  for await (const line of rl) {
    for (const s of stepsToFind) {
      if (line.includes(`"step_index":${s}`)) {
        const obj = JSON.parse(line);
        console.log(`Found step ${s}, content length: ${obj.content?.length}`);
        // The read_file output is formatted as "Showing lines X-Y of Z\n1: line1\n2: line2..."
        const contentLines = obj.content.split('\n');
        for (const cl of contentLines) {
          const match = cl.match(/^\d+:\s?(.*)$/);
          if (match) {
            fullText += match[1] + '\n';
          }
        }
      }
    }
  }
  
  fs.writeFileSync('C:\\Users\\japhet\\Downloads\\zadesk\\scratch\\onboarding_before_simplification.tsx', fullText);
  console.log('Saved scratch/onboarding_before_simplification.tsx, total chars:', fullText.length);
}

extractBeforePhase3();

