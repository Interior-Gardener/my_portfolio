import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const dots = [];
for (let y = 24; y < 630; y += 30) {
  for (let x = 24; x < 1200; x += 30) {
    const dx = x - 930;
    const dy = y - 170;
    const glow = Math.max(0, 1 - Math.hypot(dx, dy) / 360);
    const r = (1.1 + glow * 2.2).toFixed(2);
    const fill = glow > 0.08 ? `rgba(205,251,69,${(0.25 + glow * 0.75).toFixed(2)})` : "rgba(236,238,241,0.12)";
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`);
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="78%" cy="22%" r="55%">
      <stop offset="0" stop-color="#cdfb45" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#07080a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#07080a"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  ${dots.join("")}
  <rect x="72" y="72" width="64" height="64" rx="32" fill="#eceef1"/>
  <text x="104" y="114" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#07080a">KV</text>
  <circle cx="126" cy="82" r="8" fill="#cdfb45"/>
  <rect x="160" y="84" width="330" height="40" rx="20" fill="none" stroke="rgba(236,238,241,0.25)"/>
  <circle cx="184" cy="104" r="6" fill="#cdfb45"/>
  <text x="200" y="110" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#eceef1">Open to software &amp; ML internships</text>
  <text x="66" y="360" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="132" font-weight="900" letter-spacing="-6" fill="#eceef1">Kartik Verma</text>
  <text x="72" y="430" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#c3c8cf">Software engineer building interactive, AI-powered systems</text>
  <rect x="72" y="490" width="170" height="44" rx="22" fill="#cdfb45"/>
  <text x="157" y="519" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#07080a">GeoSwipe</text>
  <rect x="254" y="490" width="140" height="44" rx="22" fill="none" stroke="rgba(236,238,241,0.3)"/>
  <text x="324" y="519" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#eceef1">Atomix</text>
  <rect x="406" y="490" width="236" height="44" rx="22" fill="none" stroke="rgba(236,238,241,0.3)"/>
  <text x="524" y="519" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#eceef1">Hospital Ops Sync</text>
  <text x="1128" y="566" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#8b919a">Mumbai, India</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(join(root, "public", "og.png"), png);
console.log(`[og] wrote public/og.png (${Math.round(png.length / 1024)} KB)`);
