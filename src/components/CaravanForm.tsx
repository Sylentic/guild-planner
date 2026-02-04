'use client';

import { useState } from 'react';
import { Truck, MapPin, Clock, Coins, Plus, X, AlertTriangle, Users } from 'lucide-react';
import { Modal, ModalFooter } from './ui/Modal';
import { useLanguage } from '@/contexts/LanguageContext';
import { CaravanData } from '@/hooks/useCaravans';
import { CaravanType } from '@/lib/types';

// Escort requirement with detailed fields per user feedback
interface EscortRequirement {
  id: string;
  role: string;
  archetype?: string;
  minLevel?: number;
  buildName?: string;
  count: number;
  isRequired: boolean;
  acceptsExtras: boolean;
}

interface CaravanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CaravanData & { escortRequirements?: EscortRequirement[] }) => Promise<void>;
  initialData?: Partial<CaravanData>;
  isEditing?: boolean;
}

const CARAVAN_TYPES: { id: CaravanType; labelKey: string }[] = [
  { id: 'personal', labelKey: 'caravan.types.personal' },
  { id: 'guild', labelKey: 'caravan.types.guild' },
  { id: 'trade_route', labelKey: 'caravan.types.trade_route' },
  { id: 'escort', labelKey: 'caravan.types.escort' },
];

// Role keys for translation lookup
const ROLE_TRANSLATION_KEYS: Record<string, string> = {
  'Tank': 'party.tank',
  'Healer': 'party.healer',
  'DPS': 'party.dps',
  'Scout': 'siege.roles.scout',
  'Siege Operator': 'siege.roles.siege_operator',
  'Reserve': 'siege.roles.reserve',
};

const PREDEFINED_ROLES = ['Tank', 'Healer', 'DPS', 'Scout', 'Siege Operator', 'Reserve'];
const ARCHETYPES = ['Tank', 'Fighter', 'Rogue', 'Ranger', 'Mage', 'Summoner', 'Cleric', 'Bard'];

/**
 * Form modal for creating or editing a caravan
 * Includes detailed escort requirements per user feedback
 */
