import { NextRequest, NextResponse } from 'next/server';
import migrationFiles from '@/migration_files.json';
import { createClient } from '@supabase/supabase-js';

// Use env vars for Supabase connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role for RLS bypass
);

export async function GET(req: NextRequest) {
  // Get applied migrations from DB
  const { data, error } = await supabase
    .from('migration_history')
    .select('filename');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const applied = new Set((data || []).map((row: any) => row.filename));
  const unapplied = (migrationFiles as string[]).filter(f => !applied.has(f));

  return NextResponse.json({ unapplied });
}

