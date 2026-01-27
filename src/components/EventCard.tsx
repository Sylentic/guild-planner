'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Check, HelpCircle, X, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { 
  EventWithRsvps, 
  RsvpStatus, 
  EventRole,
  EVENT_TYPES, 
  EVENT_ROLES,
  RSVP_STATUSES,
  formatEventTime,
  formatTime,
  getRelativeTime,
  isEventPast,
  isEventNow
} from '@/lib/events';

interface EventCardProps {
  event: EventWithRsvps;
  timezone: string;
  onRsvp: (status: RsvpStatus, role?: EventRole | null) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  canManage?: boolean;
}

export function EventCard({ 
  event, 
  timezone, 
  onRsvp, 
  onEdit, 
  onCancel,
  canManage = false 
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<EventRole | null>(null);
  const { showToast } = useToast();
  
  const eventType = EVENT_TYPES[event.event_type];
  const isPast = isEventPast(event.starts_at);
  const isNow = isEventNow(event.starts_at, event.ends_at);
  const userRsvp = event.user_rsvp;

  const totalAttending = event.rsvp_counts.attending + event.rsvp_counts.maybe;

  // Copy event link to clipboard
  const copyEventLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?tab=events#event-${event.id}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Event link copied to clipboard!');
  };
  
  // When calculating if full, exclude current user's RSVP if they have one
  // This allows switching from Maybe to Attending even if at capacity
  const userCountsTowardCapacity = userRsvp && (userRsvp.status === 'attending' || userRsvp.status === 'maybe');
  const effectiveAttending = userCountsTowardCapacity ? totalAttending - 1 : totalAttending;
  const isFull = event.max_attendees ? effectiveAttending >= event.max_attendees : false;

  return (
    <div
      id={`event-${event.id}`}
      className={`bg-slate-900/80 backdrop-blur-sm rounded-lg border transition-all scroll-mt-4 ${
        event.is_cancelled ? 'border-red-500/50 opacity-60' :
        isNow ? 'border-green-500 shadow-lg shadow-green-500/20' :
        isPast ? 'border-slate-700 opacity-70' :
        'border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Event type icon and title */}
          <div className="flex items-start gap-3 min-w-0">
            <div 
              className="p-2 rounded-lg text-xl shrink-0"
              style={{ backgroundColor: eventType.color + '20' }}
            >
              {eventType.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold truncate ${event.is_cancelled ? 'line-through text-slate-400' : 'text-white'}`}>
                  {event.title}
                </h3>
                {isNow && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full animate-pulse">
                    NOW
                  </span>
                )}
                {event.is_cancelled && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                    CANCELLED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatEventTime(event.starts_at, timezone)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side: RSVP counts and expand */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Copy link button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyEventLink();
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded cursor-pointer transition-colors"
              title="Copy event link"
              aria-label="Copy event link"
            >
              <LinkIcon size={16} />
            </button>
            
            {/* Attendee count */}
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <Users size={14} />
              <span className="text-green-400">{event.rsvp_counts.attending}</span>
              {event.rsvp_counts.maybe > 0 && (
                <span className="text-yellow-400">+{event.rsvp_counts.maybe}?</span>
              )}
              {event.max_attendees && (
                <span className="text-slate-500">/{event.max_attendees}</span>
              )}
            </div>

            {/* Relative time */}
            <span className="text-xs text-slate-500 hidden sm:block">
              {getRelativeTime(event.starts_at)}
            </span>

            {/* Expand indicator */}
            <div className="text-slate-400">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Description */}
          {event.description && (
            <p className="text-slate-300 text-sm">{event.description}</p>
          )}

          {/* Time details */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Starts: {formatTime(event.starts_at, timezone)}</span>
              {event.ends_at && (
                <span>- Ends: {formatTime(event.ends_at, timezone)}</span>
              )}
            </div>
          </div>

          {/* Role Requirements & Roster */}
          {(event.tanks_needed > 0 || event.clerics_needed > 0 || event.bards_needed > 0 || 
            event.ranged_dps_needed > 0 || event.melee_dps_needed > 0) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Role Composition</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(EVENT_ROLES).map(([roleKey, roleConfig]) => {
                  const role = roleKey as EventRole;
                  const needed = event[`${roleKey}_needed` as keyof EventWithRsvps] as number;
                  if (needed === 0) return null;
                  
                  const roleCounts = event.role_counts?.[role] || { attending: 0, maybe: 0 };
                  const attending = roleCounts.attending;
                  const maybe = roleCounts.maybe;
                  const total = attending + maybe;
                  const isFull = total >= needed;
                  
                  // Get RSVPs for this role
                  const roleRsvps = event.rsvps?.filter(rsvp => 
                    rsvp.role === role && 
                    (rsvp.status === 'attending' || rsvp.status === 'maybe')
                  ) || [];
                  
                  return (
                    <div 
                      key={role}
                      className="bg-slate-800/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{roleConfig.icon}</span>
                          <span className={`text-sm font-medium ${roleConfig.color}`}>
                            {roleConfig.name}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${isFull ? 'text-green-400' : 'text-slate-400'}`}>
                          {total}/{needed}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (total / needed) * 100)}%`,
                            backgroundColor: roleConfig.color
                          }}
                        />
                      </div>
                      
                      {/* List of signups */}
                      {roleRsvps.length > 0 && (
                        <div className="text-xs space-y-1">
                          {roleRsvps.map((rsvp, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-1.5 text-slate-300"
                            >
                              {rsvp.status === 'attending' ? (
                                <Check size={12} className="text-green-400" />
                              ) : (
                                <HelpCircle size={12} className="text-yellow-400" />
                              )}
                              <span className="truncate">S
                                {rsvp.character?.name || rsvp.user?.display_name || 'Unknown'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RSVP buttons */}
          {!event.is_cancelled && !isPast && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(['attending', 'maybe', 'declined'] as RsvpStatus[]).map((status) => {
                  const rsvpInfo = RSVP_STATUSES[status];
                  const isSelected = userRsvp?.status === status;
                  const isDisabled = status === 'attending' && isFull && !isSelected;
                  
                  return (
                    <button
                      key={status}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (status === 'declined') {
                          onRsvp(status, null);
                        } else {
                          onRsvp(status, selectedRole);
                        }
                      }}
                      disabled={isDisabled}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={isSelected ? { 
                        backgroundColor: rsvpInfo.color + '30',
                        color: rsvpInfo.color
                      } : undefined}
                    >
                      {status === 'attending' && <Check size={14} />}
                      {status === 'maybe' && <HelpCircle size={14} />}
                      {status === 'declined' && <X size={14} />}
                      {rsvpInfo.name}
                      {isDisabled && ' (Full)'}
                    </button>
                  );
                })}
              </div>
              
              {/* Role selector - show if any roles are needed */}
              {(event.tanks_needed > 0 || event.clerics_needed > 0 || event.bards_needed > 0 || 
                event.ranged_dps_needed > 0 || event.melee_dps_needed > 0) && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Select your role (optional):</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(EVENT_ROLES).map(([roleKey, roleConfig]) => {
                      const role = roleKey as EventRole;
                      const needed = event[`${roleKey}_needed` as keyof EventWithRsvps] as number;
                      if (needed === 0) return null;
                      
                      const isSelected = selectedRole === role;
                      
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(isSelected ? null : role);
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          style={isSelected ? { 
                            backgroundColor: roleConfig.color + '30',
                            color: roleConfig.color
                          } : undefined}
                        >
                          <span>{roleConfig.icon}</span>
                          <span>{roleConfig.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin actions */}
          {canManage && (
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg cursor-pointer"
                >
                  Edit
                </button>
              )}
              {onCancel && !event.is_cancelled && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(); }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg cursor-pointer"
                >
                  Cancel Event
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
