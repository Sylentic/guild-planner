'use client';

import { useState, useEffect } from 'react';
import { Ship, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CharacterWithProfessions } from '@/lib/types';
import shipsData from '@/config/games/star-citizen-ships.json';

interface ShipData {
  id: string;
  name: string;
  manufacturer: string;
  role: string;
  size: string;
  cargo: number;
  crew: {
    min: number;
    max: number;
  };
  image?: string;
}

interface CharacterShip {
  id: string;
  character_id: string;
  ship_id: string;
  ownership_type: 'owned' | 'loaned' | 'pledged';
  created_at: string;
}

interface ShipsViewProps {
  characters: CharacterWithProfessions[];
  userId: string;
  canManage: boolean;
  groupId: string;
}

export function ShipsView({ characters, userId, canManage, groupId }: ShipsViewProps) {
  const [characterShips, setCharacterShips] = useState<Record<string, CharacterShip[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [ownershipType, setOwnershipType] = useState<'owned' | 'loaned' | 'pledged'>('owned');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load character ships
  useEffect(() => {
    loadCharacterShips();
  }, [groupId]);

  const loadCharacterShips = async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize empty ships for all characters
      const shipsByCharacter: Record<string, CharacterShip[]> = {};
      characters.forEach(char => {
        shipsByCharacter[char.id] = [];
      });

      // Only query if we have characters
      if (characters.length > 0) {
        const { data, error: fetchError } = await supabase
          .from('character_ships')
          .select('*')
          .in('character_id', characters.map(c => c.id));

        if (fetchError) {
          console.error('Error loading ships:', fetchError);
          throw fetchError;
        }

        // Populate ships data
        if (data) {
          data.forEach(ship => {
            if (shipsByCharacter[ship.character_id]) {
              shipsByCharacter[ship.character_id].push(ship);
            }
          });
        }
      }

      setCharacterShips(shipsByCharacter);
    } catch (err) {
      console.error('Failed to load ships:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ships');
    } finally {
      setLoading(false);
    }
  };

  const getShipData = (shipId: string): ShipData | undefined => {
    return shipsData.ships.find(s => s.id === shipId);
  };

  const handleAddShip = async () => {
    if (!selectedCharacter || !selectedShip) {
      setError('Please select a character and ship');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('character_ships')
        .insert({
          character_id: selectedCharacter,
          ship_id: selectedShip,
          ownership_type: ownershipType,
        });

      if (insertError) throw insertError;

      // Reload ships
      await loadCharacterShips();
      setShowAddForm(false);
      setSelectedCharacter(null);
      setSelectedShip(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ship');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShip = async (shipId: string) => {
    if (!confirm('Remove this ship?')) return;

    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('character_ships')
        .delete()
        .eq('id', shipId);

      if (deleteError) {
        console.error('Error deleting ship:', deleteError);
        throw deleteError;
      }

      await loadCharacterShips();
    } catch (err) {
      console.error('Failed to delete ship:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete ship');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Show helpful message if there's an error (like table not existing yet)
  if (error && error.includes('relation') && error.includes('does not exist')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Fleet</h2>
          </div>
        </div>
        <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Database Migration Required</p>
            <p className="text-sm text-amber-300">
              The ship tracking feature requires a database migration. Please run the latest migrations to enable this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const playerCharacters = characters.filter(c => c.user_id === userId);
  const allCharactersByOwner = characters.reduce((acc, char) => {
    if (!acc[char.user_id || 'unknown']) {
      acc[char.user_id || 'unknown'] = [];
    }
    acc[char.user_id || 'unknown'].push(char);
    return acc;
  }, {} as Record<string, CharacterWithProfessions[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ship className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Fleet</h2>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Ship
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Add Ship Form */}
      {showAddForm && canManage && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Add Ship</h3>

          {/* Character Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Character
            </label>
            <select
              value={selectedCharacter || ''}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a character...</option>
              {playerCharacters.map(char => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ship Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ship
            </label>
            <select
              value={selectedShip || ''}
              onChange={(e) => setSelectedShip(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a ship...</option>
              {shipsData.ships.map(ship => (
                <option key={ship.id} value={ship.id}>
                  {ship.name} ({ship.manufacturer}) - {ship.role}
                </option>
              ))}
            </select>
          </div>

          {/* Ownership Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ownership Type
            </label>
            <select
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value as 'owned' | 'loaned' | 'pledged')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="owned">Owned</option>
              <option value="loaned">Loaned</option>
              <option value="pledged">Pledged</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddShip}
              disabled={saving || !selectedCharacter || !selectedShip}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Add Ship'
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedCharacter(null);
                setSelectedShip(null);
              }}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ships by Character Owner */}
      <div className="space-y-6">
        {Object.entries(allCharactersByOwner).map(([ownerUserId, chars]) => {
          const ownerName = ownerUserId === userId ? 'Your Characters' : chars[0]?.user_id ? `${chars[0].user_id}'s Characters` : 'Unassigned Characters';
          
          return (
            <div key={ownerUserId} className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300">{ownerName}</h3>
              
              {chars.map(char => {
                const ships = characterShips[char.id] || [];
                return (
                  <div key={char.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-4">{char.name}</h4>
                    
                    {ships.length === 0 ? (
                      <p className="text-slate-400 text-sm">No ships added yet</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {ships.map(ship => {
                          const shipData = getShipData(ship.ship_id);
                          if (!shipData) return null;

                          const ownershipColor = {
                            owned: 'bg-green-500/10 border-green-500/30 text-green-400',
                            loaned: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                            pledged: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                          }[ship.ownership_type];

                          return (
                            <div key={ship.id} className={`border rounded-lg p-3 ${ownershipColor}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-white">{shipData.name}</h5>
                                  <p className="text-xs text-slate-400">{shipData.manufacturer}</p>
                                </div>
                                {canManage && ownerUserId === userId && (
                                  <button
                                    onClick={() => handleDeleteShip(ship.id)}
                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Role:</span>
                                  <span>{shipData.role}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Size:</span>
                                  <span>{shipData.size}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Crew:</span>
                                  <span>{shipData.crew.min}-{shipData.crew.max}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Cargo:</span>
                                  <span>{shipData.cargo} SCU</span>
                                </div>
                                <div className="pt-2 border-t border-current/20">
                                  <span className="capitalize text-xs font-medium">{ship.ownership_type}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.values(characterShips).every(ships => ships.length === 0) && !showAddForm && (
        <div className="text-center py-12">
          <Ship className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No ships in the fleet yet</p>
          {canManage && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              Add the first ship
            </button>
          )}
        </div>
      )}
    </div>
  );
}
