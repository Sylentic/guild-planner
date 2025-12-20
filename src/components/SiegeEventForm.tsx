'use client';

import { useState } from 'react';
import { X, Swords, Castle } from 'lucide-react';
import { SiegeType, SiegeRole, SIEGE_TYPE_CONFIG, SIEGE_ROLE_CONFIG } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface SiegeEventFormData {
  title: string;
  description: string;
  siege_type: SiegeType;
  target_name: string;
  starts_at: string;
  declaration_ends_at: string;
  frontline_needed: number;
  ranged_needed: number;
  healer_needed: number;
  siege_operator_needed: number;
  scout_needed: number;
  reserve_needed: number;
}

interface SiegeEventFormProps {
  initialData?: Partial<SiegeEventFormData>;
  onSubmit: (data: SiegeEventFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const SIEGE_TYPES: SiegeType[] = ['castle_attack', 'castle_defense', 'node_attack', 'node_defense'];
const SIEGE_ROLES: SiegeRole[] = ['frontline', 'ranged', 'healer', 'siege_operator', 'scout', 'reserve'];

// Default role requirements (total ~250)
const DEFAULT_ROLES: Record<SiegeRole, number> = {
  frontline: 80,
  ranged: 60,
  healer: 40,
  siege_operator: 20,
  scout: 10,
  reserve: 40,
};

export function SiegeEventForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: SiegeEventFormProps) {
  const { t } = useLanguage();
  
  // Default date to tomorrow at 8 PM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  const [formData, setFormData] = useState<SiegeEventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    siege_type: initialData?.siege_type || 'castle_attack',
    target_name: initialData?.target_name || '',
    starts_at: initialData?.starts_at?.slice(0, 16) || defaultDate,
    declaration_ends_at: initialData?.declaration_ends_at?.slice(0, 16) || '',
    frontline_needed: initialData?.frontline_needed ?? DEFAULT_ROLES.frontline,
    ranged_needed: initialData?.ranged_needed ?? DEFAULT_ROLES.ranged,
    healer_needed: initialData?.healer_needed ?? DEFAULT_ROLES.healer,
    siege_operator_needed: initialData?.siege_operator_needed ?? DEFAULT_ROLES.siege_operator,
    scout_needed: initialData?.scout_needed ?? DEFAULT_ROLES.scout,
    reserve_needed: initialData?.reserve_needed ?? DEFAULT_ROLES.reserve,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalNeeded = formData.frontline_needed + formData.ranged_needed + 
    formData.healer_needed + formData.siege_operator_needed + 
    formData.scout_needed + formData.reserve_needed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(t('siege.titleRequired'));
      return;
    }
    if (!formData.target_name.trim()) {
      setError(t('siege.targetRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRoleCount = (role: SiegeRole, value: number) => {
    const key = `${role}_needed` as keyof SiegeEventFormData;
    setFormData({ ...formData, [key]: Math.max(0, value) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4 pb-24">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" />
            {isEditing ? t('siege.editSiege') : t('siege.createSiege')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('siege.title')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={t('siege.titlePlaceholder')}
              autoFocus
            />
          </div>

          {/* Siege Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('siege.siegeType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SIEGE_TYPES.map((type) => {
                const config = SIEGE_TYPE_CONFIG[type];
                const isSelected = formData.siege_type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, siege_type: type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? `bg-slate-700 ring-2 ${config.isDefense ? 'ring-blue-500' : 'ring-red-500'}`
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                      {t(`siege.types.${type}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Castle className="inline w-4 h-4 mr-1" />
              {t('siege.targetName')} *
            </label>
            <input
              type="text"
              value={formData.target_name}
              onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={t('siege.targetPlaceholder')}
            />
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('siege.startsAt')} *
              </label>
              <input
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('siege.signupDeadline')}
              </label>
              <input
                type="datetime-local"
                value={formData.declaration_ends_at}
                onChange={(e) => setFormData({ ...formData, declaration_ends_at: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('siege.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={t('siege.descriptionPlaceholder')}
            />
          </div>

          {/* Role Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                {t('siege.roleRequirements')}
              </label>
              <span className={`text-sm ${totalNeeded === 250 ? 'text-green-400' : 'text-slate-400'}`}>
                {t('siege.totalSlots')}: {totalNeeded}/250
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SIEGE_ROLES.map((role) => {
                const config = SIEGE_ROLE_CONFIG[role];
                const key = `${role}_needed` as keyof SiegeEventFormData;
                const value = formData[key] as number;
                return (
                  <div key={role} className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{config.icon}</span>
                      <span className={`text-sm font-medium ${config.color}`}>
                        {t(`siege.roles.${role}`)}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="250"
                      value={value}
                      onChange={(e) => updateRoleCount(role, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                );
              })}
            </div>
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.target_name.trim()}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
