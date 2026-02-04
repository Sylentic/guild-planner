'use server';

import { supabase } from '@/lib/supabase';
import { EventRole } from '@/lib/events';

interface AnonymousGuestRsvpInput {
  eventId: string;
  guestName: string;
  guestEmail: string;
  classId: string | null;
  role: EventRole;
}

export async function submitAnonymousGuestRsvp(input: AnonymousGuestRsvpInput) {
  try {
    // Validate event exists and is public
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, is_public, clan_id')
      .eq('id', input.eventId)
      .single();

    if (eventError || !event) {
      return { error: 'Event not found' };
    }

    if (!event.is_public) {
      return { error: 'This event is not open to public registration' };
    }

    // Create guest RSVP entry with email instead of user_id
    const { data: rsvp, error: rsvpError } = await supabase
      .from('guest_event_rsvps')
      .insert({
        event_id: input.eventId,
        guest_name: input.guestName,
        guest_email: input.guestEmail,
        class_id: input.classId,
        role: input.role,
        allied_group_id: null, // Not part of an allied clan - completely anonymous
      })
      .select()
      .single();

    if (rsvpError) {
      // Check if it's a duplicate entry
      if (rsvpError.code === '23505') {
        return { error: 'You have already registered for this event' };
      }
      return { error: rsvpError.message || 'Failed to register' };
    }

    return { success: true, data: rsvp };
  } catch (err) {
    console.error('Error submitting anonymous guest RSVP:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
  }
}

