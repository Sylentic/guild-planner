'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Event, EventType, EVENT_TYPES, EVENT_ROLES, utcToLocal } from '@/lib/events';

interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  starts_at: string;
  ends_at: string;
  location: string;
  max_attendees: string;
  tanks_needed: string;
  clerics_needed: string;
  bards_needed: string;
  ranged_dps_needed: string;
  melee_dps_needed: string;
  sendDiscordNotification: boolean;
}

interface EventFormProps {
  initialData?: Partial<Event>;
  clanId: string;
  userId: string;
  onSubmit: (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_cancelled'>, sendDiscordNotification: boolean) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function EventForm({ 
  initialData, 
  clanId,
  userId,
  onSubmit, 
  onCancel,
  isEditing = false 
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    event_type: initialData?.event_type || 'other',
    starts_at: initialData?.starts_at ? utcToLocal(initialData.starts_at) : '',
    ends_at: initialData?.ends_at ? utcToLocal(initialData.ends_at) : '',
    location: initialData?.location || '',
    max_attendees: initialData?.max_attendees?.toString() || '',
    tanks_needed: initialData?.tanks_needed?.toString() || '0',
    clerics_needed: initialData?.clerics_needed?.toString() || '0',
    bards_needed: initialData?.bards_needed?.toString() || '0',
    ranged_dps_needed: initialData?.ranged_dps_needed?.toString() || '0',
    melee_dps_needed: initialData?.melee_dps_needed?.toString() || '0',
    sendDiscordNotification: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EventForm handleSubmit called with formData:', formData);
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.starts_at) {
      setError('Start time is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Parsing role values:',{
        tanks_needed_raw: formData.tanks_needed,
        tanks_needed_parsed: parseInt(formData.tanks_needed),
        clerics_needed_raw: formData.clerics_needed,
        clerics_needed_parsed: parseInt(formData.clerics_needed),
        bards_needed_raw: formData.bards_needed,
        bards_needed_parsed: parseInt(formData.bards_needed),
        ranged_dps_needed_raw: formData.ranged_dps_needed,
        ranged_dps_needed_parsed: parseInt(formData.ranged_dps_needed),
        melee_dps_needed_raw: formData.melee_dps_needed,
        melee_dps_needed_parsed: parseInt(formData.melee_dps_needed),
      });
      const eventData = {
        clan_id: clanId,
        created_by: userId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        event_type: formData.event_type,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
        location: formData.location.trim() || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        tanks_needed: parseInt(formData.tanks_needed) || 0,
        clerics_needed: parseInt(formData.clerics_needed) || 0,
        bards_needed: parseInt(formData.bards_needed) || 0,
        ranged_dps_needed: parseInt(formData.ranged_dps_needed) || 0,
        melee_dps_needed: parseInt(formData.melee_dps_needed) || 0,
      };
      console.log('EventForm submitting eventData:', eventData, 'sendDiscordNotification:', formData.sendDiscordNotification);
      await onSubmit(eventData, formData.sendDiscordNotification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Weekly Dungeon Run"
              autoFocus
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(EVENT_TYPES).map(([id, type]) => {
                const isSelected = formData.event_type === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, event_type: id as EventType })}
                    className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: type.color + '30',
                      color: type.color
                    } : undefined}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className={isSelected ? '' : 'text-slate-300'}>{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="event-starts-at" className="block text-sm font-medium text-slate-300 mb-2">
              Start Date & Time *
            </label>
            <input
              id="event-starts-at"
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="event-ends-at" className="block text-sm font-medium text-slate-300 mb-2">
              End Date & Time <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="event-ends-at"
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Node 5 - Dungeon Entrance"
            />
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="event-max-attendees" className="block text-sm font-medium text-slate-300 mb-2">
              Max Attendees <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="event-max-attendees"
              type="number"
              min="1"
              max="100"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Role Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role Requirements <span className="text-slate-500">(optional)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(EVENT_ROLES).map(([roleKey, roleConfig]) => {
                const fieldName = `${roleKey}_needed` as 'tanks_needed' | 'clerics_needed' | 'bards_needed' | 'ranged_dps_needed' | 'melee_dps_needed';
                return (
                  <div key={roleKey} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{roleConfig.icon}</span>
                      <span className={`text-xs ${roleConfig.color}`}>
                        {roleConfig.name}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={formData[fieldName]}
                      aria-label={roleConfig.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [fieldName]: e.target.value 
                      })}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Additional details about the event..."
            />
          </div>

          {/* Discord Notification */}
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="sendDiscordNotification"
              checked={formData.sendDiscordNotification}
              onChange={(e) => setFormData({ ...formData, sendDiscordNotification: e.target.checked })}
              className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <label htmlFor="sendDiscordNotification" className="text-sm text-slate-300 cursor-pointer">
              Send Discord notification
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
