# Deployment Guide - AoC Profession Planner

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: `aoc-profession-planner`
   - **Region**: Choose closest to your users
   - **Database Password**: Save this securely
4. Wait for project to be created (~2 minutes)

### Create Database Tables

1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

### Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJI...`

---

## Step 2: Configure Environment Variables

### For Local Development

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel (Production)

1. In Vercel project → **Settings** → **Environment Variables**
2. Add both variables for all environments:

| Name                            | Value             |
| ------------------------------- | ----------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key     |

---

## Step 3: Deploy to Vercel

### Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New...** → **Project**
3. Select your GitHub repository: `aoc-guild-profession-planner`
4. Vercel will auto-detect Next.js settings
5. Add the environment variables from Step 2
6. Click **Deploy**

### Automatic Deployments

After initial setup:

- Every push to `main` → Production deploy
- Every pull request → Preview deploy

---

## Step 4: Verify Deployment

1. Open your Vercel URL (e.g., `aoc-profession-planner.vercel.app`)
2. Enter a clan name (e.g., "joeva-witness")
3. Add a member and assign professions
4. Refresh the page - data should persist
5. Open in another browser - data should be shared

---

## Troubleshooting

### "Missing Supabase environment variables"

- Check that both env vars are set in Vercel
- Redeploy after adding variables

### Data not persisting

- Check Supabase → Table Editor to see if data is being saved
- Check browser console for errors
- Verify RLS policies are created (from schema.sql)

### 500 Error on production

- Check Vercel → Deployments → View logs
- Most likely missing environment variables

---

## Updating the App

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel automatically deploys

---

## Security Notes

| ✅ Safe to commit | ❌ Never commit  |
| ----------------- | ---------------- |
| `.env.example`    | `.env.local`     |
| Source code       | Service role key |
| Schema SQL        | Real passwords   |
