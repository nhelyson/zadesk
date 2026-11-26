const fs = require('fs');
const path = require('path');
const sharp = require('../frontend/node_modules/sharp');

async function render() {
  const svgPath = path.resolve('scratch/zadesk_class_diagram.svg');
  const pngPath = path.resolve('scratch/zadesk_class_diagram.png');

  console.log(`Reading SVG from ${svgPath}...`);
  const svgBuffer = fs.readFileSync(svgPath);

  console.log(`Rendering PNG with Sharp at native 2800x2100...`);
  await sharp(svgBuffer)
    .png({ quality: 95 })
    .toFile(pngPath);

  const stats = fs.statSync(pngPath);
  console.log(`Rendered ${pngPath} successfully (${stats.size} bytes)`);
}

render().catch((err) => {
  console.error('Error rendering PNG:', err);
  process.exit(1);
});
