#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/[group]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const original = content;

// Replace all clanSlug with groupSlug
content = content.replace(/\bclanSlug\b/g, 'groupSlug');

// Also check for clanId and related vars
content = content.replace(/\bsetClanId\b/g, 'setGroupId');
content = content.replace(/clanId\b/g, 'groupId');

// Also check for clan variable  references that aren't clan_id
content = content.replace(/const\s+clan\s*=/g, 'const group =');
content = content.replace(/\bclan\?./g, 'group?.');

if (content !== original) {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Fixed clanSlug references in page.tsx');
}
