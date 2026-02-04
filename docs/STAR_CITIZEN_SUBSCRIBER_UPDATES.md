# Star Citizen Subscriber Ship Updates

## Overview

Star Citizen subscriber ships are granted monthly to active subscribers based on
their tier. This document explains how to monitor for new promotions and update
the system.

## RSI Comm-Link Pattern

### URL Structure

```text
https://robertsspaceindustries.com/comm-link/transmission/[ID]-[Month]-[Year]-Subscriber-Promotions
```

**Examples:**

* January 2026:
  `https://robertsspaceindustries.com/comm-link/transmission/20913-January-2026-Subscriber-Promotions`
* February 2026:
  `https://robertsspaceindustries.com/comm-link/transmission/20961-February-2026-Subscriber-Promotions`

### Publication Schedule

New subscriber promotions are typically announced in the **first week of each
month** (usually around the 1st-5th).

## Monitoring for Updates

### RSS Feed (Recommended)

**Feed URL**: <https://robertsspaceindustries.com/en/comm-link/rss>

This official RSS feed includes all comm-link transmissions, including monthly
subscriber promotions.

**How to use:**

1. **RSS Reader**: Add the feed to Feedly, Inoreader, or your preferred RSS
   reader
2. **Filter for**: Posts titled "\[Month] \[Year] Subscriber Promotions"
3. **Frequency**: Check first week of each month (typically posts 1st-5th)
4. **Auto-alert**: Set up RSS alerts/notifications for posts containing
   "Subscriber Promotions"

* Link: Direct URL to promotion page
* Posted date: Timestamp
* Category: "transmission"

### Manual Check (Alternative)

1. **First week of each month**: Visit
   <https://robertsspaceindustries.com/comm-link/transmission/>
2. Look for posts titled "\[Month] \[Year] Subscriber Promotions"
3. Extract ship and flair information
4. Update the codebase (see below)

### Community Sources (Backup)

1. **Reddit**: r/starcitizen announces promotions immediately
2. **Spectrum**: Official RSI forums
3. **Discord**: Star Citizen community servers often have
   auto-notifications

## Updating Subscriber Ships

### 1. Extract Information from Comm-Link

Look for these key details:

* **Centurion Ships**: Listed as "Centurion Subscribers receive..."
* **Imperator Ships**: Listed as "Imperator Subscribers receive..."
* **Flair Items**: Monthly cosmetic rewards
* **Insurance Duration**: 12 months (Centurion) or 24 months
  (Imperator)

### 2. Update Configuration File

Edit: `src/games/starcitizen/config/subscriber-ships.ts`

Add new month entry:

```typescript
'2026-03': {
  label: 'March 2026',
  centurion: ['Ship Name'],
  imperator: ['Ship Name', 'Additional Ship'],
  flair: 'Flair Item Description',
  notes: 'Ship Name (12m insurance for Centurion, 24m for Imperator)',
},
```

### 3. Commit and Deploy

```bash
git add src/games/starcitizen/config/subscriber-ships.ts
git commit -m "chore: Add March 2026 subscriber ships"
git push
```

The system automatically syncs ships when:

* A character's subscriber tier is set or changed
* The month changes (if auto-sync is enabled)

## Subscriber Tiers

### Centurion ($10/month)

* **Color**: Gold/Bronze (#D4AF37)
* **Icon**: 🥉
* **Ships**: 1 per month
* **Flair**: 1 per month
* **Insurance**: 12 months

### Imperator ($20/month)

* **Color**: Platinum/Silver (#E5E4E2)
* **Icon**: 🥈
* **Ships**: 2 per month (includes Centurion ship + exclusive variant)
* **Flair**: 2 per month
* **Insurance**: 24 months

## Branding Usage

The subscriber tier colors are defined in `SUBSCRIBER_COLORS`:

```typescript
import { SUBSCRIBER_COLORS, SUBSCRIBER_TIERS } from '@/games/starcitizen/config/subscriber-ships';

// Use in UI components
<div style={{ 
  borderColor: SUBSCRIBER_COLORS.centurion.primary,
  backgroundColor: SUBSCRIBER_COLORS.centurion.bg 
}}>
  {SUBSCRIBER_TIERS.centurion.icon} {SUBSCRIBER_TIERS.centurion.label}
</div>
```

## Recent Updates

### February 2026

* **Centurion**: MISC Starlancer MAX
* **Imperator**: MISC Starlancer MAX, MISC Starlancer TAC
* **Flair**: Coramor Décor Collection (Pink Heart Lamp, Carmilla Nightstand)

### January 2026

* **Centurion**: Aegis Sabre
* **Imperator**: Aegis Sabre, Sabre Firebird, Sabre Peregrine
* **Flair**: CC's Conversions Azreal Helmet

## Technical Implementation

### Database Schema

```sql
-- Migration 063
subscriber_tier VARCHAR(50)      -- 'centurion' or 'imperator'
subscriber_since TIMESTAMPTZ     -- When tier was first set
subscriber_ships_month VARCHAR(7) -- Last synced month (YYYY-MM)
```

### Utility Functions

* `syncSubscriberShips()` - Add ships to character hangar
* `removeSubscriberShips()` - Remove ships on tier downgrade
* `updateSubscriberTier()` - Handle tier changes
* `getSubscriberShipStatus()` - Check sync status

See: `src/lib/subscriberShips.ts`

## Troubleshooting

### Ships Not Appearing

1. Verify `subscriber_tier` is set correctly in database
2. Check `subscriber_ships_month` matches current month
3. Ensure ship names in config exactly match game database

### Tier Change Issues

Use `updateSubscriberTier()` instead of directly updating the field - it
handles ship additions/removals automatically.

### Month Transition

Ships auto-update when month changes. Manual sync available via
CharacterForm.

## External Resources

* **Subscriptions Page**:
  <https://robertsspaceindustries.com/pledge/subscriptions>
* **Comm-Link Archive**:
  <https://robertsspaceindustries.com/comm-link/transmission>
* **Subscriber Store**:
  <https://robertsspaceindustries.com/store/pledge/browse/extras/subscribers-store>
* **Support FAQ**:
  <https://support.robertsspaceindustries.com/hc/en-us/articles/115013374428-Subscriber-Discount-Coupons>
