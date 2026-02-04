#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !['node_modules', '.git', '.next'].includes(item)) {
      files = files.concat(walkDir(fullPath));
    } else if ((item.endsWith('.ts') || item.endsWith('.tsx')) && !item.includes('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walkDir(path.join(__dirname, '../src'));
let updated = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;

  // Replace route references from [clan] to [group]
  // Handle various URL/route patterns
  content = content.replace(/\/\[clan\]/g, '/[group]');
  content = content.replace(/\$\{clan/g, '${group');  // template literals
  content = content.replace(/`\/\[clan\]/g, '`/[group]');
  content = content.replace(/\/clan\//g, '/group/');
  content = content.replace(/\?clan=/g, '?group=');
  content = content.replace(/router\.push\([^)]*clan_id[^)]*\)/g, (match) => match.replace('clan_id', 'group_id'));
  
  // Update params from clan to group in layout/page
  content = content.replace(/params\s*:\s*{\s*clan\s*:/g, 'params: { group:');
  content = content.replace(/params\.clan\b/g, 'params.group');
  content = content.replace(/\bparams\.clan[\"']?(?!_)/g, 'params.group');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated route references in: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated with route changes: ${updated}`);
