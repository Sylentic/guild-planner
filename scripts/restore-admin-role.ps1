#!/usr/bin/env pwsh
# Restore admin role for a Discord user in a specific group
# Usage: .\restore-admin-role.ps1 -DiscordId "679287061039284235" -GroupSlug "your-guild-slug"

param(
  [Parameter(Mandatory=$true)]
  [string]$DiscordId,
  
  [Parameter(Mandatory=$true)]
  [string]$GroupSlug,
  
  [string]$Environment = "prod"
)

$ErrorActionPreference = "Stop"

function Import-EnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    throw "Env file not found: $Path"
  }
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $parts = $line -split '=', 2
    if ($parts.Count -ne 2) { return }
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

# Load environment
$envFile = if ($Environment -eq "prod") { ".env.local" } else { ".env.local.dev" }
Write-Host "Loading environment from $envFile..." -ForegroundColor Cyan

if (-not (Test-Path $envFile)) {
  throw "Env file not found: $envFile"
}

Import-EnvFile $envFile

# Validate required env vars
$supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL")
$serviceRoleKey = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY")

if (-not $supabaseUrl -or -not $serviceRoleKey) {
  throw "Missing Supabase credentials in $envFile`nRequired: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
}

Write-Host "Using Supabase URL: $supabaseUrl" -ForegroundColor Cyan

# Install required PowerShell module for REST calls
if (-not (Get-Module -ListAvailable -Name "PSHttpClientTools" -ErrorAction SilentlyContinue)) {
  Write-Host "Installing required modules..." -ForegroundColor Yellow
}

# Use Invoke-RestMethod to call Supabase REST API
$headers = @{
  "Authorization" = "Bearer $serviceRoleKey"
  "Content-Type" = "application/json"
  "apikey" = $serviceRoleKey
}

try {
  Write-Host "Getting user by Discord ID: $DiscordId" -ForegroundColor Cyan
  
  $userResponse = Invoke-RestMethod `
    -Uri "$supabaseUrl/rest/v1/users?discord_id=eq.$DiscordId" `
    -Headers $headers `
    -Method GET
  
  if ($userResponse.Count -eq 0) {
    throw "No user found with Discord ID: $DiscordId"
  }
  
  $userId = $userResponse[0].id
  Write-Host "Found user: $($userResponse[0].display_name) (ID: $userId)" -ForegroundColor Green
  
  Write-Host "Getting group by slug: $GroupSlug" -ForegroundColor Cyan
  
  $groupResponse = Invoke-RestMethod `
    -Uri "$supabaseUrl/rest/v1/groups?slug=eq.$GroupSlug" `
    -Headers $headers `
    -Method GET
  
  if ($groupResponse.Count -eq 0) {
    throw "No group found with slug: $GroupSlug"
  }
  
  $groupId = $groupResponse[0].id
  Write-Host "Found group: $($groupResponse[0].name) (ID: $groupId)" -ForegroundColor Green
  
  Write-Host "Updating user role to admin..." -ForegroundColor Cyan
  
  $updatePayload = @{
    role = "admin"
  } | ConvertTo-Json
  
  $null = Invoke-RestMethod `
    -Uri "$supabaseUrl/rest/v1/group_members?user_id=eq.$userId&group_id=eq.$groupId" `
    -Headers $headers `
    -Method PATCH `
    -Body $updatePayload
  
  Write-Host "✓ Successfully updated role to admin!" -ForegroundColor Green
  Write-Host "User $DiscordId is now an admin of $GroupSlug"
  
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
  Write-Host "Make sure:" -ForegroundColor Yellow
  Write-Host "  1. Discord ID is correct: $DiscordId"
  Write-Host "  2. Group slug is correct: $GroupSlug"
  Write-Host "  3. You have the correct environment loaded ($Environment)"
  exit 1
}
