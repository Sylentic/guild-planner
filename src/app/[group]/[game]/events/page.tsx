'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { useEvents } from '@/hooks/useEvents';
import { EventsList } from '@/components/EventsList';

export default function EventsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user, profile } = useAuthContext();

  const { group, characters } = useGroupData(groupSlug, gameSlug);
  const { canManageMembers } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  const {
    events,
    announcements,
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    setRsvp,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useEvents(group?.id || null, user?.id || null, gameSlug, groupSlug);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="events"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="events">
      <EventsList
        events={events}
        announcements={announcements}
        timezone={profile?.timezone || 'UTC'}
        groupId={group.id}
        groupSlug={groupSlug}
        gameSlug={gameSlug}
        userId={user.id}
        characters={characters}
        canManage={canManageMembers}
        onCreateEvent={async (eventData, sendDiscordNotification) => {
          await createEvent(eventData, sendDiscordNotification);
        }}
        onUpdateEvent={updateEvent}
        onCancelEvent={cancelEvent}
        onDeleteEvent={deleteEvent}
        onRsvp={setRsvp}
        onCreateAnnouncement={async (announcementData, sendDiscordNotification) => {
          await createAnnouncement(announcementData, sendDiscordNotification);
        }}
        onUpdateAnnouncement={updateAnnouncement}
        onDeleteAnnouncement={deleteAnnouncement}
      />
    </GameLayout>
  );
}