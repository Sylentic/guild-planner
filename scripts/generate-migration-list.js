// scripts/generate-migration-list.js
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const outFile = path.join(__dirname, '../src/migration_files.json');

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql') && f !== '000_nuke.sql')
  .sort();

fs.writeFileSync(outFile, JSON.stringify(files, null, 2));
console.log('Migration file list written to', outFile);
