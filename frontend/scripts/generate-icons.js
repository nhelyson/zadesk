const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "../public/zadesk-icon.svg");
const iconsDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read raw SVG
const svgBuffer = fs.readFileSync(svgPath);

// Create SVG with background for maskable icon
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#0D1B3D" rx="20"/>
  <g transform="translate(15, 15) scale(0.70)">
    <!-- Outer Circle Arc with opening at top-right for star -->
    <path 
      d="M 68 18 A 38 38 0 1 0 85 45" 
      stroke="#FFFFFF" 
      stroke-width="5" 
      stroke-linecap="round"
    />
    
    <!-- AI Star Sparkle (Emerald Green) at top-right -->
    <path 
      d="M 80 12 Q 80 20 88 20 Q 80 20 80 28 Q 80 20 72 20 Q 80 20 80 12 Z" 
      fill="#22C55E" 
    />
    
    <!-- Geometric Z (White Top and Upper Diagonal) -->
    <path 
      d="M 32 38 L 68 38 L 48 64" 
      stroke="#FFFFFF" 
      stroke-width="6.5" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
    
    <!-- Emerald Green Lower Diagonal Accent Stroke -->
    <path 
      d="M 28 68 L 72 68" 
      stroke="#22C55E" 
      stroke-width="6.5" 
      stroke-linecap="round"
    />
    <path 
      d="M 28 68 L 42 50" 
      stroke="#22C55E" 
      stroke-width="6.5" 
      stroke-linecap="round"
    />
  </g>
</svg>
`;

async function generateIcons() {
  console.log("Generating PWA icons...");

  // Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192x192.png"));
  console.log("✓ Generated icon-192x192.png");

  // Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512x512.png"));
  console.log("✓ Generated icon-512x512.png");

  // Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "maskable-icon-512x512.png"));
  console.log("✓ Generated maskable-icon-512x512.png");

  // Apple Touch Icon 180x180
  await sharp(Buffer.from(maskableSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png");

  // Favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, "favicon-32x32.png"));
  console.log("✓ Generated favicon-32x32.png");

  // Favicon 16x16
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(iconsDir, "favicon-16x16.png"));
  console.log("✓ Generated favicon-16x16.png");

  console.log("All PWA icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
