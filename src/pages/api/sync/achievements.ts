// /api/sync/achievements
// This API route is triggered by the Vercel cron job to sync achievements in the background.
import type { NextApiRequest, NextApiResponse } from 'next';


import supabaseAdmin from '@/lib/supabaseAdmin';
import { syncGroupAchievements } from '@/lib/achievementsSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all clans
    const { data: clans, error } = await supabaseAdmin
      .from('groups')
      .select('id, name');
    if (error) throw error;
    if (!clans) throw new Error('No clans found');

    let totalUpdated = 0;
    for (const clan of clans) {
      const updated = await syncGroupAchievements(clan.id);
      totalUpdated += updated;
    }

    res.status(200).json({ success: true, clans: clans.length, achievementsUpdated: totalUpdated });
  } catch (error) {
    console.error('Achievements sync job failed:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

