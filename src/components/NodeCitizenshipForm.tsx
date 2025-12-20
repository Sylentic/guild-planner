'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { NodeType, NodeStage, NODE_TYPE_CONFIG, NODE_STAGE_NAMES } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface NodeCitizenshipFormData {
  node_name: string;
  node_type: NodeType;
  node_stage: NodeStage;
  region?: string;
  is_mayor: boolean;
  is_council_member: boolean;
}

interface NodeCitizenshipFormProps {
  characterName: string;
  initialData?: Partial<NodeCitizenshipFormData>;
  onSubmit: (data: NodeCitizenshipFormData) => Promise<void>;
  onRemove?: () => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const NODE_TYPES: NodeType[] = ['divine', 'economic', 'military', 'scientific'];
const NODE_STAGES: NodeStage[] = [3, 4, 5, 6]; // Only stages with citizenship

export function NodeCitizenshipForm({
  characterName,
  initialData,
  onSubmit,
  onRemove,
  onCancel,
  isEditing = false,
}: NodeCitizenshipFormProps) {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<NodeCitizenshipFormData>({
    node_name: initialData?.node_name || '',
    node_type: initialData?.node_type || 'economic',
    node_stage: initialData?.node_stage || 3,
    region: initialData?.region || '',
    is_mayor: initialData?.is_mayor || false,
    is_council_member: initialData?.is_council_member || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.node_name.trim()) {
      setError(t('nodes.nodeNameRequired'));
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

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsSubmitting(true);
    try {
      await onRemove();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4 pb-24">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            {isEditing ? t('nodes.editCitizenship') : t('nodes.setCitizenship')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Character name display */}
          <div className="text-sm text-slate-400">
            {t('nodes.forCharacter')}: <span className="text-white font-medium">{characterName}</span>
          </div>

          {/* Node Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('nodes.nodeName')} *
            </label>
            <input
              type="text"
              value={formData.node_name}
              onChange={(e) => setFormData({ ...formData, node_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t('nodes.nodeNamePlaceholder')}
              autoFocus
            />
          </div>

          {/* Node Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('nodes.nodeType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NODE_TYPES.map((type) => {
                const config = NODE_TYPE_CONFIG[type];
                const isSelected = formData.node_type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, node_type: type })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-700 ring-2 ring-emerald-500'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                      {t(`nodes.types.${type}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Stage */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('nodes.nodeStage')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {NODE_STAGES.map((stage) => {
                const isSelected = formData.node_stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setFormData({ ...formData, node_stage: stage })}
                    className={`flex flex-col items-center p-2 rounded-lg text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 ring-2 ring-emerald-500 text-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="font-bold">{stage}</span>
                    <span className="text-xs">{NODE_STAGE_NAMES[stage]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('nodes.region')} <span className="text-slate-500">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t('nodes.regionPlaceholder')}
            />
          </div>

          {/* Special Roles */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_mayor: !formData.is_mayor })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                formData.is_mayor
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
              }`}
            >
              👑 {t('nodes.mayor')}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_council_member: !formData.is_council_member })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                formData.is_council_member
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                  : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
              }`}
            >
              🏛️ {t('nodes.councilMember')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEditing && onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('nodes.removeCitizenship')}
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.node_name.trim()}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
