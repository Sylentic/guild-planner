'use server';

import { supabase } from '@/lib/supabase';

interface GuestRsvpRequest {
  eventId: string;
  guestName: string;
  classId: string | null;
  role: string;
  alliedClanId: string;
}

export async function submitGuestRsvp(data: GuestRsvpRequest) {
  try {
    // Verify the event exists and get its clan
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('clan_id')
      .eq('id', data.eventId)
      .single();

    if (eventError || !event) {
      return { error: 'Event not found' };
    }

    // Verify the clans are allied
    const { data: areAllied, error: allianceError } = await supabase
      .rpc('check_clans_allied', {
        clan_a: event.clan_id,
        clan_b: data.alliedClanId
      });

    if (allianceError || !areAllied) {
      return { error: 'Your clan is not allied with this event clan' };
    }

    // Create the guest RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from('guest_event_rsvps')
      .insert({
        event_id: data.eventId,
        allied_group_id: data.alliedClanId,
        guest_name: data.guestName,
        class_id: data.classId,
        role: data.role,
      })
      .select()
      .single();

    if (rsvpError) {
      if (rsvpError.code === '23505') {
        return { error: 'You have already signed up for this event' };
      }
      return { error: rsvpError.message };
    }

    return { success: true, data: rsvp };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to submit RSVP' };
  }
}

