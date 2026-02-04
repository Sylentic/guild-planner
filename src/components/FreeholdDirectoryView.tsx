'use client';

import { useState } from 'react';
import { Home, Plus, MapPin, Building2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FreeholdWithBuildings, FreeholdSize, FREEHOLD_SIZE_CONFIG } from '@/lib/types';
import { FreeholdData, BuildingData } from '@/hooks/useFreeholds';

interface FreeholdDirectoryViewProps {
  freeholds: FreeholdWithBuildings[];
  onAddFreehold: (data: FreeholdData) => Promise<void>;
  onAddBuilding: (freeholdId: string, data: BuildingData) => Promise<void>;
}

export function FreeholdDirectoryView({
  freeholds,
  onAddFreehold,
  onAddBuilding,
}: FreeholdDirectoryViewProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [newFreehold, setNewFreehold] = useState({
    name: '',
    node_name: '',
    region: '',
    size: 'medium' as FreeholdSize,
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddFreehold(newFreehold);
    setShowForm(false);
    setNewFreehold({ name: '', node_name: '', region: '', size: 'medium', is_public: true });
  };

  // Group freeholds by region
  const byRegion = freeholds.reduce((acc, f) => {
    const region = f.region || 'Unknown';
    if (!acc[region]) acc[region] = [];
    acc[region].push(f);
    return acc;
  }, {} as Record<string, FreeholdWithBuildings[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-green-400" />
          {t('freehold.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('freehold.addFreehold')}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="freehold-name" className="block text-sm text-slate-400 mb-1">{t('freehold.freeholdName')}</label>
              <input
                id="freehold-name"
                type="text"
                value={newFreehold.name}
                onChange={(e) => setNewFreehold({ ...newFreehold, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="freehold-node" className="block text-sm text-slate-400 mb-1">{t('freehold.node')}</label>
              <input
                id="freehold-node"
                type="text"
                value={newFreehold.node_name}
                onChange={(e) => setNewFreehold({ ...newFreehold, node_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label htmlFor="freehold-region" className="block text-sm text-slate-400 mb-1">{t('freehold.region')}</label>
              <input
                id="freehold-region"
                type="text"
                value={newFreehold.region}
                onChange={(e) => setNewFreehold({ ...newFreehold, region: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label htmlFor="freehold-size" className="block text-sm text-slate-400 mb-1">{t('freehold.size')}</label>
              <select
                id="freehold-size"
                value={newFreehold.size}
                onChange={(e) => setNewFreehold({ ...newFreehold, size: e.target.value as FreeholdSize })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {Object.entries(FREEHOLD_SIZE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label} ({config.dimensions})</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={newFreehold.is_public}
              onChange={(e) => setNewFreehold({ ...newFreehold, is_public: e.target.checked })}
              className="rounded bg-slate-700 border-slate-600"
            />
            {t('freehold.isPublic')}
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Directory */}
      {freeholds.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {t('freehold.noFreeholds')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('freehold.noFreeholdsDesc')}
          </p>
        </div>
      ) : (
        Object.entries(byRegion).map(([region, regionFreeholds]) => (
          <div key={region} className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {region} ({regionFreeholds.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {regionFreeholds.map((freehold) => (
                <div
                  key={freehold.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{freehold.name}</h4>
                      <p className="text-sm text-slate-400">
                        {freehold.owner?.display_name || 'Unknown'} •{' '}
                        {FREEHOLD_SIZE_CONFIG[freehold.size].dimensions}
                      </p>
                    </div>
                    {freehold.is_public && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        <Users className="w-3 h-3 inline mr-1" />
                        {t('freehold.isPublic')}
                      </span>
                    )}
                  </div>
                  
                  {freehold.buildings.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {freehold.buildings.map((building) => (
                        <span
                          key={building.id}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3" />
                          {t(`freehold.buildingTypes.${building.building_type}`)} T{building.tier}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

