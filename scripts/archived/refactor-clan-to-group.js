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

  // Replace .eq('clan_id' with .eq('group_id'
  content = content.replace(/\.eq\('clan_id'/g, ".eq('group_id'");
  
  // Replace table names from clan_* to group_*
  content = content.replace(/'clan_members'/g, "'group_members'");
  content = content.replace(/'clan_achievements'/g, "'group_achievements'");
  content = content.replace(/"clan_permission_overrides"/g, '"group_permission_overrides"');
  content = content.replace(/'clan_permission_overrides'/g, "'group_permission_overrides'");
  
  // Replace clan_id: with group_id:
  content = content.replace(/clan_id:/g, 'group_id:');
  
  // Replace syncClanAchievements function
  content = content.replace(/syncClanAchievements/g, 'syncGroupAchievements');
  
  // Replace URL/query parameter clan_id
  content = content.replace(/clan_id=/g, 'group_id=');
  content = content.replace(/\?clan_id/g, '?group_id');
  content = content.replace(/&clan_id/g, '&group_id');
  
  // Replace icon/webhook column names
  content = content.replace(/guild_icon_url/g, 'group_icon_url');
  content = content.replace(/discord_webhook_url/g, 'group_webhook_url');
  content = content.replace(/discord_welcome_webhook_url/g, 'group_welcome_webhook_url');
  
  // Replace leader_clan_id with leader_group_id
  content = content.replace(/leader_clan_id/g, 'leader_group_id');
  content = content.replace(/allied_clan_id/g, 'allied_group_id');
  
  // Replace onConflict constraints
  content = content.replace(/'clan_id,/g, "'group_id,");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated: ${file}`);
    updated++;
  }
}

console.log(`\nTotal files updated: ${updated}`);
