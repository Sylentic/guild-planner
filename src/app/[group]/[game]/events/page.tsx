'use client';

import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { useEvents } from '@/hooks/useEvents';
import { EventsList } from '@/components/views/EventsList';

export default function EventsPage() {
  const { group, characters, groupSlug, gameSlug, userId, userTimezone } = useGameLayoutContext();

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
  } = useEvents(group?.id || null, userId, gameSlug, groupSlug);

  if (!group || !userId) {
    return null;
  }

  return (
    <EventsList
      events={events}
      announcements={announcements}
      timezone={userTimezone}
      groupId={group.id}
      groupSlug={groupSlug}
      gameSlug={gameSlug}
      userId={userId}
      characters={characters}
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
  );
}