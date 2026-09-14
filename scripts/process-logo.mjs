import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "brand-source", "kv-logo.png");

const { width = 0, height = 0 } = await sharp(source).metadata();
const size = Math.min(width, height);
const radius = size / 2 - Math.round(size * 0.012);
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#fff"/></svg>`,
);

const circle = await sharp(source)
  .resize(size, size, { fit: "cover" })
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

await mkdir(join(root, "src", "assets", "brand"), { recursive: true });
await sharp(circle).resize(1024, 1024).png({ compressionLevel: 9 }).toFile(join(root, "src", "assets", "brand", "kv-logo.png"));

for (const [name, px] of [
  ["favicon-32.png", 32],
  ["favicon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await sharp(circle).resize(px, px).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(root, "public", name));
}

const touchIcon = await sharp(circle).resize(164, 164).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: "#060609" } })
  .composite([{ input: touchIcon, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(join(root, "public", "apple-touch-icon.png"));

console.log(`[brand] circular logo + icons generated from ${size}px source`);
