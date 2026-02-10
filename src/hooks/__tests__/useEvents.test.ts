/**
 * Phase 2 Tests: Data Fetching Hooks
 * Tests for event and announcement management logic
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useEvents } from '../useEvents';

jest.mock('@/lib/discord', () => ({
  notifyNewEvent: jest.fn(),
  notifyAnnouncement: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import { notifyNewEvent } from '@/lib/discord';

const buildEventsQuery = (data: any, error: any = null) => ({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  }),
});

const buildAnnouncementsQuery = (data: any, error: any = null) => ({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      order: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  }),
});

const mockSupabase = jest.mocked(supabase);

describe('useEvents Hook - Phase 2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches events and announcements with computed counts', async () => {
    const eventsData = [
      {
        id: 'event-1',
        group_id: 'group-123',
        game_slug: 'aoc',
        starts_at: '2024-02-01T00:00:00Z',
        event_rsvps: [
          { id: 'rsvp-1', user_id: 'user-1', status: 'attending', role: 'tank' },
          { id: 'rsvp-2', user_id: 'user-2', status: 'maybe', role: 'cleric' },
        ],
        guest_event_rsvps: [{ id: 'guest-1', role: 'tank' }],
      },
    ];

    const announcementsData = [
      { id: 'ann-1', group_id: 'group-123', title: 'Announcement' },
    ];

    mockSupabase.from
      .mockReturnValueOnce(buildEventsQuery(eventsData))
      .mockReturnValueOnce(buildAnnouncementsQuery(announcementsData));

    const { result } = renderHook(() => useEvents('group-123', 'user-1', 'aoc'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.announcements).toEqual(announcementsData);

    const event = result.current.events[0];
    expect(event.rsvp_counts.attending).toBe(2);
    expect(event.rsvp_counts.maybe).toBe(1);
    expect(event.role_counts.tank.attending).toBe(2);
    expect(event.role_counts.cleric.maybe).toBe(1);
    expect(event.user_rsvp?.user_id).toBe('user-1');
  });

  it('creates an event and sends Discord notification when enabled', async () => {
    const createdEvent = {
      id: 'event-1',
      group_id: 'group-123',
      title: 'Raid Night',
      description: 'Test event',
      event_type: 'raid',
      starts_at: '2024-02-01T00:00:00Z',
      ends_at: '2024-02-01T02:00:00Z',
      location: 'Test',
      max_attendees: 10,
      tanks_min: 0,
      clerics_min: 0,
      bards_min: 0,
      ranged_dps_min: 0,
      melee_dps_min: 0,
      tanks_max: null,
      clerics_max: null,
      bards_max: null,
      ranged_dps_max: null,
      melee_dps_max: null,
      allow_combined_dps: false,
      combined_dps_max: null,
      ror_tanks_min: 0,
      ror_tanks_max: null,
      ror_healers_min: 0,
      ror_healers_max: null,
      ror_dps_min: 0,
      ror_dps_max: null,
      is_public: false,
      allow_allied_signups: false,
      is_cancelled: false,
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      game_slug: 'aoc',
    };

    const eventsFetchQuery = buildEventsQuery([]);
    const announcementsQuery = buildAnnouncementsQuery([]);

    const eventsInsertQuery = {
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: createdEvent, error: null }),
        }),
      }),
    };

    const groupsQuery = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              name: 'Test Group',
              slug: 'test-group',
              group_webhook_url: 'https://discord.example',
              notify_on_events: true,
              discord_announcement_role_id: 'role-1',
            },
            error: null,
          }),
        }),
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(eventsFetchQuery)
      .mockReturnValueOnce(announcementsQuery)
      .mockReturnValueOnce(eventsInsertQuery)
      .mockReturnValueOnce(groupsQuery)
      .mockReturnValueOnce(eventsFetchQuery);

    const { result } = renderHook(() => useEvents('group-123', 'user-1', 'aoc', 'group-slug'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createEvent(
        {
          group_id: 'group-123',
          created_by: 'user-1',
          title: 'Raid Night',
          description: 'Test event',
          event_type: 'raid',
          starts_at: '2024-02-01T00:00:00Z',
          ends_at: '2024-02-01T02:00:00Z',
          location: 'Test',
          max_attendees: 10,
          tanks_min: 0,
          clerics_min: 0,
          bards_min: 0,
          ranged_dps_min: 0,
          melee_dps_min: 0,
          tanks_max: null,
          clerics_max: null,
          bards_max: null,
          ranged_dps_max: null,
          melee_dps_max: null,
          allow_combined_dps: false,
          combined_dps_max: null,
          ror_tanks_min: 0,
          ror_tanks_max: null,
          ror_healers_min: 0,
          ror_healers_max: null,
          ror_dps_min: 0,
          ror_dps_max: null,
          is_public: false,
          allow_allied_signups: false,
        },
        true
      );
    });

    expect(notifyNewEvent).toHaveBeenCalledWith(
      'https://discord.example',
      createdEvent,
      'Test Group',
      'group-slug',
      'role-1'
    );
  });

  it('upserts RSVP and refreshes events', async () => {
    const eventsFetchQuery = buildEventsQuery([]);
    const announcementsQuery = buildAnnouncementsQuery([]);

    const rsvpQuery = {
      upsert: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(eventsFetchQuery)
      .mockReturnValueOnce(announcementsQuery)
      .mockReturnValueOnce(rsvpQuery)
      .mockReturnValueOnce(eventsFetchQuery);

    const { result } = renderHook(() => useEvents('group-123', 'user-1', 'aoc'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.setRsvp('event-1', 'attending', 'tank', 'char-1');
    });

    expect(rsvpQuery.upsert).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('event_rsvps');
  });

  it('removes RSVP and refreshes events', async () => {
    const eventsFetchQuery = buildEventsQuery([]);
    const announcementsQuery = buildAnnouncementsQuery([]);

    const deleteQuery = {
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(eventsFetchQuery)
      .mockReturnValueOnce(announcementsQuery)
      .mockReturnValueOnce(deleteQuery)
      .mockReturnValueOnce(eventsFetchQuery);

    const { result } = renderHook(() => useEvents('group-123', 'user-1', 'aoc'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeRsvp('event-1');
    });

    expect(deleteQuery.delete).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('event_rsvps');
  });
});
