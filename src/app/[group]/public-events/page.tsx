import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PublicClanEventsView } from '@/components/views/PublicClanEventsView';
import { PublicEventsPageWrapper } from '@/components/views/PublicEventsPageWrapper';

interface PageProps {
  params: Promise<{ group: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { data: group } = await supabase
    .from('groups')
    .select('name')
    .eq('slug', params.group)
    .single();

  return {
    title: group ? `${group.name} - Public Events` : 'Public Events',
  };
}

export default async function PublicGroupEventsPage(props: PageProps) {
  const params = await props.params;

  // Fetch group details
  const { data: group, error } = await supabase
    .from('groups')
    .select('id, name, slug')
    .eq('slug', params.group)
    .single();

  if (error || !group) {
    redirect('/');
  }

  return (
    <PublicEventsPageWrapper>
      <PublicClanEventsView groupId={group.id} groupName={group.name} groupSlug={group.slug} />
    </PublicEventsPageWrapper>
  );
}

