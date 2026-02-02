'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { EventWithRsvps } from '@/lib/events';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface EventWithClanInfo extends EventWithRsvps {
  clan?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function PublicEventsView() {
  const { t } = useLanguage();
  const { error: showError } = useToast();
  const [events, setEvents] = useState<EventWithClanInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  async function fetchPublicEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          event_rsvps(
            *,
            character:members(id, name),
            user:users(id, display_name)
          ),
          guest_event_rsvps(*),
          clan:clan_id(id, name, slug)
        `
        )
        .eq('is_public', true)
        .order('starts_at', { ascending: true });

      if (error) throw error;

      // Compute rsvp_counts and role_counts for each event
      const eventsWithCounts = (data || []).map(event => {
        const rsvps = event.event_rsvps || [];
        const guestRsvps = event.guest_event_rsvps || [];
        return {
          ...event,
          rsvps,
          guest_rsvps: guestRsvps,
          rsvp_counts: {
            attending: rsvps.filter((r: any) => r.status === 'attending').length,
            maybe: rsvps.filter((r: any) => r.status === 'maybe').length,
            declined: rsvps.filter((r: any) => r.status === 'declined').length,
          },
          role_counts: {
            tank: {
              attending: (rsvps.filter((r: any) => r.role === 'tank' && r.status === 'attending').length +
                guestRsvps.filter((g: any) => g.role === 'tank' && g.status === 'attending').length),
              maybe: (rsvps.filter((r: any) => r.role === 'tank' && r.status === 'maybe').length +
                guestRsvps.filter((g: any) => g.role === 'tank' && g.status === 'maybe').length),
            },
            cleric: {
              attending: (rsvps.filter((r: any) => r.role === 'cleric' && r.status === 'attending').length +
                guestRsvps.filter((g: any) => g.role === 'cleric' && g.status === 'attending').length),
              maybe: (rsvps.filter((r: any) => r.role === 'cleric' && r.status === 'maybe').length +
                guestRsvps.filter((g: any) => g.role === 'cleric' && g.status === 'maybe').length),
            },
            bard: {
              attending: (rsvps.filter((r: any) => r.role === 'bard' && r.status === 'attending').length +
                guestRsvps.filter((g: any) => g.role === 'bard' && g.status === 'attending').length),
              maybe: (rsvps.filter((r: any) => r.role === 'bard' && r.status === 'maybe').length +
                guestRsvps.filter((g: any) => g.role === 'bard' && g.status === 'maybe').length),
            },
            ranged_dps: {
              attending: (rsvps.filter((r: any) => r.role === 'ranged_dps' && r.status === 'attending').length +
                guestRsvps.filter((g: any) => g.role === 'ranged_dps' && g.status === 'attending').length),
              maybe: (rsvps.filter((r: any) => r.role === 'ranged_dps' && r.status === 'maybe').length +
                guestRsvps.filter((g: any) => g.role === 'ranged_dps' && g.status === 'maybe').length),
            },
            melee_dps: {
              attending: (rsvps.filter((r: any) => r.role === 'melee_dps' && r.status === 'attending').length +
                guestRsvps.filter((g: any) => g.role === 'melee_dps' && g.status === 'attending').length),
              maybe: (rsvps.filter((r: any) => r.role === 'melee_dps' && r.status === 'maybe').length +
                guestRsvps.filter((g: any) => g.role === 'melee_dps' && g.status === 'maybe').length),
            },
          }
        };
      });

      setEvents(eventsWithCounts);
    } catch (err) {
      console.error('Error fetching public events:', err);
      showError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  // Group events by clan
  const eventsByClans = events.reduce((acc, event) => {
    const clanName = event.clan?.name || 'Unknown Guild';
    const clanSlug = event.clan?.slug || '';
    if (!acc[clanName]) {
      acc[clanName] = { slug: clanSlug, events: [] };
    }
    acc[clanName].events.push(event);
    return acc;
  }, {} as Record<string, { slug: string; events: EventWithClanInfo[] }>);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-300 mb-2">No Public Events</h2>
        <p className="text-slate-400">There are currently no public events available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Public Events</h1>
        <p className="text-slate-400">Explore upcoming events across all guilds</p>
      </div>

      {Object.entries(eventsByClans).map(([clanName, { slug, events: clanEvents }]) => (
        <div key={clanName} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{clanName}</h2>
              <p className="text-xs text-slate-300">
                {clanEvents.length} event{clanEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            {slug && (
              <Link
                href={`/${slug}/public-events`}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-100 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500"
                title="View all events for this guild"
              >
                View All
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {clanEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                timezone="UTC"
                clanId={event.clan_id}
                userId="" // Anonymous user
                characters={[]}
                onRsvp={() => {
                  // Public events don't support member RSVP, only guest signup
                }}
                isPublicView={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
