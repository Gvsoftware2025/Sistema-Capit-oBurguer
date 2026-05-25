import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const logoPath = join(publicDir, 'logo-capitao-burguer.jpeg');

async function generateIcons() {
  console.log('Gerando icones...');
  
  // Icon 192x192
  await sharp(logoPath)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'icons', 'icon-192x192.png'));
  console.log('icon-192x192.png criado');
  
  // Icon 512x512
  await sharp(logoPath)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'icons', 'icon-512x512.png'));
  console.log('icon-512x512.png criado');
  
  // Apple icon
  await sharp(logoPath)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'apple-icon.png'));
  console.log('apple-icon.png criado');
  
  // Favicon 32x32
  await sharp(logoPath)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'));
  console.log('favicon-32x32.png criado');
  
  // Icon 192 na raiz
  await sharp(logoPath)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  console.log('icon-192.png criado');
  
  // Icon 512 na raiz
  await sharp(logoPath)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'icon-512.png'));
  console.log('icon-512.png criado');
  
  // Maskable icon (com padding para safe area)
  await sharp(logoPath)
    .resize(400, 400, { fit: 'cover' })
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile(join(publicDir, 'icon-maskable-512.png'));
  console.log('icon-maskable-512.png criado');
  
  console.log('Todos os icones gerados!');
}

generateIcons().catch(console.error);
