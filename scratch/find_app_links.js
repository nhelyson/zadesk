const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes('"/app"') || l.includes("'/app'") || l.includes('"/app/onboarding"') || l.includes("'/app/onboarding'")) {
          console.log(`${p}:${idx + 1}: ${l.trim()}`);
        }
      });
    }
  }
}

walk('frontend/src');

