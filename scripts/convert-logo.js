#!/usr/bin/env node
/**
 * Genera los favicons y logo de la aplicación a partir de un logo fuente (JPG/PNG).
 *
 * Uso:
 *   node scripts/convert-logo.js [ruta-logo]
 *
 * Por defecto lee `public/logo.jpg` (1024x1024) y genera los siguientes assets
 * dentro de `public/`:
 *   - favicon.ico            (16/32/48 en un solo .ico)
 *   - apple-touch-icon.png   (180x180)
 *   - icon-192.png           (192x192)
 *   - icon-512.png           (512x512)
 *   - logo.png               (512x512, versión limpia para la UI)
 *
 * Requisito temporal: `npm install -D sharp`. El script se puede eliminar junto
 * con `sharp` una vez generados los assets (ver README).
 */

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const SOURCE = process.argv[2] || join(PUBLIC_DIR, 'logo.jpg');

async function cropSquare(input) {
    const meta = await sharp(input).metadata();
    const size = Math.min(meta.width, meta.height);

    return sharp(input).resize(size, size, { fit: 'cover' }).png();
}

async function generate(target, size, options = {}) {
    const base = await cropSquare(SOURCE);

    if (options.ico) {
        const sizes = options.ico;
        const buffers = await Promise.all(
            sizes.map((s) => base.clone().resize(s, s).toBuffer()),
        );

        await writeIco(target, buffers, sizes);

        return;
    }

    const pipeline = base.clone().resize(size, size);
    if (options.quality) {
        pipeline.jpeg({ quality: options.quality });
    }

    await pipeline.toFile(target);
}

/**
 * Genera un .ico multi-resolución (válido para 16/32/48).
 */
async function writeIco(target, buffers, sizes) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(sizes.length, 4); // count

    const entries = [];
    let offset = 6 + sizes.length * 16;

    buffers.forEach((buffer, index) => {
        const size = sizes[index];
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
        entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
        entry.writeUInt8(0, 2); // color palette
        entry.writeUInt8(0, 3); // reserved
        entry.writeUInt16LE(1, 4); // color planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(buffer.length, 8); // size
        entry.writeUInt32LE(offset, 12); // offset
        entries.push(entry);
        offset += buffer.length;
    });

    const data = Buffer.concat([header, ...entries, ...buffers]);

    await writeFile(target, data);
    console.log(`✓ ${target}`);
}

async function main() {
    console.log(`> Fuente: ${SOURCE}`);
    console.log(`> Generando assets en ${PUBLIC_DIR}\n`);

    await generate(join(PUBLIC_DIR, 'favicon.ico'), 0, { ico: [16, 32, 48] });
    await generate(join(PUBLIC_DIR, 'apple-touch-icon.png'), 180);
    await generate(join(PUBLIC_DIR, 'icon-192.png'), 192);
    await generate(join(PUBLIC_DIR, 'icon-512.png'), 512);
    await generate(join(PUBLIC_DIR, 'logo.png'), 512);

    console.log('\nListo. Favicon y logo generados.');
}

main().catch((error) => {
    console.error('Error generando assets:', error.message);
    process.exit(1);
});
