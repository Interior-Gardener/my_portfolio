import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logo = await sharp(join(root, "src", "assets", "brand", "kv-logo.png")).resize(420, 420).png().toBuffer();

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="76%" cy="50%" r="48%">
      <stop offset="0" stop-color="#f2b544" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#060609" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ocean" cx="12%" cy="100%" r="70%">
      <stop offset="0" stop-color="#0e1a2b" stop-opacity="1"/>
      <stop offset="1" stop-color="#060609" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#060609"/>
  <rect width="1200" height="630" fill="url(#ocean)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="909" cy="315" r="226" fill="none" stroke="#f2b544" stroke-opacity="0.45" stroke-width="2"/>
  <text x="72" y="150" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="6" fill="#f2b544">BUILDING IDEAS. CREATING IMPACT.</text>
  <text x="66" y="290" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="104" font-weight="900" letter-spacing="-4" fill="#f2ede4">Kartik</text>
  <text x="66" y="394" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="104" font-weight="900" letter-spacing="-4" fill="#f2ede4">Verma</text>
  <text x="72" y="452" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#cfc7ba">Software engineer · AI/ML · Mumbai</text>
  <rect x="72" y="500" width="150" height="42" rx="21" fill="#f2b544"/>
  <text x="147" y="528" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#060609">GeoSwipe</text>
  <rect x="234" y="500" width="120" height="42" rx="21" fill="none" stroke="#f2ede4" stroke-opacity="0.35"/>
  <text x="294" y="528" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#f2ede4">Atomix</text>
  <rect x="366" y="500" width="214" height="42" rx="21" fill="none" stroke="#f2ede4" stroke-opacity="0.35"/>
  <text x="473" y="528" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#f2ede4">Hospital Ops Sync</text>
</svg>`;

const png = await sharp(Buffer.from(background))
  .composite([{ input: logo, left: 699, top: 105 }])
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(png).toFile(join(root, "public", "og.png"));
console.log(`[og] wrote public/og.png (${Math.round(png.length / 1024)} KB)`);
