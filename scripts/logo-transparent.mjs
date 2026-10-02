/**
 * The brand logo is stored as a JPEG, so its white background is baked into the
 * pixels and no stylesheet can remove it - on the navy footer it renders as a
 * white plate. This rebuilds it as a transparent PNG, and also derives a
 * "reverse" cut whose navy/black ink is knocked out to white so the mark stays
 * legible on #06254a (navy ink on navy would otherwise disappear).
 *
 * Red and green are left untouched so the brand colours survive.
 *
 * Run: node scripts/logo-transparent.mjs [baseUrl]
 */
import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://localhost:3100";
const SIZE = 512;
const OUT = new URL("../public/images/", import.meta.url);

const res = await fetch(`${BASE}/api/cms`);
if (!res.ok) throw new Error(`cms request failed: ${res.status}`);
const { branding } = await res.json();
const logo = branding?.logoUrl ?? "";
if (!logo.startsWith("data:image/")) throw new Error("no uploaded logo data URL");

const input = Buffer.from(logo.slice(logo.indexOf(",") + 1), "base64");
const { data, info } = await sharp(input)
  .resize(SIZE, SIZE, { fit: "inside" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = Buffer.from(data);
const full = Buffer.from(px);

for (let i = 0; i < px.length; i += 4) {
  const r = px[i], g = px[i + 1], b = px[i + 2];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;

  // White -> transparent; 225..245 feathers the anti-aliased edge so type does
  // not collect a white halo against navy.
  let a = 1;
  if (lum >= 245) a = 0;
  else if (lum > 225) a = (245 - lum) / 20;

  if (a === 0) {
    px[i + 3] = 0;
    full[i + 3] = 0;
    continue;
  }
  if (a < 1) {
    // Undo the "drawn over white" blend to recover the true ink colour.
    for (let c = 0; c < 3; c++) {
      const t = (px[i + c] - (1 - a) * 255) / a;
      px[i + c] = full[i + c] = Math.max(0, Math.min(255, t));
    }
  }
  px[i + 3] = full[i + 3] = Math.round(a * 255);
}

// Reverse cut: everything that is not red or green becomes white.
const rev = Buffer.from(full);
for (let i = 0; i < rev.length; i += 4) {
  if (rev[i + 3] === 0) continue;
  const r = rev[i], g = rev[i + 1], b = rev[i + 2];
  const isRed = r > 120 && r > g + 40 && r > b + 40;
  const isGreen = g > 100 && g > r + 40 && g > b + 30;
  if (!isRed && !isGreen) rev[i] = rev[i + 1] = rev[i + 2] = 255;
}

await mkdir(OUT, { recursive: true });
const opts = { raw: { ...info, channels: 4 } };
const a = await sharp(full, opts).png({ compressionLevel: 9 }).toBuffer();
const b2 = await sharp(rev, opts).png({ compressionLevel: 9 }).toBuffer();
await writeFile(new URL("logo.png", OUT), a);
await writeFile(new URL("logo-reverse.png", OUT), b2);

console.log(`size   : ${info.width}x${info.height}`);
console.log(`logo.png         ${Math.round(a.length / 1024)} KB  (full colour, transparent)`);
console.log(`logo-reverse.png ${Math.round(b2.length / 1024)} KB  (white ink for navy)`);
