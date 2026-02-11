# Configuration Restructure

## Overview

As of January 2025, the config files have been restructured from a scattered approach to a game-focused organization pattern.

## Old Structure (Deprecated)

```txt
src/config/
  ├── professions.json      → AoC-specific
  ├── archetypes.json       → AoC-specific
  ├── races.json            → AoC-specific
  ├── gameRoles.json        → Multi-game
  ├── itemRarities.json     → Shared
  └── supplyChain.json      → AoC-specific
```

## New Structure

```txt
src/config/
  ├── games/
  │   ├── aoc.json          → All AoC config (professions, archetypes, races, roles, supply chain)
  │   └── star-citizen.json → All SC config (roles, etc.)
  └── itemRarities.json     → Shared
```

## Benefits

1. **Game-Focused**: All config for a game is in one file
2. **Easy to Add Games**: Just create `games/new-game.json`
3. **Clear Ownership**: Each game owns its complete config
4. **Better Maintainability**: No need to hunt across multiple files
5. **Type Safety**: Game configs are self-contained TypeScript objects

## Usage

### Import Game Configs

```typescript
import { aocConfig, starCitizenConfig } from '@/config';

// Or use the helper function
import { getGameConfig } from '@/config';
const config = getGameConfig('star-citizen');
```

### Legacy Exports (Backward Compatibility)

```typescript
import { professionsConfig, archetypesConfig, racesConfig } from '@/config';
// These still work but point to aocConfig internally
```

### Type Definitions

```typescript
export type ProfessionId = typeof aocConfig.professions.gathering[number]['id'] | ...;
export type ArchetypeId = typeof aocConfig.archetypes.list[number]['id'];
export type RaceId = typeof aocConfig.races.list[number]['id'];
```

## Game Config Structure

### Ashes of Creation (`games/aoc.json`)

```typescript
{
  "name": "Ashes of Creation",
  "slug": "aoc",
  "icon": "⚔️",
  "professions": {
    "gathering": [...],
    "processing": [...],
    "crafting": [...],
    "tiers": {...},
    "ranks": {...},
    "limits": {...}
  },
  "archetypes": {
    "list": [...],          // 8 primary archetypes
    "classes": {...},       // 64 class combinations
    "roles": [...]          // tank, healer, dps, support
  },
  "races": {
    "list": [...],          // 9 races
    "parentRaces": {...}    // 5 parent race groupings
  },
  "roles": [...]            // Character role preferences
}
```

### Star Citizen (`games/star-citizen.json`)

```typescript
{
  "name": "Star Citizen",
  "slug": "star-citizen",
  "icon": "🚀",
  "roles": [               // 10 SC-specific roles
    "miner",
    "trader",
    "bounty-hunter",
    "explorer",
    "combat-pilot",
    "transport-pilot",
    "medic",
    "engineer",
    "salvager",
    "support"
  ]
}
```

## Adding a New Game

1. Create `src/config/games/new-game.json`:

```json
{
  "name": "New Game",
  "slug": "new-game",
  "icon": "🎮",
  "roles": [
    { "id": "role1", "name": "Role 1", "description": "..." }
  ]
}
```

1. Import in `src/config/index.ts`:

```typescript
import newGameData from './games/new-game.json';
export const newGameConfig = newGameData;

// Add to getGameConfig helper
export function getGameConfig(gameSlug: string) {
  switch (gameSlug) {
    case 'aoc': return aocConfig;
    case 'star-citizen': return starCitizenConfig;
    case 'new-game': return newGameConfig;
    default: return aocConfig;
  }
}
```

1. Update types if needed

## Migration Notes

* Old config files renamed to `*.old.json` for reference
* All imports updated to use new structure via `src/config/index.ts`
* Build verified to work with new structure
* No breaking changes - legacy exports maintained for backward compatibility

## Database Integration

Game roles are stored in config files, not the database:

* Migration `051_add_preferred_role_to_members.sql` adds `preferred_role TEXT` column
* Comment in migration points to `src/config/games/[game].json`
* Easier to update roles without database migrations
* Roles can vary per game
