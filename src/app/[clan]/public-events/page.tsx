import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PublicClanEventsView } from '@/components/PublicClanEventsView';

interface PageProps {
  params: Promise<{ clan: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { data: clan } = await supabase
    .from('clans')
    .select('name')
    .eq('slug', params.clan)
    .single();

  return {
    title: clan ? `${clan.name} - Public Events` : 'Public Events',
  };
}

export default async function PublicClanEventsPage(props: PageProps) {
  const params = await props.params;

  // Fetch clan details
  const { data: clan, error } = await supabase
    .from('clans')
    .select('id, name, slug')
    .eq('slug', params.clan)
    .single();

  if (error || !clan) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <PublicClanEventsView clanId={clan.id} clanName={clan.name} />
      </div>
    </main>
  );
}
