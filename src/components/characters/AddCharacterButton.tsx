'use client';

import { useState } from 'react';
import { Plus, Sword } from 'lucide-react';
import { CharacterForm } from '@/components/characters/CharacterForm';
import { CharacterData } from '@/hooks/useGroupData';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddCharacterButtonProps {
  onAdd: (data: CharacterData) => Promise<void>;
  gameSlug?: string;
}

export function AddCharacterButton({ onAdd, gameSlug = 'aoc' }: AddCharacterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (data: CharacterData) => {
    await onAdd(data);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-dashed border-slate-600 hover:border-orange-500/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer group"
      >
        <div className="p-1.5 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
          <Plus size={18} className="text-orange-400" />
        </div>
        <span className="font-medium">{t('character.addCharacter')}</span>
        <Sword size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
      </button>

      {isModalOpen && (
        <CharacterForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          gameSlug={gameSlug}
        />
      )}
    </>
  );
}

// Legacy export for backward compatibility
export { AddCharacterButton as AddMemberButton };

