import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_LOGO = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Logofa.st inspired clean logo -->
  <rect width="512" height="512" rx="120" fill="#2563eb" />
  <path d="M160 360V160L256 256L352 160V360" stroke="white" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
`;

const PUBLIC_DIR = path.resolve('./public');
const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
  }

  // Write SVG logo
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.svg'), SVG_LOGO);

  const svgBuffer = Buffer.from(SVG_LOGO);

  // Generate PNGs
  for (const { name, size } of SIZES) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC_DIR, name));
    console.log(`Generated ${name}`);
  }

  // Generate favicon.ico (using 32x32 size for simplicity, though normally a true .ico contains multiple)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat('png') // simple png renaming works for modern browsers, or we just rely on standard PNGs
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // Generate site.webmanifest
  const manifest = {
    name: "MergeMaster - Free PDF Editor",
    short_name: "MergeMaster",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone"
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Generated site.webmanifest');
}

generateFavicons().catch(console.error);
