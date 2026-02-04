'use client';

import { useState } from 'react';
import { Handshake, Users, Globe, Lock } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { ClanSearchDropdown } from '@/components/layout/ClanSearchDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { AllianceData } from '@/hooks/useAlliances';

interface Clan {
  id: string;
  name: string;
  slug: string;
}

interface AllianceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AllianceData, invitedClans: string[]) => Promise<void>;
  groupId: string;
  initialData?: Partial<AllianceData>;
  isEditing?: boolean;
}

/**
 * Form modal for creating or editing an alliance
 */
export function AllianceForm({
  isOpen,
  onClose,
  onSubmit,
  groupId,
  initialData,
  isEditing = false,
}: AllianceFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [maxGuilds, setMaxGuilds] = useState(initialData?.max_guilds?.toString() || '10');
  const [selectedClans, setSelectedClans] = useState<Clan[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('alliance.errorNameRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const allianceData: AllianceData = {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
        max_guilds: parseInt(maxGuilds) || 10,
      };

      await onSubmit(allianceData, selectedClans.map(c => c.id));
      
      // Reset form
      setName('');
      setDescription('');
      setIsPublic(true);
      setMaxGuilds('10');
      setSelectedClans([]);
      onClose();
    } catch (err) {
      console.error('Error creating alliance:', err);
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClan = (clan: Clan) => {
    if (!selectedClans.some(c => c.id === clan.id)) {
      setSelectedClans([...selectedClans, clan]);
    }
  };

  const handleRemoveClan = (groupId: string) => {
    setSelectedClans(selectedClans.filter(c => c.id !== groupId));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('alliance.editAlliance') : t('alliance.createAlliance')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alliance Name */}
        <div>
          <label htmlFor="alliance-name" className="block text-sm font-medium text-slate-300 mb-1">
            {t('alliance.allianceName')} *
          </label>
          <input
            id="alliance-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('alliance.allianceNamePlaceholder')}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            maxLength={50}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="alliance-description" className="block text-sm font-medium text-slate-300 mb-1">
            {t('alliance.description')}
          </label>
          <textarea
            id="alliance-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('alliance.descriptionPlaceholder')}
            rows={3}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">
            {t('alliance.descriptionHint')}
          </p>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="w-5 h-5 text-green-400" />
            ) : (
              <Lock className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <div className="text-sm font-medium text-white">
                {isPublic ? t('alliance.publicAlliance') : t('alliance.privateAlliance')}
              </div>
              <div className="text-xs text-slate-500">
                {isPublic ? t('alliance.publicDesc') : t('alliance.privateDesc')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isPublic ? 'bg-green-600' : 'bg-slate-600'
            }`}
            aria-label={isPublic ? t('alliance.makePrivate') : t('alliance.makePublic')}
            title={isPublic ? t('alliance.makePrivate') : t('alliance.makePublic')}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isPublic ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Max Guilds */}
        <div>
          <label htmlFor="alliance-max-guilds" className="block text-sm font-medium text-slate-300 mb-1">
            {t('alliance.maxGuilds')}
          </label>
          <select
            id="alliance-max-guilds"
            value={maxGuilds}
            onChange={(e) => setMaxGuilds(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {[2, 3, 4, 5, 6, 8, 10, 15, 20].map(n => (
              <option key={n} value={n}>{n} {t('alliance.guilds')}</option>
            ))}
          </select>
        </div>

        {/* Invite Clans */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              {t('alliance.inviteClansOnCreate')}
            </label>
            <ClanSearchDropdown
              onSelect={handleAddClan}
              excludeClanIds={[groupId]}
              selectedClans={selectedClans}
              multiple
              onRemove={handleRemoveClan}
              placeholder={t('alliance.searchClanToInvite')}
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('alliance.inviteClansHint')}
            </p>
          </div>
        )}

        {/* Error Message */}
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
            disabled={isSubmitting || !name.trim()}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Handshake className="w-4 h-4" />
            {isSubmitting ? t('common.loading') : isEditing ? t('common.save') : t('alliance.createAlliance')}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

