/**
 * Script to fetch Star Citizen manufacturer logos from RSI website
 * Run with: node scripts/fetch-manufacturer-logos.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/config/games/star-citizen-manufacturers.json');
const SHIPS_FILE = path.join(__dirname, '../src/config/games/star-citizen-ships.json');

// Read existing ships data to get all unique manufacturers
const shipsData = JSON.parse(fs.readFileSync(SHIPS_FILE, 'utf8'));
const manufacturers = [...new Set(shipsData.ships.map(ship => ship.manufacturer))].sort();

console.log(`Found ${manufacturers.length} unique manufacturers`);
console.log('Manufacturers:', manufacturers);

// Manufacturer code to logo URL mapping (based on RSI website structure)
// These logos are from the ship matrix page
const manufacturerLogos = {
  'Aegis Dynamics': 'https://robertsspaceindustries.com/media/z4ioxeze11o3hr/logo/Aegis_Logo.png',
  'Anvil Aerospace': 'https://robertsspaceindustries.com/media/txhzevx6s17m4r/logo/Anvil_Logo.png',
  'Argo Astronautics': 'https://robertsspaceindustries.com/media/mfvgeneqcc7khr/logo/ARGO_Logo.png',
  'Aopoa': 'https://robertsspaceindustries.com/media/m7xgd8eghus4ar/logo/Aopoa_Logo.png',
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
  'Xi\'an': 'https://robertsspaceindustries.com/media/m7xgd8eghus4ar/logo/Aopoa_Logo.png', // Uses Aopoa logo
};

// Create manufacturers data structure
const manufacturersData = {
  lastUpdated: new Date().toISOString(),
  source: 'https://robertsspaceindustries.com/ship-matrix',
  manufacturers: manufacturers.map(name => ({
    name,
    logo: manufacturerLogos[name] || null,
    code: shipsData.ships.find(s => s.manufacturer === name)?.manufacturerCode || null
  }))
};

// Add note for missing logos
const missingLogos = manufacturersData.manufacturers.filter(m => !m.logo);
if (missingLogos.length > 0) {
  console.log('\n⚠️  Missing logos for manufacturers:');
  missingLogos.forEach(m => console.log(`   - ${m.name}`));
  console.log('\nPlease manually find and add these logo URLs');
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manufacturersData, null, 2));
console.log(`\n✅ Manufacturer data written to ${OUTPUT_FILE}`);
console.log(`   Total manufacturers: ${manufacturersData.manufacturers.length}`);
console.log(`   With logos: ${manufacturersData.manufacturers.filter(m => m.logo).length}`);
