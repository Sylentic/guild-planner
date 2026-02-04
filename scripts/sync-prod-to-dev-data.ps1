#!/usr/bin/env pwsh
# Sync production data into dev using data-only dump/restore.
# Can use either:
#   1) DATABASE_URL with psql (requires PostgreSQL client tools)
#   2) SUPABASE_PROJECT_REF with Supabase CLI

param(
  [string]$DumpFile = ".tmp/prod-data.sql",
  [switch]$ResetDev,
  [switch]$UsePsql  # Force psql method if available
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

# 1) Load prod env and dump data
Write-Host "Loading prod environment..." -ForegroundColor Cyan
Import-EnvFile ".env.local.prod"

$prodRef = [Environment]::GetEnvironmentVariable("SUPABASE_PROJECT_REF", "Process")
$prodDbUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")

$dumpDir = Split-Path $DumpFile -Parent
if ($dumpDir -and -not (Test-Path $dumpDir)) {
  New-Item -ItemType Directory -Path $dumpDir | Out-Null
}

Write-Host "Dumping prod data to $DumpFile..." -ForegroundColor Cyan

if ($prodRef) {
  # Use project ref method
  npx supabase db dump --project-ref $prodRef --data-only | Out-File -FilePath $DumpFile -Encoding utf8
} elseif ($prodDbUrl -and $prodDbUrl -notmatch '\[YOUR-PASSWORD\]') {
  # Use psql method
  if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    throw "pg_dump not found. Install PostgreSQL client tools or add SUPABASE_PROJECT_REF to .env.local.prod"
  }
  pg_dump $prodDbUrl --data-only | Out-File -FilePath $DumpFile -Encoding utf8
} else {
  throw "Neither SUPABASE_PROJECT_REF nor valid DATABASE_URL found in .env.local.prod"
}

# 2) Load dev env and restore
Write-Host "Loading dev environment..." -ForegroundColor Cyan
Import-EnvFile ".env.local.dev"

$devRef = [Environment]::GetEnvironmentVariable("SUPABASE_PROJECT_REF", "Process")
$devDbUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")

if ($ResetDev) {
  Write-Host "Resetting dev database..." -ForegroundColor Yellow
  if ($devRef) {
    npx supabase db reset --project-ref $devRef --yes
  } else {
    Write-Host "Warning: No project ref, attempting reset with linked project..." -ForegroundColor Yellow
    npx supabase db reset --linked --yes
  }
}

Write-Host "Restoring data into dev..." -ForegroundColor Cyan

if ($UsePsql -and $devDbUrl -and $devDbUrl -notmatch '\[YOUR-PASSWORD\]') {
  # Use psql method
  if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql not found. Install PostgreSQL client tools."
  }
  psql $devDbUrl -f $DumpFile
} elseif ($devRef) {
  # Use Supabase CLI method
  Get-Content $DumpFile | npx supabase db execute --project-ref $devRef
} elseif ($devDbUrl -and $devDbUrl -notmatch '\[YOUR-PASSWORD\]') {
  # Fallback to psql
  if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql not found and no SUPABASE_PROJECT_REF. Install PostgreSQL client tools or add project ref to .env.local.dev"
  }
  psql $devDbUrl -f $DumpFile
} else {
  throw "Neither SUPABASE_PROJECT_REF nor valid DATABASE_URL found in .env.local.dev"
}

Write-Host "Data sync complete." -ForegroundColor Green
