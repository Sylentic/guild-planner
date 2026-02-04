#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const renames = [
  { from: 'useClanData.ts', to: 'useGroupData.ts' },
  { from: 'useClanMembership.ts', to: 'useGroupMembership.ts' }
];

const hooksDir = path.join(__dirname, '../src/hooks');

for (const rename of renames) {
  const oldPath = path.join(hooksDir, rename.from);
  const newPath = path.join(hooksDir, rename.to);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${rename.from} → ${rename.to}`);
  }
}

// Update all imports across the codebase
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

  // Update imports for renamed hooks
  content = content.replace(/from ['"].*\/useClanData['"]/g, (match) => match.replace('useClanData', 'useGroupData'));
  content = content.replace(/from ['"].*\/useClanMembership['"]/g, (match) => match.replace('useClanMembership', 'useGroupMembership'));

  // Update hook imports if they contain the path
  content = content.replace(/import\s*{.*useClanData.*}/g, (match) => match.replace('useClanData', 'useGroupData'));
  content = content.replace(/import\s*{.*useClanMembership.*}/g, (match) => match.replace('useClanMembership', 'useGroupMembership'));

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated imports in: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated with new import paths: ${updated}`);
