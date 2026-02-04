
"use client";
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from './ui/Skeleton';

import { useState } from 'react';
import { PartyWithRoster, CharacterWithProfessions, PartyRole, Party } from '@/lib/types';
import { PartyCard } from './PartyCard';
import { PartyForm } from './PartyForm';
import { Plus, Users } from 'lucide-react';

interface PartiesListProps {
  parties: PartyWithRoster[];
  characters: CharacterWithProfessions[];
  groupId: string;
  userId: string;
  canManage: boolean;
  onCreateParty: (party: Omit<Party, 'id' | 'created_at' | 'updated_at'>) => Promise<Party | null>;
  onUpdateParty: (id: string, updates: Partial<Party>) => Promise<void>;
  onDeleteParty: (id: string) => Promise<void>;
  onAssignCharacter: (partyId: string, characterId: string, role: PartyRole) => Promise<void>;
  onRemoveFromRoster: (partyId: string, characterId: string) => Promise<void>;
  onToggleConfirmed: (partyId: string, characterId: string, confirmed: boolean) => Promise<void>;
}

export function PartiesList({
  parties,
  characters,
  groupId,
  userId,
  canManage,
  onCreateParty,
  onUpdateParty,
  onDeleteParty,
  onAssignCharacter,
  onRemoveFromRoster,
  onToggleConfirmed,
}: PartiesListProps) {

  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<PartyWithRoster | null>(null);
  const { loading, isLeadership, isAdmin } = usePermissions(groupId);

  const handleCreate = async (data: Omit<Party, 'id' | 'created_at' | 'updated_at'>) => {
    await onCreateParty(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: Omit<Party, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingParty) return;
    await onUpdateParty(editingParty.id, data);
    setEditingParty(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users size={20} className="text-orange-400" />
          Party Builder
        </h2>
        {canManage && (
          loading ? (
            <Skeleton className="h-10 w-32" />
          ) : (isLeadership() || isAdmin()) ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New Party
            </button>
          ) : null
        )}
      </div>

      {/* Parties list */}
      {parties.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/80 rounded-lg border border-slate-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-500 opacity-50" />
          <p className="text-slate-400">No parties yet.</p>
          {canManage && (
            <p className="text-sm text-slate-500 mt-1">
              Create a party to organize your raid groups!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {parties.map(party => (
            <PartyCard
              key={party.id}
              party={party}
              characters={characters}
              canManage={canManage}
              onAssign={(charId, role) => onAssignCharacter(party.id, charId, role)}
              onRemove={(charId) => onRemoveFromRoster(party.id, charId)}
              onToggleConfirmed={(charId, confirmed) => onToggleConfirmed(party.id, charId, confirmed)}
              onDelete={() => onDeleteParty(party.id)}
              onEdit={() => setEditingParty(party)}
            />
          ))}
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <PartyForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          groupId={groupId}
          userId={userId}
        />
      )}

      {/* Edit form modal */}
      {editingParty && (
        <PartyForm
          initialData={editingParty}
          onSubmit={handleUpdate}
          onCancel={() => setEditingParty(null)}
          groupId={groupId}
          userId={userId}
        />
      )}
    </div>
  );
}

