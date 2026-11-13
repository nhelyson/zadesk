const fs = require('fs');
const readline = require('readline');

async function findPreview() {
  const fileStream = fs.createReadStream('C:\\Users\\japhet\\.gemini\\antigravity\\brain\\c97ab7da-8e88-447f-b549-ed09d0cb31f6\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('write_file') && line.includes('OnboardingPreview.tsx')) {
      const obj = JSON.parse(line);
      console.log('Step', obj.step_index, 'tool_calls count:', obj.tool_calls?.length);
      for (const tc of obj.tool_calls || []) {
        if (tc.name === 'write_file' && tc.args.Path.includes('OnboardingPreview.tsx')) {
          console.log('Found write_file for OnboardingPreview at step', obj.step_index, 'Length:', tc.args.Content?.length);
          if (obj.step_index < 2800) {
            fs.writeFileSync('C:\\Users\\japhet\\Downloads\\zadesk\\scratch\\old_OnboardingPreview.tsx', tc.args.Content);
            console.log('Saved scratch/old_OnboardingPreview.tsx');
          }
        }
      }
    }
  }
}
findPreview();

