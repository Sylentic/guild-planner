'use client';

import { useState } from 'react';
import { Users, Send } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';
import { ClanSearchDropdown } from './ClanSearchDropdown';
import { useLanguage } from '@/contexts/LanguageContext';

interface Clan {
  id: string;
  name: string;
  slug: string;
}

interface InviteGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (clanId: string) => Promise<void>;
  allianceId: string;
  allianceName: string;
  excludeClanIds: string[];
}

/**
 * Modal for inviting a guild to an alliance
 */
export function InviteGuildModal({
  isOpen,
  onClose,
  onInvite,
  allianceName,
  excludeClanIds,
}: InviteGuildModalProps) {
  const { t } = useLanguage();
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClan) {
      setError(t('alliance.errorSelectClan'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onInvite(selectedClan.id);
      setSelectedClan(null);
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Error inviting guild:', err);
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (clan: Clan) => {
    setSelectedClan(clan);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('alliance.inviteGuild')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-slate-400 text-sm">
          {t('alliance.inviteToAlliance', { alliance: allianceName })}
        </p>

        {/* Clan Search */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {t('alliance.selectClan')} *
          </label>
          {selectedClan ? (
            <div className="flex items-center justify-between p-3 bg-slate-800 border border-purple-500 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-medium">{selectedClan.name}</div>
                  <div className="text-xs text-slate-500">/{selectedClan.slug}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClan(null)}
                className="text-sm text-slate-400 hover:text-white"
              >
                {t('common.change')}
              </button>
            </div>
          ) : (
            <ClanSearchDropdown
              onSelect={handleSelect}
              excludeClanIds={excludeClanIds}
              placeholder={t('alliance.searchClan')}
            />
          )}
        </div>

        {/* Optional Message */}
        <div>
          <label htmlFor="alliance-invite-message" className="block text-sm font-medium text-slate-300 mb-1">
            {t('alliance.inviteMessage')} ({t('common.optional')})
          </label>
          <textarea
            id="alliance-invite-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('alliance.inviteMessagePlaceholder')}
            rows={2}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            maxLength={200}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedClan}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? t('common.loading') : t('alliance.sendInvite')}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