export function CaravanForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: CaravanFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic caravan info
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [caravanType, setCaravanType] = useState<CaravanType>(initialData?.caravan_type || 'guild');
  const [originNode, setOriginNode] = useState(initialData?.origin_node || '');
  const [destinationNode, setDestinationNode] = useState(initialData?.destination_node || '');
  const [departureAt, setDepartureAt] = useState(initialData?.departure_at || '');
  const [cargoValue, setCargoValue] = useState(initialData?.cargo_value?.toString() || '');
  const [cargoDescription, setCargoDescription] = useState(initialData?.cargo_description || '');

  // Escort settings
  const [minEscorts, setMinEscorts] = useState(initialData?.min_escorts?.toString() || '3');
  const [maxEscorts, setMaxEscorts] = useState(initialData?.max_escorts?.toString() || '10');
  const [escortRewardGold, setEscortRewardGold] = useState(initialData?.escort_reward_gold?.toString() || '');
  const [escortRewardDkp, setEscortRewardDkp] = useState(initialData?.escort_reward_dkp?.toString() || '');

  // Detailed escort requirements
  const [escortRequirements, setEscortRequirements] = useState<EscortRequirement[]>([]);
  const [showRequirements, setShowRequirements] = useState(false);

  const addRequirement = () => {
    setEscortRequirements([
      ...escortRequirements,
      {
        id: `req-${Date.now()}`,
        role: 'Tank',
        count: 1,
        isRequired: true,
        acceptsExtras: true,
      },
    ]);
  };

  const updateRequirement = (id: string, updates: Partial<EscortRequirement>) => {
    setEscortRequirements(reqs =>
      reqs.map(req => (req.id === id ? { ...req, ...updates } : req))
    );
  };

  const removeRequirement = (id: string) => {
    setEscortRequirements(reqs => reqs.filter(req => req.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t('caravan.errorTitleRequired'));
      return;
    }
    if (!originNode.trim()) {
      setError(t('caravan.errorOriginRequired'));
      return;
    }
    if (!destinationNode.trim()) {
      setError(t('caravan.errorDestinationRequired'));
      return;
    }
    if (!departureAt) {
      setError(t('caravan.errorDepartureRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const caravanData: CaravanData & { escortRequirements?: EscortRequirement[] } = {
        title: title.trim(),
        description: description.trim() || undefined,
        caravan_type: caravanType,
        origin_node: originNode.trim(),
        destination_node: destinationNode.trim(),
        departure_at: new Date(departureAt).toISOString(),
        cargo_value: parseInt(cargoValue) || 0,
        cargo_description: cargoDescription.trim() || undefined,
        min_escorts: parseInt(minEscorts) || 3,
        max_escorts: parseInt(maxEscorts) || 10,
        escort_reward_gold: parseInt(escortRewardGold) || 0,
        escort_reward_dkp: parseInt(escortRewardDkp) || 0,
        escortRequirements: escortRequirements.length > 0 ? escortRequirements : undefined,
      };

      await onSubmit(caravanData);
      onClose();
    } catch (err) {
      console.error('Error creating caravan:', err);
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('caravan.editCaravan') : t('caravan.createCaravan')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="caravan-title" className="block text-sm font-medium text-slate-300 mb-1">
            {t('caravan.caravanTitle')} *
          </label>
          <input
            id="caravan-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('caravan.titlePlaceholder')}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Caravan Type */}
        <div>
          <label htmlFor="caravan-type" className="block text-sm font-medium text-slate-300 mb-1">
            {t('siege.siegeType')}
          </label>
          <select
            id="caravan-type"
            value={caravanType}
            onChange={(e) => setCaravanType(e.target.value as CaravanType)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            {CARAVAN_TYPES.map(type => (
              <option key={type.id} value={type.id}>{t(type.labelKey)}</option>
            ))}
          </select>
        </div>

        {/* Route */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <MapPin className="w-3 h-3 inline mr-1 text-green-400" />
              {t('caravan.origin')} *
            </label>
            <input
              id="caravan-origin"
              type="text"
              value={originNode}
              onChange={(e) => setOriginNode(e.target.value)}
              placeholder={t('nodes.nodeNamePlaceholder')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <MapPin className="w-3 h-3 inline mr-1 text-red-400" />
              {t('caravan.destination')} *
            </label>
            <input
              id="caravan-destination"
              type="text"
              value={destinationNode}
              onChange={(e) => setDestinationNode(e.target.value)}
              placeholder={t('nodes.nodeNamePlaceholder')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Departure Time */}
        <div>
          <label htmlFor="caravan-departure" className="block text-sm font-medium text-slate-300 mb-1">
            <Clock className="w-3 h-3 inline mr-1" />
            {t('caravan.departure')} *
          </label>
          <input
            id="caravan-departure"
            type="datetime-local"
            value={departureAt}
            onChange={(e) => setDepartureAt(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Cargo Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="caravan-cargo-value" className="block text-sm font-medium text-slate-300 mb-1">
              <Coins className="w-3 h-3 inline mr-1 text-yellow-400" />
              {t('caravan.cargoValue')}
            </label>
            <input
              id="caravan-cargo-value"
              type="number"
              value={cargoValue}
              onChange={(e) => setCargoValue(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="caravan-cargo-description" className="block text-sm font-medium text-slate-300 mb-1">
              {t('caravan.cargoDescription')}
            </label>
            <input
              id="caravan-cargo-description"
              type="text"
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder={t('caravan.cargoDescPlaceholder')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Escort Settings */}
        <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            {t('caravan.escortSettings')}
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="caravan-min-escorts" className="block text-xs text-slate-400 mb-1">
                {t('caravan.minEscorts')}
              </label>
              <input
                id="caravan-min-escorts"
                type="number"
                value={minEscorts}
                onChange={(e) => setMinEscorts(e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="caravan-max-escorts" className="block text-xs text-slate-400 mb-1">
                {t('caravan.maxEscorts')}
              </label>
              <input
                id="caravan-max-escorts"
                type="number"
                value={maxEscorts}
                onChange={(e) => setMaxEscorts(e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="caravan-reward-gold" className="block text-xs text-slate-400 mb-1">
                {t('caravan.escortReward')} (Gold)
              </label>
              <input
                id="caravan-reward-gold"
                type="number"
                value={escortRewardGold}
                onChange={(e) => setEscortRewardGold(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="caravan-reward-dkp" className="block text-xs text-slate-400 mb-1">
                {t('caravan.escortReward')} (DKP)
              </label>
              <input
                id="caravan-reward-dkp"
                type="number"
                value={escortRewardDkp}
                onChange={(e) => setEscortRewardDkp(e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Detailed Escort Requirements */}
        <div className="border-t border-slate-700 pt-4">
          <button
            type="button"
            onClick={() => setShowRequirements(!showRequirements)}
            className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <AlertTriangle className="w-4 h-4" />
            {showRequirements ? t('caravan.hideRequirements') : t('caravan.showRequirements')}
          </button>

          {showRequirements && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-500">{t('caravan.requirementsHint')}</p>

              {escortRequirements.map((req) => (
                <div key={req.id} className="p-3 bg-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{req.role}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(req.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                      aria-label="Remove requirement"
                      title="Remove requirement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor={`escort-role-${req.id}`} className="block text-xs text-slate-500 mb-1">{t('siege.roles.frontline')}</label>
                      <select
                        id={`escort-role-${req.id}`}
                        value={req.role}
                        onChange={(e) => updateRequirement(req.id, { role: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                      >
                        {PREDEFINED_ROLES.map(role => (
                          <option key={role} value={role}>{t(ROLE_TRANSLATION_KEYS[role])}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`escort-archetype-${req.id}`} className="block text-xs text-slate-500 mb-1">{t('character.primaryArchetype')}</label>
                      <select
                        id={`escort-archetype-${req.id}`}
                        value={req.archetype || ''}
                        onChange={(e) => updateRequirement(req.id, { archetype: e.target.value || undefined })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                      >
                        <option value="">{t('common.optional')}</option>
                        {ARCHETYPES.map(arch => (
                          <option key={arch} value={arch}>{t(`archetypes.${arch.toLowerCase()}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`req-level-${req.id}`} className="block text-xs text-slate-500 mb-1">{t('character.level')}</label>
                      <input
                        id={`req-level-${req.id}`}
                        type="number"
                        value={req.minLevel || ''}
                        onChange={(e) => updateRequirement(req.id, { minLevel: parseInt(e.target.value) || undefined })}
                        placeholder=""
                        min="1"
                        max="50"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor={`req-count-${req.id}`} className="block text-xs text-slate-500 mb-1">{t('caravan.countNeeded')}</label>
                      <input
                        id={`req-count-${req.id}`}
                        type="number"
                        value={req.count}
                        onChange={(e) => updateRequirement(req.id, { count: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="20"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`req-${req.id}`}
                        checked={req.isRequired}
                        onChange={(e) => updateRequirement(req.id, { isRequired: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor={`req-${req.id}`} className="text-xs text-slate-400">
                        {t('caravan.isRequired')}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`extras-${req.id}`}
                        checked={req.acceptsExtras}
                        onChange={(e) => updateRequirement(req.id, { acceptsExtras: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor={`extras-${req.id}`} className="text-xs text-slate-400">
                        {t('caravan.acceptsExtras')}
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRequirement}
                className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-sm text-slate-400 hover:border-amber-500 hover:text-amber-400 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('caravan.addRequirement')}
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="caravan-description" className="block text-sm font-medium text-slate-300 mb-1">
            {t('siege.description')}
          </label>
          <textarea
            id="caravan-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('siege.descriptionPlaceholder')}
            rows={2}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
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
            disabled={isSubmitting || !title.trim() || !originNode.trim() || !destinationNode.trim()}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            {isSubmitting ? t('common.loading') : isEditing ? t('common.save') : t('caravan.createCaravan')}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

