# Group Planner

A comprehensive group management and planning tool supporting multiple MMOs.

> **Inspired by** the original [AoC Group Profession Planner](https://github.com/igonzalezespi/aoc-guild-profession-planner) by Iván González Espí

## Supported Games

* **Ashes of Creation** - Track all 22 professions (Gathering → Processing → Crafting)
* **Star Citizen** - Manage squadrons and ship hangars
* **Return of Reckoning** - Coordinate warband activities

## Features

* 🎮 Multi-game support with game-specific features
* 👥 Group/Squadron/Warband management with role-based permissions
* 📊 Group coverage matrix (AoC) and fleet overview (Star Citizen)
* 🛢️ Group bank, caravan, and economy tracking
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

### Testing

We use **Jest** and **React Testing Library** for comprehensive test coverage.

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Documentation**:

* [TESTING.md](./docs/TESTING.md) - How to write and run tests
* [TESTING\_ROADMAP.md](./docs/TESTING_ROADMAP.md) - Testing improvement plan
* [TESTING\_QUICK\_REFERENCE.md](./docs/TESTING_QUICK_REFERENCE.md) - Quick checklist for developers

**Current Coverage**: 133 tests passing with 100% coverage on tested modules (permissions 30, utils 9, gameValidation 8, auth 42, usePermissions hook 40)

### For AI Agents & Contributors

* **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Quick reference for code patterns, version management, and logging (start here!)
* **[.AI-INSTRUCTIONS.md](./.AI-INSTRUCTIONS.md)** - Comprehensive guide with lessons learned, security considerations, and troubleshooting

These documents cover critical lessons from development, including:

* Permission system specifics (common naming gotchas)
* Database migration best practices
* Role hierarchy and permission checks
* Changelog maintenance
* Common issues and solutions
* **PowerShell commands** (preferred over Unix-style commands)

### Development Environment

> This project uses **PowerShell** for command-line operations. Use PowerShell cmdlets instead of Unix commands (e.g., `Get-ChildItem` instead of `ls`, `Remove-Item` instead of `rm`).

## Tech Stack

* [Next.js 16](https://nextjs.org/) - React framework
* [Tailwind CSS](https://tailwindcss.com/) - Styling
* [Supabase](https://supabase.com/) - Database & real-time sync
* [Lucide React](https://lucide.dev/) - Icons
* [Vercel](https://vercel.com/) - Hosting

## License

MIT
