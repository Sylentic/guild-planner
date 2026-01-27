'use client';

import { useState } from 'react';
import { X, Megaphone, Pin } from 'lucide-react';
import { Announcement } from '@/lib/events';

interface AnnouncementFormProps {
  clanId: string;
  userId: string;
  initialData?: Partial<Announcement>;
  onSubmit: (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>, sendDiscordNotification: boolean) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function AnnouncementForm({
  clanId,
  userId,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned || false);
  const [sendDiscordNotification, setSendDiscordNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        clan_id: clanId,
        created_by: userId,
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
      }, sendDiscordNotification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            {isEditing ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="announcement-title" className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Announcement title"
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="announcement-content" className="block text-sm font-medium text-slate-300 mb-2">
              Content *
            </label>
            <textarea
              id="announcement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Write your announcement here..."
            />
          </div>

          {/* Pin option */}
          <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <Pin size={16} className={isPinned ? 'text-amber-400' : 'text-slate-400'} />
            <div>
              <span className="text-white text-sm font-medium">Pin announcement</span>
              <p className="text-xs text-slate-500">Pinned announcements stay at the top</p>
            </div>
          </label>

          {/* Discord Notification */}
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="sendDiscordNotificationAnn"
              checked={sendDiscordNotification}
              onChange={(e) => setSendDiscordNotification(e.target.checked)}
              className="w-4 h-4 text-amber-500 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-amber-500"
            />
            <label htmlFor="sendDiscordNotificationAnn" className="text-sm text-slate-300 cursor-pointer">
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
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
