'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { EventWithRsvps } from '@/lib/events';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeft } from 'lucide-react';

interface PublicClanEventsViewProps {
  clanId: string;
  clanName: string;
}

export function PublicClanEventsView({ clanId, clanName }: PublicClanEventsViewProps) {
  const { t } = useLanguage();
  const { error: showError } = useToast();
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicEvents();
  }, [clanId]);

  async function fetchPublicEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          event_rsvps(*),
          guest_event_rsvps(*)
        `
        )
        .eq('clan_id', clanId)
        .eq('is_public', true)
        .order('starts_at', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching public events:', err);
      showError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">All Events</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{clanName} - Public Events</h1>
        <p className="text-slate-400">
          {events.length === 0
            ? `No public events scheduled for ${clanName}`
            : `${events.length} public event${events.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-400">No public events at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              timezone="UTC"
              clanId={clanId}
              userId="" // Anonymous user
              characters={[]}
              onRsvp={() => {
                // Public events don't support member RSVP, only guest signup
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
