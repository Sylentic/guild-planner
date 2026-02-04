'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { EventWithRsvps } from '@/lib/events';
import { EventCard } from '@/components/views/EventCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeft } from 'lucide-react';

interface PublicClanEventsViewProps {
  groupId: string;
  groupName: string;
}

export function PublicClanEventsView({ groupId, groupName }: PublicClanEventsViewProps) {
  const { t } = useLanguage();
  const { error: showError } = useToast();
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicEvents();
  }, [groupId]);

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
          guest_event_rsvps(*)
        `
        )
        .eq('group_id', groupId)
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
        <h1 className="text-2xl font-bold text-white mb-2">{groupName} - Public Events</h1>
        <p className="text-slate-300">
          {events.length === 0
            ? `No public events scheduled for ${groupName}`
            : `${events.length} public event${events.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-300">No public events at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              timezone="UTC"
              groupId={groupId}
              userId="" // Anonymous user
              characters={[]}
              onRsvp={() => {
                // Public events don't support member RSVP, only guest signup
              }}
              isPublicView={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

