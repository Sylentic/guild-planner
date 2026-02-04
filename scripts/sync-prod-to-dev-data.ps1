#!/usr/bin/env pwsh
# Sync production data into dev using data-only dump/restore.
# Assumes switch-env.ps1 updates .env.local for prod/dev.

param(
  [string]$DumpFile = ".tmp/prod-data.sql",
  [switch]$ResetDev
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

function Get-DbUrl {
  $candidates = @('DATABASE_URL', 'SUPABASE_DB_URL', 'SUPABASE_DB_CONNECTION')
  foreach ($key in $candidates) {
    $val = [Environment]::GetEnvironmentVariable($key, "Process")
    if ($val) { return $val }
  }
  return $null
}

function Ensure-Psql {
  if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql not found in PATH. Install PostgreSQL client tools or add psql to PATH."
  }
}

# 1) Switch to prod and dump data
Write-Host "Switching to prod environment..." -ForegroundColor Cyan
./switch-env.ps1 -Environment prod | Out-Null
Import-EnvFile ".env.local"
$prodDbUrl = Get-DbUrl
if (-not $prodDbUrl) { throw "Could not find a database URL in .env.local" }

$dumpDir = Split-Path $DumpFile -Parent
if ($dumpDir -and -not (Test-Path $dumpDir)) {
  New-Item -ItemType Directory -Path $dumpDir | Out-Null
}

Write-Host "Dumping prod data to $DumpFile..." -ForegroundColor Cyan
npx supabase db dump --linked --data-only | Out-File -FilePath $DumpFile -Encoding utf8

# 2) Switch to dev and restore data
Write-Host "Switching to dev environment..." -ForegroundColor Cyan
./switch-env.ps1 -Environment dev | Out-Null
Import-EnvFile ".env.local"
$devDbUrl = Get-DbUrl
if (-not $devDbUrl) { throw "Could not find a database URL in .env.local" }

if ($ResetDev) {
  Write-Host "Resetting dev database..." -ForegroundColor Yellow
  npx supabase db reset --linked --yes
}

Ensure-Psql

Write-Host "Restoring data into dev..." -ForegroundColor Cyan
psql $devDbUrl -f $DumpFile

Write-Host "Data sync complete." -ForegroundColor Green
