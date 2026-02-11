# Game Icons

Place the following game icon files in this directory:

## Required Icons

1. **aoc-icon.png** - Ashes of Creation icon
   * Recommended size: 256x256px or larger
   * Format: PNG with transparent background preferred
   * Source: Official AoC branding/assets

2. **starcitizen-icon.png** - Star Citizen icon
   * Recommended size: 256x256px or larger
   * Format: PNG with transparent background preferred
   * Source: Official Star Citizen branding/assets

3. **ror-icon.png** - Return of Reckoning (Warhammer Online) icon
   * Recommended size: 256x256px or larger
   * Format: PNG with transparent background preferred
   * Source: Return of Reckoning project assets

## Icon Guidelines

* **Format**: PNG (preferred) or SVG
* **Size**: At least 256x256px (will be scaled down as needed)
* **Background**: Transparent background works best
* **Style**: Should match the game's branding
* **Quality**: High quality, clean edges

## Where Icons Appear

These icons will be displayed in:

* Game selection page (48x48px)
* Top navigation bar game switcher (20x20px)
* Add game dialog (32x32px)

## Fallback Behaviour

If an icon file is missing or fails to load, the system will automatically fall back to the emoji icon defined in the game config:

* Ashes of Creation: ⚔️
* Star Citizen: 🚀
* Return of Reckoning: ⚔️

## How to Add Icons

1. Place your icon files in this directory
2. Ensure they match the filenames above exactly
3. The system will automatically detect and use them
4. No code changes needed - just add the files!
