# Guild Planner

A comprehensive guild management and planning tool supporting multiple MMOs.

> **Inspired by** the original [AoC Guild Profession Planner](https://github.com/igonzalezespi/aoc-guild-profession-planner) by Iván González Espí

## Supported Games

* **Ashes of Creation** - Track all 22 professions (Gathering → Processing → Crafting)
* **Star Citizen** - Manage squadrons and ship hangars
* **Return of Reckoning** - Coordinate warband activities

## Features

* 🎮 Multi-game support with game-specific features
* 👥 Guild/Squadron/Warband management with role-based permissions
* 📊 Guild coverage matrix (AoC) and fleet overview (Star Citizen)
* 🛢️ Guild bank, caravan, and economy tracking
* 📅 Event scheduling with RSVP system
* 🔐 Customizable role-based permissions per group
* ⚙️ Discord integration for notifications and recruitment
* ☁️ Cloud persistence - data syncs across all devices
* 🔗 URL-based routing - share group pages with easy access

## Quick Start

1. Clone the repository

2. Copy `.env.example` to `.env.local` and add your Supabase credentials

3. Run `npm install`

4. Apply database migrations:

   ```bash
   # Login to Supabase
   npx supabase login

   # Link to your Supabase project (migrations are in supabase/migrations/)
   npx supabase link --project-ref your-project-ref

   # Apply all migrations to remote database
   npx supabase db push
   ```

   If required at any point you can reset the database with:

   ```bash
   npx supabase db reset --linked`
   ```

5. Run `npm run dev`

6. Open `http://localhost:3000`

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full instructions.

## Development

### For AI Agents & Contributors

* **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Quick reference for code patterns, version management, and logging (start here!)
* **[.ai-instructions.md](./.ai-instructions.md)** - Comprehensive guide with lessons learned, security considerations, and troubleshooting

These documents cover critical lessons from development, including:

* Permission system specifics (common naming gotchas)
* Database migration best practices
* Role hierarchy and permission checks
* Changelog maintenance
* Common issues and solutions

## Tech Stack

* [Next.js 16](https://nextjs.org/) - React framework
* [Tailwind CSS](https://tailwindcss.com/) - Styling
* [Supabase](https://supabase.com/) - Database & real-time sync
* [Lucide React](https://lucide.dev/) - Icons
* [Vercel](https://vercel.com/) - Hosting

## License

MIT
