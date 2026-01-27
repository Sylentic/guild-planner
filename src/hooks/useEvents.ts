'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Event, EventWithRsvps, EventRsvp, RsvpStatus, EventRole, Announcement } from '@/lib/events';
import { notifyNewEvent, notifyAnnouncement } from '@/lib/discord';

interface UseEventsReturn {
  events: EventWithRsvps[];
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  // Event actions
  createEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>, sendDiscordNotification: boolean) => Promise<Event | null>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  cancelEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  // RSVP actions  
  setRsvp: (eventId: string, status: RsvpStatus, role?: EventRole | null, characterId?: string, note?: string) => Promise<void>;
  removeRsvp: (eventId: string) => Promise<void>;
  // Announcement actions
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>, sendDiscordNotification: boolean) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  // Utils
  refresh: () => Promise<void>;
}

export function useEvents(clanId: string | null, userId: string | null, clanSlug?: string): UseEventsReturn {
  const [events, setEvents] = useState<EventWithRsvps[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all events with RSVPs
  const fetchEvents = useCallback(async () => {
    if (!clanId) return;

    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_rsvps (
            *,
            character:members(id, name),
            user:users(id, display_name)
          )
        `)
        .eq('clan_id', clanId)
        .gte('starts_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h + future
        .order('starts_at', { ascending: true });

      if (eventsError) throw eventsError;

      // Transform to EventWithRsvps
      const eventsWithRsvps: EventWithRsvps[] = (eventsData || []).map((event) => {
        const rsvps = event.event_rsvps || [];
        return {
          ...event,
          rsvps,
          rsvp_counts: {
            attending: rsvps.filter((r: EventRsvp) => r.status === 'attending').length,
            maybe: rsvps.filter((r: EventRsvp) => r.status === 'maybe').length,
            declined: rsvps.filter((r: EventRsvp) => r.status === 'declined').length,
          },
          role_counts: {
            tank: {
              attending: rsvps.filter((r: EventRsvp) => r.role === 'tank' && r.status === 'attending').length,
              maybe: rsvps.filter((r: EventRsvp) => r.role === 'tank' && r.status === 'maybe').length,
            },
            cleric: {
              attending: rsvps.filter((r: EventRsvp) => r.role === 'cleric' && r.status === 'attending').length,
              maybe: rsvps.filter((r: EventRsvp) => r.role === 'cleric' && r.status === 'maybe').length,
            },
            bard: {
              attending: rsvps.filter((r: EventRsvp) => r.role === 'bard' && r.status === 'attending').length,
              maybe: rsvps.filter((r: EventRsvp) => r.role === 'bard' && r.status === 'maybe').length,
            },
            ranged_dps: {
              attending: rsvps.filter((r: EventRsvp) => r.role === 'ranged_dps' && r.status === 'attending').length,
              maybe: rsvps.filter((r: EventRsvp) => r.role === 'ranged_dps' && r.status === 'maybe').length,
            },
            melee_dps: {
              attending: rsvps.filter((r: EventRsvp) => r.role === 'melee_dps' && r.status === 'attending').length,
              maybe: rsvps.filter((r: EventRsvp) => r.role === 'melee_dps' && r.status === 'maybe').length,
            },
          },
          user_rsvp: userId ? rsvps.find((r: EventRsvp) => r.user_id === userId) || null : null,
        };
      });

      setEvents(eventsWithRsvps);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    }
  }, [clanId, userId]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    if (!clanId) return;

    try {
      const { data, error: annError } = await supabase
        .from('announcements')
        .select('*')
        .eq('clan_id', clanId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (annError) throw annError;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, [clanId]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchEvents(), fetchAnnouncements()]);
    setLoading(false);
  }, [fetchEvents, fetchAnnouncements]);

  // Initial fetch
  useEffect(() => {
    if (clanId) {
      fetchData();
    }
  }, [clanId, fetchData]);

  // Create event
  const createEvent = async (
    event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>,
    sendDiscordNotification: boolean
  ): Promise<Event | null> => {
    console.log('Creating event with data:', event, 'sendDiscordNotification:', sendDiscordNotification, 'type:', typeof sendDiscordNotification);
    const { data, error: createError } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    console.log('Created event result:', data, 'error:', createError);

    if (createError) {
      setError(createError.message);
      throw createError;
    }

    console.log('Checking Discord notification: sendDiscordNotification =', sendDiscordNotification);
    // Send Discord notification only if enabled
    if (sendDiscordNotification) {
      console.log('Discord notification enabled, proceeding...');
      try {
        const { data: clanData } = await supabase
          .from('clans')
          .select('name, slug, discord_webhook_url, notify_on_events, discord_announcement_role_id')
          .eq('id', event.clan_id)
          .single();

        if (clanData?.discord_webhook_url && clanData.notify_on_events !== false) {
          console.log('Sending Discord notification for event:', data.title);
          await notifyNewEvent(
            clanData.discord_webhook_url, 
            data, 
            clanData.name, 
            clanSlug || clanData.slug,
            clanData.discord_announcement_role_id
          );
        } else {
          console.log('Skipping Discord notification - webhook or notify_on_events not configured');
        }
      } catch (err) {
        console.error('Discord notification failed:', err);
        // Don't throw - notification failure shouldn't break event creation
      }
    } else {
      console.log('Discord notification disabled by user');
    }

    await fetchEvents();
    return data;
  };

  // Update event
  const updateEvent = async (id: string, updates: Partial<Event>) => {
    const { error: updateError } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }

    await fetchEvents();
  };

  // Cancel event
  const cancelEvent = async (id: string) => {
    await updateEvent(id, { is_cancelled: true });
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select();

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    await fetchEvents();
  };

  // Set RSVP
  const setRsvp = async (
    eventId: string,
    status: RsvpStatus,
    role?: EventRole | null,
    characterId?: string,
    note?: string
  ) => {
    if (!userId) return;

    const { error: rsvpError } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
        role: role || null,
        character_id: characterId || null,
        note: note || null,
        responded_at: new Date().toISOString(),
      }, {
        onConflict: 'event_id,user_id'
      })
      .select();

    if (rsvpError) {
      setError(rsvpError.message);
      throw rsvpError;
    }

    // Refresh to get accurate counts
    await fetchEvents();
  };

  // Remove RSVP
  const removeRsvp = async (eventId: string) => {
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .select();

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    await fetchEvents();
  };

  // Create announcement
  const createAnnouncement = async (
    announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>,
    sendDiscordNotification: boolean
  ) => {
    const { data, error: createError } = await supabase
      .from('announcements')
      .insert(announcement)
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      throw createError;
    }

    // Send Discord notification only if enabled
    if (sendDiscordNotification) {
      try {
        const { data: clanData } = await supabase
          .from('clans')
          .select('name, slug, discord_webhook_url, notify_on_announcements, discord_announcement_role_id')
          .eq('id', announcement.clan_id)
          .single();

        if (clanData?.discord_webhook_url && clanData.notify_on_announcements !== false) {
          await notifyAnnouncement(
            clanData.discord_webhook_url, 
            data, 
            clanData.name,
            clanSlug || clanData.slug,
            clanData.discord_announcement_role_id
          );
        }
      } catch (err) {
        console.error('Discord notification failed:', err);
        // Don't throw - notification failure shouldn't break announcement creation
      }
    }

    await fetchAnnouncements();
  };

  // Update announcement
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const { error: updateError } = await supabase
      .from('announcements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }

    await fetchAnnouncements();
  };

  // Delete announcement
  const deleteAnnouncement = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .select();

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    await fetchAnnouncements();
  };

  return {
    events,
    announcements,
    loading,
    error,
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    setRsvp,
    removeRsvp,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refresh: fetchData,
  };
}
