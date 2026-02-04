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

  // Replace useClanData with useGroupData (imports and function names)
  content = content.replace(/useClanData/g, 'useGroupData');
  content = content.replace(/from ['"].*\/useClanData['"]/g, (match) => match.replace('useClanData', 'useGroupData'));
  
  // Replace variable names: clanData with groupData
  content = content.replace(/const\s+clanData\s*=/g, 'const groupData =');
  content = content.replace(/clanData\./g, 'groupData.');
  content = content.replace(/useClanMembership/g, 'useGroupMembership');
  
  // Replace function parameters and variables
  content = content.replace(/clanId\s*\?/g, 'groupId ?');
  content = content.replace(/clanId,/g, 'groupId,');
  content = content.replace(/clanId\)/g, 'groupId)');
  content = content.replace(/clanId\s*:/g, 'groupId:');
  content = content.replace(/clanId\s*=\s*clanId/g, 'groupId = groupId');
  
  // Replace function names with clan in them
  content = content.replace(/function\s+getClanById/g, 'function getGroupById');
  content = content.replace(/getClanById\(/g, 'getGroupById(');
  content = content.replace(/getClanMembers/g, 'getGroupMembers');
  content = content.replace(/createClan\(/g, 'createGroup(');
  content = content.replace(/updateClan\(/g, 'updateGroup(');
  content = content.replace(/deleteClan\(/g, 'deleteGroup(');
  
  // Replace variable names like clan (not clan_id)
  // This is tricky - only replace 'clan' when it's a standalone variable, not part of clan_id
  content = content.replace(/const\s+clan\s*=/g, 'const group =');
  content = content.replace(/clan\?\.(?!_id)/g, 'group?.');
  content = content.replace(/:clan\b(?!_)/g, ':group');
  content = content.replace(/\(clan\)/g, '(group)');
  content = content.replace(/\(clan,/g, '(group,');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated: ${updated}`);
