# Build Planner Research - AoC Group Profession Planner

## Status: Deferred to Future Phase

The Build Planner feature requires extensive research on Ashes of Creation's class system before implementation. This document tracks what needs to be researched.

## Research Required

### 1. Class System (64 Combinations)

| Primary  | Secondary Options (8 each)                                                                       |
| -------- | ------------------------------------------------------------------------------------------------ |
| Fighter  | Weapon Master, Spellsword, Nightspade, Strider, Magician, Wild Blade, Highsword, Bladedancer     |
| Tank     | Guardian, Knight, Nightshield, Warden, Keeper, Brood Warden, Paladin, Argent                     |
| Rogue    | Shadowblade, Shadowlord, Assassin, Predator, Shadow Caster, Charlatan, Cultist, Trickster        |
| Ranger   | Bladecaller, Scion, Bowsinger, Hawkeye, Falconer, Scout, Protector, Bowmaster                    |
| Mage     | Archwizard, Spellstone, Battlemage, Shadow Guard, Acolyte, Conjurer, Necromancer, Spellmancer    |
| Summoner | High Summoner, Warlock, Shadowmancer, Beastmaster, Spellmancer, Conjurer, Necromancer, Enchanter |
| Cleric   | High Priest, Oracle, Templar, Protector, Shaman, Druid, Necromancer, Scryer                      |
| Bard     | Minstrel, Song Warden, Siren, Songcaller, Magician, Song Caller, Soul Weaver, Trickster          |

### 2. Skill Trees

Each class has:

* **Active Skills** (8-10 per class to research)
* **Passive Skills**
* **Weapon Skills**

### 3. Augment System

Secondary class applies **augments** that modify primary skills:

* Fire augments, Ice augments, etc. from Mage
* Buff augments from Bard
* Stealth augments from Rogue
* etc.

### 4. Equipment Slots

Need to research:

* All equipment slots (head, chest, etc.)
* Weapon types per class
* Stats system

## Data Sources

* https://ashescodex.com/ - Primary source
* https://ashesofcreation.wiki - Official wiki

## Implementation Notes

When ready to implement:

1. Create `src/config/classes.json` with all 64 combinations
2. Create `src/config/skills.json` with skill trees
3. Create `BuildEditor.tsx` component with:
   * Class selector
   * Skill point allocator
   * Equipment planner
   * Stat preview

## Timeline

TBD - Dependent on game data availability from Early Access phase.
