#!/usr/bin/env pwsh
# Backup the dev database locally
# Uses env variable GP_BACKUPPATH, defaults to .backups/ in project root
# Creates timestamped backup files with both schema and data

param(
  [string]$BackupPath = $null,
  [switch]$SchemaOnly,    # Only dump schema, not data
  [switch]$DataOnly       # Only dump data, not schema
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

# Determine backup path
if (-not $BackupPath) {
  $BackupPath = [Environment]::GetEnvironmentVariable("GP_BACKUPPATH", "User")
}

if (-not $BackupPath) {
  # Default to .backups in project root
  $BackupPath = Join-Path (Get-Location) ".backups"
}

# Ensure backup directory exists
if (-not (Test-Path $BackupPath)) {
  Write-Host "Creating backup directory: $BackupPath" -ForegroundColor Cyan
  New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

Write-Host "Backup path: $BackupPath" -ForegroundColor Cyan

# Load dev env
Write-Host "Loading dev environment..." -ForegroundColor Cyan
Import-EnvFile ".env.local.dev"

$devDbUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")

if (-not $devDbUrl -or $devDbUrl -match '\[YOUR-PASSWORD\]') {
  throw "Invalid DATABASE_URL in .env.local.dev"
}

# Check for psql
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump not found. Install PostgreSQL client tools."
}

# Build pg_dump options
$dumpOptions = @()
if ($DataOnly) {
  $dumpOptions += "--data-only"
} elseif ($SchemaOnly) {
  $dumpOptions += "--schema-only"
}

# Generate timestamp-based filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$filename = "dev-backup_$timestamp.sql"

if ($DataOnly) {
  $filename = "dev-backup_data-only_$timestamp.sql"
} elseif ($SchemaOnly) {
  $filename = "dev-backup_schema-only_$timestamp.sql"
}

$backupFile = Join-Path $BackupPath $filename

Write-Host "Backing up dev database to: $backupFile" -ForegroundColor Cyan
Write-Host "Options: $(if ($dumpOptions) { $dumpOptions -join ' ' } else { 'Full backup (schema + data)' })" -ForegroundColor Yellow

# Perform backup
pg_dump $devDbUrl @dumpOptions | Out-File -FilePath $backupFile -Encoding utf8

$fileSize = (Get-Item $backupFile).Length
Write-Host "Backup complete! File size: $([math]::Round($fileSize / 1MB, 2))MB" -ForegroundColor Green

# Show latest 3 backups
Write-Host "`nLatest backups:" -ForegroundColor Yellow
Get-ChildItem $BackupPath -Filter "dev-backup_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 3 | ForEach-Object {
  $size = [math]::Round($_.Length / 1MB, 2)
  $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  Write-Host "  $($_.Name) - $size`MB ($modified)"
}
