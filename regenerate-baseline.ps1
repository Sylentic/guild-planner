#!/usr/bin/env pwsh
# Regenerate baseline migration with clans→groups replacements

$ErrorActionPreference = 'Stop'

$archiveDir = './supabase/migrations_archive'
$baselinePath = './supabase/migrations/000_baseline.sql'

Write-Host "Regenerating baseline from archived migrations..." -ForegroundColor Cyan

# Get all migration files except the ones we want to skip
$files = Get-ChildItem $archiveDir -Filter '*.sql' | 
    Sort-Object Name | 
    Where-Object { 
        $_.Name -notmatch '^(000_nuke|000_baseline|046_comprehensive_clans_to_groups_migration|047_comprehensive_rls_recreation|071_fix_groups_rls_policies)\.sql$' 
    }

Write-Host "Found $($files.Count) migrations to process" -ForegroundColor Green

# Start with header
$baseline = @"
-- Baseline migration squashed from $($files.Count) migrations
-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Note: Migrations 046 and 047 excluded (clans→groups renaming already applied inline)


"@

# Process each migration file
foreach ($file in $files) {
    Write-Host "  Processing: $($file.Name)" -ForegroundColor Gray
    
    $baseline += @"

-- =====================================================
-- SOURCE: $($file.Name)
-- =====================================================

"@
    
    # Read and transform content
    $content = Get-Content $file.FullName -Raw
    
    # Apply all clan→group replacements
    $content = $content -replace '\bclans\b', 'groups'
    $content = $content -replace '\bclan_members\b', 'group_members'
    $content = $content -replace '\bclan_id\b', 'group_id'
    $content = $content -replace '\bclan_achievements\b', 'group_achievements'
    $content = $content -replace '\bclan_permission_overrides\b', 'group_permission_overrides'
    $content = $content -replace '\ballied_clan_id\b', 'allied_group_id'
    $content = $content -replace '\bleader_clan_id\b', 'leader_group_id'
    $content = $content -replace '\bcreated_by_clan\b', 'created_by_group'
    $content = $content -replace '\bgroup_webhook_url\b', 'discord_webhook_url'
    $content = $content -replace 'fk_clans_', 'fk_groups_'
    $content = $content -replace 'idx_clans_', 'idx_groups_'
    $content = $content -replace '\bidx_(\w+)_clan\b', 'idx_$1_group'
    $content = $content -replace 'clan_members_role_check', 'group_members_role_check'
    $content = $content -replace 'clan_members_clan_id_user_id_key', 'group_members_group_id_user_id_key'
    $content = $content -replace 'guest_event_rsvps_allied_clan_id', 'guest_event_rsvps_allied_group_id'
    $content = $content -replace 'user_in_clan_or_allied_clan', 'user_in_group_or_allied_group'
    $content = $content -replace 'check_clans_allied', 'check_groups_allied'
    $content = $content -replace '\bcheck_clan_id\b', 'check_group_id'
    $content = $content -replace '\bclan_a\b', 'group_a'
    $content = $content -replace '\bclan_b\b', 'group_b'
    $content = $content -replace '-- Clans table', '-- Groups table'
    $content = $content -replace '-- Clan ', '-- Group '
    $content = $content -replace 'CLANS:', 'GROUPS:'
    $content = $content -replace 'CLAN_MEMBERS:', 'GROUP_MEMBERS:'
    $content = $content -replace '\bclan managers\b', 'group managers'
    $content = $content -replace '\bAllied clan\b', 'Allied group'
    $content = $content -replace '\ballied clan\b', 'allied group'
    $content = $content -replace '\bGroup members can\b', 'Group members can'
    $content = $content -replace '\bgroup members can\b', 'group members can'
    
    # Remove DROP POLICY statements for old clan-named policies that never existed in baseline
    $content = $content -replace 'DROP POLICY IF EXISTS ".*clan.*" ON .*;\r?\n', ''
    $content = $content -replace 'DROP POLICY IF EXISTS ''.*clan.*'' ON .*;\r?\n', ''
    
    # Fix policy names that still reference "Clan"
    $content = $content -replace 'CREATE POLICY "Clan members', 'CREATE POLICY "Group members'
    $content = $content -replace 'CREATE POLICY ''Clan members', 'CREATE POLICY ''Group members'
    
    # Replace webhook and icon column names to match code expectations
    $content = $content -replace '\bguild_icon_url\b', 'group_icon_url'
    $content = $content -replace '\bdiscord_webhook_url\b', 'group_webhook_url'
    $content = $content -replace '\bdiscord_welcome_webhook_url\b', 'group_welcome_webhook_url'
    
    # Fix invalid CREATE POLICY IF NOT EXISTS syntax (PostgreSQL doesn't support this)
    $content = $content -replace 'CREATE POLICY IF NOT EXISTS', 'CREATE POLICY'
    
    # Remove duplicate column additions (sc_announcement_role_id and sc_events_role_id added in migration 054, duplicated in 062)
    $content = $content -replace 'ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_announcement_role_id TEXT;\r?\n', ''
    $content = $content -replace 'ALTER TABLE groups ADD COLUMN IF NOT EXISTS sc_events_role_id TEXT;\r?\n', ''
    
    $baseline += $content
}

# Remove duplicate CREATE POLICY statements
Write-Host "Removing duplicate policies..." -ForegroundColor Gray
$lines = $baseline -split "`n"
$seenPolicies = @{}
$deduplicatedLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Check if this is a CREATE POLICY line
    if ($line -match '^CREATE POLICY "([^"]+)"') {
        $policyName = $Matches[1]
        
        # Skip if we've already seen this policy
        if ($seenPolicies.ContainsKey($policyName)) {
            # Skip this policy and the next several lines until the closing semicolon
            while ($i -lt $lines.Count -and -not $lines[$i].TrimEnd().EndsWith(';')) {
                $i++
            }
            $i++ # Skip the line with semicolon too
            continue
        }
        
        $seenPolicies[$policyName] = $true
    }
    
    $deduplicatedLines += $line
}

$baseline = $deduplicatedLines -join "`n"

# Write to file
$baseline | Out-File -FilePath $baselinePath -Encoding UTF8 -NoNewline

Write-Host "`nBaseline regenerated successfully!" -ForegroundColor Green
Write-Host "File: $baselinePath" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round((Get-Item $baselinePath).Length / 1KB, 2)) KB" -ForegroundColor Cyan
