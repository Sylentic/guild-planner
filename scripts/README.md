# Scripts Directory

Utility scripts for the project, organized by purpose.

## Active Scripts (Root)

These scripts are actively used during development and deployment:

* **`generate-migration-list.js`** - Generates migration file list for runtime tracking (runs automatically on every build)
* **`fetch-ships.js`** - Fetches latest Star Citizen ship data from RSI Ship Matrix API
* **`fetch-manufacturer-logos.js`** - Downloads manufacturer logos from RSI

## Folders

### `archived/`

One-time refactoring and deprecated scripts no longer in active use:

* Component prop fixes (`fix-*.js`)
* Variable renaming scripts
* Route updates
* Clan-to-group refactoring
* Deprecated logo download scripts

### `migrations/`

SQL migration helpers and testing utilities:

* `sync-subscriber-ships.sql` - Manual SQL for testing subscriber ship sync

## Usage

### Update Ship Data

```bash
node scripts/fetch-ships.js
```

### Update Manufacturer Logos

```bash
node scripts/fetch-manufacturer-logos.js
```

### Build (Auto-runs generate-migration-list.js)

```bash
npm run build
```
