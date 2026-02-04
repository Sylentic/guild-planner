/**
 * Script to download Star Citizen manufacturer logos locally
 * Run with: node scripts/download-manufacturer-logos.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create logos directory
const logosDir = path.join(__dirname, '../public/images/manufacturers');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
  console.log(`Created directory: ${logosDir}`);
}

// Manufacturer logos mapping
const manufacturerLogos = {
  'Aegis Dynamics': 'https://robertsspaceindustries.com/media/z4ioxeze11o3hr/logo/Aegis_Logo.png',
  'Anvil Aerospace': 'https://robertsspaceindustries.com/media/txhzevx6s17m4r/logo/Anvil_Logo.png',
  'Aopoa': 'https://robertsspaceindustries.com/media/m7xgd8eghus4ar/logo/Aopoa_Logo.png',
  'Argo Astronautics': 'https://robertsspaceindustries.com/media/mfvgeneqcc7khr/logo/ARGO_Logo.png',
  'Banu': 'https://robertsspaceindustries.com/media/oqf2g7g7t3ttar/logo/Banu_Logo.png',
  'Banu Souli': 'https://robertsspaceindustries.com/media/oqf2g7g7t3ttar/logo/Banu_Logo.png',
  'Consolidated Outland': 'https://robertsspaceindustries.com/media/5ubymzqrfp20gr/logo/CO_Logo.png',
  'Crusader Industries': 'https://robertsspaceindustries.com/media/qcdj1phfyctc6r/logo/Crusader_Logo.png',
  'Drake Interplanetary': 'https://robertsspaceindustries.com/media/2g62ywllvk2f1r/logo/Drake_logo.png',
  'Esperia': 'https://robertsspaceindustries.com/media/kkad2w34u0ejir/logo/Esperia_Logo.png',
  'Gatac Manufacture': 'https://robertsspaceindustries.com/media/2wifj4j8q1mdpr/logo/Gatac_Logo.png',
  'Greycat Industrial': 'https://robertsspaceindustries.com/media/k8vsj8oo0e6iir/logo/Greycat_Logo.png',
  "Grey's Market": 'https://cdn.robertsspaceindustries.com/orion-v3/logoratios/greysmarket_monochrome_completed_2_1-43d53201.svg',
  'Kruger Intergalactic': 'https://robertsspaceindustries.com/media/7duwvqqr0s5p3r/logo/Kruger_logo.png',
  'MISC': 'https://robertsspaceindustries.com/media/0bfruuxq5n1mor/logo/MISC_Logo.png',
  'Mirai': 'https://robertsspaceindustries.com/media/epkp1tquy1xrir/logo/Mirai_logo.png',
  'Origin Jumpworks': 'https://robertsspaceindustries.com/media/h0pqev5c00j70r/logo/ORIG_Logo.png',
  'Roberts Space Industries': 'https://robertsspaceindustries.com/media/c5v6y3t8e5yphr/logo/RSI_Logo.png',
  'RSI': 'https://robertsspaceindustries.com/media/c5v6y3t8e5yphr/logo/RSI_Logo.png',
  'Tumbril': 'https://robertsspaceindustries.com/media/g49sf4h2yvdrer/logo/Tumbril_Logo.png',
  'Tumbril Land Systems': 'https://robertsspaceindustries.com/media/g49sf4h2yvdrer/logo/Tumbril_Logo.png',
  'Vanduul': 'https://robertsspaceindustries.com/media/s6a5p3z7ek5lar/logo/Vanduul_Logo.png',
  "Xi'an": 'https://robertsspaceindustries.com/media/m7xgd8eghus4ar/logo/Aopoa_Logo.png',
};

// Download a single file
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(logosDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Generate filename from URL
function getFilename(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = pathname.split('/').pop() || 'logo.png';
  return filename;
}

// Download all logos
async function downloadAllLogos() {
  console.log('Starting logo downloads...\n');
  
  const uniqueUrls = [...new Set(Object.values(manufacturerLogos))];
  const results = {};

  for (const url of uniqueUrls) {
    const filename = getFilename(url);
    const relativePath = `/images/manufacturers/${filename}`;
    
    try {
      await downloadFile(url, filename);
      console.log(`✅ Downloaded: ${filename}`);
      results[url] = relativePath;
    } catch (error) {
      console.error(`❌ Failed to download ${filename}:`, error.message);
      results[url] = url; // Fall back to original URL
    }
  }

  // Update manufacturer JSON with local paths
  const shipsFile = path.join(__dirname, '../src/config/games/star-citizen-ships.json');
  const manufacturersFile = path.join(__dirname, '../src/config/games/star-citizen-manufacturers.json');
  
  const manufacturersData = JSON.parse(fs.readFileSync(manufacturersFile, 'utf8'));
  
  manufacturersData.manufacturers = manufacturersData.manufacturers.map(mfg => ({
    ...mfg,
    logo: mfg.logo ? results[mfg.logo] || mfg.logo : null
  }));

  fs.writeFileSync(manufacturersFile, JSON.stringify(manufacturersData, null, 2));
  console.log(`\n✅ Updated ${manufacturersFile}`);
  
  console.log('\n📊 Summary:');
  console.log(`   Total logos: ${uniqueUrls.length}`);
  console.log(`   Downloaded: ${Object.values(results).filter(v => v.startsWith('/')).length}`);
  console.log(`   Failed: ${Object.values(results).filter(v => v.startsWith('http')).length}`);
}

downloadAllLogos().catch(console.error);
