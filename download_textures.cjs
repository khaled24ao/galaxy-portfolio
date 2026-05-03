const https = require('https');
const fs = require('fs');
const path = require('path');

const texturesDir = path.join(__dirname, 'public', 'textures');

if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

const filesToDownload = [
  { url: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', name: 'earth_albedo.jpg' },
  { url: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg', name: 'earth_normal.jpg' },
  { url: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg', name: 'earth_specular.jpg' },
  { url: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png', name: 'earth_clouds.png' },
  { url: 'https://threejs.org/examples/textures/planets/moon_1024.jpg', name: 'moon_albedo.jpg' },
  { url: 'https://threejs.org/examples/textures/planets/mars_1k_color.jpg', name: 'mars_albedo.jpg' },
  { url: 'https://threejs.org/examples/textures/planets/jupiter.jpg', name: 'jupiter_albedo.jpg' },
  { url: 'https://threejs.org/examples/textures/lava/lavatile.jpg', name: 'sun_surface.jpg' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${dest}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size < 100) {
            fs.unlinkSync(dest);
            reject(new Error(`File too small: ${dest}`));
          } else {
            resolve();
          }
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const file of filesToDownload) {
    const dest = path.join(texturesDir, file.name);
    // Always redownload if file is tiny
    const exists = fs.existsSync(dest);
    const size = exists ? fs.statSync(dest).size : 0;
    
    if (!exists || size < 100) {
      try {
        await downloadFile(file.url, dest);
        console.log(`Success: ${file.name}`);
      } catch (err) {
        console.error(`Failed to download ${file.name}:`, err.message);
      }
    } else {
      console.log(`Already exists and valid: ${file.name}`);
    }
  }
  console.log('All downloads completed.');
}

main();
