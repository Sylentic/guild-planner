#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const componentsToFix = [
  'src/components/RecruitmentSettings.tsx',
  'src/components/PermissionsSettings.tsx', 
  'src/components/ClanSettings.tsx',
  'src/components/PublicClanEventsView.tsx'
];

for (const filePath of componentsToFix) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Replace clanSlug prop with groupSlug in interfaces
  content = content.replace(/clanSlug\?:\s*string/g, 'groupSlug?: string');
  
  // Replace in component function destructuring
  content = content.replace(/clanSlug,/g, 'groupSlug,');
  
  // Replace references to clanSlug variable
  content = content.replace(/\bclanSlug\b/g, 'groupSlug');

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Updated: ${filePath}`);
}

console.log('Done fixing component props');
