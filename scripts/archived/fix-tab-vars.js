#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Fix remaining clanId variable references in all tab files
const tabsDir = path.join(__dirname, '../src/app/[group]/tabs');
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(tabsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Replace clanId variable with groupId
  content = content.replace(/clanId([^=])/g, 'groupId$1');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
}

console.log('Done fixing tab variables');
