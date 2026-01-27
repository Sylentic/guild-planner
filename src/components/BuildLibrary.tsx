'use client';

import { useState } from 'react';
import { Hammer, Search, Heart, Copy, Eye, Plus, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BuildWithDetails } from '@/lib/types';
import { BuildData } from '@/hooks/useBuilds';
import { getClassName, getArchetypeById, archetypesConfig } from '@/config';

interface BuildLibraryProps {
  builds: BuildWithDetails[];
  onCreateBuild: (data: BuildData) => Promise<string>;
  onLike: (buildId: string) => Promise<void>;
  onCopy: (buildId: string) => Promise<string>;
}

export function BuildLibrary({
  builds,
  onCreateBuild,
  onLike,
  onCopy,
}: BuildLibraryProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formPrimary, setFormPrimary] = useState('');
  const [formSecondary, setFormSecondary] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get class name from primary + secondary
  const getDisplayClassName = (primary: string, secondary?: string): string => {
    if (!secondary) return primary;
    return getClassName(primary, secondary) || `${primary}/${secondary}`;
  };

  // Get AshesCodex URL for archetype
  const getAshesCodexUrl = (archetypeId: string): string => {
    const archetype = getArchetypeById(archetypeId);
    return archetype?.ashescodexUrl || `https://ashescodex.com/db/abilities/${archetypeId}/page/1`;
  };

  // Filter builds
  const filteredBuilds = builds.filter((build) => {
    const matchesSearch = build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      build.primary_archetype.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || build.role === roleFilter;
    const matchesArchetype = archetypeFilter === 'all' || build.primary_archetype === archetypeFilter;
    return matchesSearch && matchesRole && matchesArchetype;
  });

  const roles = ['tank', 'cleric', 'bard', 'ranged_dps', 'melee_dps'];

  const handleLike = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onLike(buildId);
  };

  const handleCopy = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onCopy(buildId);
  };

  const handleCreateSubmit = async () => {
    if (!formPrimary || !formName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreateBuild({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        primary_archetype: formPrimary,
        secondary_archetype: formSecondary || undefined,
        role: getArchetypeById(formPrimary)?.role as 'tank' | 'cleric' | 'bard' | 'ranged_dps' | 'melee_dps' | undefined,
        visibility: 'guild',
        tags: [],
      });
      // Reset form
      setFormPrimary('');
      setFormSecondary('');
      setFormName('');
      setFormDescription('');
      setShowCreateForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed class name for form preview
  const previewClassName = formPrimary && formSecondary 
    ? getDisplayClassName(formPrimary, formSecondary)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Hammer className="w-5 h-5 text-cyan-400" />
          {t('builds.title')}
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('builds.createBuild')}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-4">
          <h3 className="text-white font-medium">{t('builds.newBuild')}</h3>
          
          {/* Archetype Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('builds.primaryArchetype')}</label>
              <select
                value={formPrimary}
                onChange={(e) => setFormPrimary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">{t('common.select')}</option>
                {archetypesConfig.list.map((arch) => (
                  <option key={arch.id} value={arch.id}>
                    {arch.icon} {arch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('builds.secondaryArchetype')}</label>
              <select
                value={formSecondary}
                onChange={(e) => setFormSecondary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={!formPrimary}
              >
                <option value="">{t('common.none')}</option>
                {archetypesConfig.list.map((arch) => (
                  <option key={arch.id} value={arch.id}>
                    {arch.icon} {arch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Name Preview */}
          {previewClassName && (
            <div className="flex items-center gap-2 p-3 bg-cyan-900/30 border border-cyan-700 rounded-lg">
              <span className="text-sm text-slate-400">{t('builds.className')}:</span>
              <span className="text-cyan-400 font-medium">{previewClassName}</span>
              <a
                href={getAshesCodexUrl(formPrimary)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
              >
                <ExternalLink className="w-4 h-4" />
                AshesCodex
              </a>
            </div>
          )}

          {/* Build Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('builds.buildName')}</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t('builds.buildNamePlaceholder')}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Purpose/Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('builds.purpose')}</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={t('builds.purposePlaceholder')}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={!formPrimary || !formName.trim() || isSubmitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? t('common.saving') : t('common.create')}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('builds.searchBuilds')}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={archetypeFilter}
          onChange={(e) => setArchetypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">{t('builds.filterByClass')}</option>
          {archetypesConfig.list.map((arch) => (
            <option key={arch.id} value={arch.id}>{arch.name}</option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">{t('builds.filterByRole')}</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Build Grid */}
      {filteredBuilds.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <Hammer className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {t('builds.noBuilds')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('builds.noBuildsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBuilds.map((build) => {
            const className = getDisplayClassName(build.primary_archetype, build.secondary_archetype);
            const primaryArchetype = getArchetypeById(build.primary_archetype);
            
            return (
              <div
                key={build.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{build.name}</h3>
                    <div className="text-sm text-cyan-400 font-medium">
                      {primaryArchetype?.icon} {className}
                    </div>
                  </div>
                  {build.role && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      build.role === 'tank' ? 'bg-blue-500/20 text-blue-400' :
                      build.role === 'cleric' ? 'bg-green-500/20 text-green-400' :
                      build.role === 'bard' ? 'bg-purple-500/20 text-purple-400' :
                      build.role === 'ranged_dps' ? 'bg-red-500/20 text-red-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {build.role}
                    </span>
                  )}
                </div>

                {/* Description */}
                {build.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {build.description}
                  </p>
                )}

                {/* AshesCodex Link */}
                <a
                  href={getAshesCodexUrl(build.primary_archetype)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mb-3"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('builds.viewOnAshesCodex')}
                </a>

                {/* Tags */}
                {build.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {build.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {build.views_count}
                    </span>
                    <button
                      onClick={(e) => handleLike(build.id, e)}
                      className={`flex items-center gap-1 transition-colors ${
                        build.is_liked ? 'text-red-400' : 'hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${build.is_liked ? 'fill-current' : ''}`} />
                      {build.likes_count}
                    </button>
                  </div>
                  <button
                    onClick={(e) => handleCopy(build.id, e)}
                    className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {t('builds.copyBuild')}
                  </button>
                </div>

                {/* Creator */}
                <div className="text-xs text-slate-500 mt-2">
                  by {build.creator?.display_name || 'Unknown'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
