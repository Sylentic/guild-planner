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

  // Fix function name imports
  content = content.replace(/\bcreateGroup\b/g, 'createGroup');  // ensure it's correct spelling
  content = content.replace(/import\s+{\s*createClan/g, 'import { createGroup');
  content = content.replace(/,\s*createClan\s*,/g, ', createGroup,');
  content = content.replace(/,\s*createClan\s*}/g, ', createGroup}');
  
  // Replace getClanBySlug with getGroupBySlug or keep as is if it exists
  // First check if we need to rename it - for now, leave getClanBySlug as it's for slug-based lookup
  
  // Fix params references in page components
  // from: params: Promise<{ clan: string }>
  // to: params: Promise<{ group: string }>
  content = content.replace(/params\s*:\s*Promise\s*<\s*{\s*clan\s*:\s*string\s*}>/g, 'params: Promise<{ group: string }>');
  
  // Fix const destructuring from params
  // from: const { clan: clanSlug } = use(params);
  // to: const { group: groupSlug } = use(params);
  content = content.replace(/const\s+{\s*clan\s*:\s*clanSlug\s*}\s*=\s*use\(params\)/g, 'const { group: groupSlug } = use(params)');
  
  // Update variable usage
  content = content.replace(/\bclanSlug\b/g, 'groupSlug');
  
  // Fix setClanId to setGroupId
  content = content.replace(/setClanId/g, 'setGroupId');
  content = content.replace(/const\s+\[\s*groupId\s*,\s*setClanId/g, 'const [ groupId, setGroupId');
  
  // Fix getClanBySlug call - rename to getGroupBySlug
  content = content.replace(/getClanBySlug\(/g, 'getGroupBySlug(');
  content = content.replace(/import\s*{\s*.*getClanBySlug/g, (match) => match.replace('getClanBySlug', 'getGroupBySlug'));

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated: ${updated}`);
