'use client';

import { useState } from 'react';
import { Plus, Calendar, Megaphone, Pin, Trash2, Edit2, Link } from 'lucide-react';
import { EventWithRsvps, Announcement, RsvpStatus, EventRole, Event } from '@/lib/events';
import { EventCard } from './EventCard';
import { EventForm } from './EventForm';
import { AnnouncementForm } from './AnnouncementForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';

interface EventsListProps {
  events: EventWithRsvps[];
  announcements: Announcement[];
  timezone: string;
  clanId: string;
  userId: string;
  canManage: boolean;
  onCreateEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>, sendDiscordNotification: boolean) => Promise<void>;
  onUpdateEvent: (id: string, updates: Partial<EventWithRsvps>) => Promise<void>;
  onCancelEvent: (id: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onRsvp: (eventId: string, status: RsvpStatus, role?: EventRole | null) => Promise<void>;
  onCreateAnnouncement: (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>, sendDiscordNotification: boolean) => Promise<void>;
  onUpdateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export function EventsList({
  events,
  announcements,
  timezone,
  clanId,
  userId,
  canManage,
  onCreateEvent,
  onUpdateEvent,
  onCancelEvent,
  onDeleteEvent,
  onRsvp,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: EventsListProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithRsvps | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions(clanId);
  
  // Check permissions
  const canCreateEvent = hasPermission('events_create');
  const canCreateAnnouncement = hasPermission('announcements_create');

  // Copy announcement link to clipboard
  const copyAnnouncementLink = async (announcementId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?tab=events#announcement-${announcementId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('success', 'Link copied to clipboard!');
    } catch (err) {
      showToast('error', 'Failed to copy link');
    }
  };

  // Split events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.starts_at) >= now || !e.is_cancelled);
  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const recentAnnouncements = announcements.filter(a => !a.is_pinned).slice(0, 5);

  const handleCreateEvent = async (eventData: Omit<import('@/lib/events').Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>, sendDiscordNotification: boolean) => {
    console.log('EventsList.handleCreateEvent called with sendDiscordNotification:', sendDiscordNotification, 'type:', typeof sendDiscordNotification);
    await onCreateEvent(eventData, sendDiscordNotification);
    setShowEventForm(false);
  };

  const handleEditEvent = async (eventData: Omit<import('@/lib/events').Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>, sendDiscordNotification: boolean) => {
    if (editingEvent) {
      await onUpdateEvent(editingEvent.id, eventData);
      setEditingEvent(null);
    }
  };

  const handleCreateAnnouncement = async (data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>, sendDiscordNotification: boolean) => {
    await onCreateAnnouncement(data, sendDiscordNotification);
    setShowAnnouncementForm(false);
  };

  const handleEditAnnouncement = async (data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>, sendDiscordNotification: boolean) => {
    if (editingAnnouncement) {
      await onUpdateAnnouncement(editingAnnouncement.id, data);
      setEditingAnnouncement(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Pin size={14} />
            {t('announcements.pinned')}
          </h3>
          {pinnedAnnouncements.map(announcement => (
            <div
              key={announcement.id}
              id={`announcement-${announcement.id}`}
              className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 group scroll-mt-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-amber-400">{announcement.title}</h4>
                  <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyAnnouncementLink(announcement.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    <Link size={14} />
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteAnnouncement(announcement.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Announcements (non-pinned) */}
      {recentAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Megaphone size={14} />
            {t('announcements.title')}
          </h3>
          {recentAnnouncements.map(announcement => (
            <div
              key={announcement.id}
              id={`announcement-${announcement.id}`}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 group scroll-mt-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{announcement.title}</h4>
                  <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyAnnouncementLink(announcement.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    <Link size={14} />
                  </button>
                  {canManage && (
                    <>
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
                        title="Edit announcement"
                        aria-label="Edit announcement"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteAnnouncement(announcement.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded cursor-pointer"
                        title="Delete announcement"
                        aria-label="Delete announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header with Create buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          {t('event.upcomingEvents')}
          {upcomingEvents.length > 0 && (
            <span className="text-sm font-normal text-slate-400">
              ({upcomingEvents.length})
            </span>
          )}
        </h3>
        {(canCreateEvent || canCreateAnnouncement) && (
          <div className="flex gap-2">
            {canCreateAnnouncement && (
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30 cursor-pointer"
                title="Create announcement"
              >
                <Megaphone size={16} />
                {t('announcements.createAnnouncement')}
              </button>
            )}
            {canCreateEvent && (
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                title="Create event"
              >
                <Plus size={16} />
                {t('event.createEvent')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Events list */}
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('event.noEvents')}</p>
          {canManage && (
            <p className="text-sm mt-2">{t('siege.noUpcomingDesc')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              timezone={timezone}
              clanId={clanId}
              userId={userId}
              onRsvp={(status, role) => onRsvp(event.id, status, role)}
              onEdit={canManage ? () => setEditingEvent(event) : undefined}
              onCancel={canManage ? () => onCancelEvent(event.id) : undefined}
              onDelete={canManage ? () => onDeleteEvent(event.id) : undefined}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showEventForm && (
        <EventForm
          clanId={clanId}
          userId={userId}
          onSubmit={handleCreateEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventForm
          clanId={clanId}
          userId={userId}
          initialData={editingEvent}
          onSubmit={handleEditEvent}
          onCancel={() => setEditingEvent(null)}
          isEditing
        />
      )}

      {/* Create Announcement Modal */}
      {showAnnouncementForm && (
        <AnnouncementForm
          clanId={clanId}
          userId={userId}
          onSubmit={handleCreateAnnouncement}
          onCancel={() => setShowAnnouncementForm(false)}
        />
      )}

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <AnnouncementForm
          clanId={clanId}
          userId={userId}
          initialData={editingAnnouncement}
          onSubmit={handleEditAnnouncement}
          onCancel={() => setEditingAnnouncement(null)}
          isEditing
        />
      )}
    </div>
  );
}
