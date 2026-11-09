import fs from 'fs';
import zlib from 'zlib';

// Minimal PNG encoder for solid/gradient icons in pure Node (no external dependencies)
function createPNG(width, height, colorFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crc.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  // Table-based CRC32
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Vampiee Brand Icon generator (Crimson to Obsidian radial glow with cute bat silhouette)
function vampieeColor(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background circle
  if (dist > 0.95) return [9, 10, 16, 255];

  // Head/Body center
  const bodyDist = Math.sqrt(dx * dx + (dy - 0.1) * (dy - 0.1));
  if (bodyDist < 0.45) {
    // Eye positions
    const leftEye = Math.sqrt((dx + 0.15) * (dx + 0.15) + (dy - 0.05) * (dy - 0.05));
    const rightEye = Math.sqrt((dx - 0.15) * (dx - 0.15) + (dy - 0.05) * (dy - 0.05));
    if (leftEye < 0.08 || rightEye < 0.08) {
      return [253, 164, 175, 255]; // Bright rose eyes
    }
    return [59, 7, 100, 255]; // Purple body
  }

  // Bat wings
  if (Math.abs(dx) > 0.35 && Math.abs(dx) < 0.85 && dy > -0.2 && dy < 0.35) {
    return [225, 29, 72, 255]; // Rose-red wings
  }

  // Background radial glow
  const glow = Math.max(0, 1 - dist);
  const r = Math.floor(9 + glow * 180);
  const g = Math.floor(10 + glow * 20);
  const b = Math.floor(16 + glow * 60);
  return [r, g, b, 255];
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, vampieeColor));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, vampieeColor));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, vampieeColor));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, vampieeColor));

console.log('Generated PWA icon PNGs successfully.');
