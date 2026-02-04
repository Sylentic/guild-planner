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

  // Replace remaining function names
  content = content.replace(/getUserClans/g, 'getUserGroups');
  content = content.replace(/getClanBySlug/g, 'getGroupBySlug');
  content = content.replace(/createClan\b/g, 'createGroup');
  content = content.replace(/applyToClan/g, 'applyToGroup');
  
  // Update table references in select statements
  content = content.replace(/\.from\('clans'\)/g, ".from('groups')");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated: ${updated}`);
