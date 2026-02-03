'use client';

import { useState, useEffect } from 'react';
import { 
  Ship, Loader2, AlertCircle, Trash2,
  Sword, Shield, Package, Wrench, Search, Rocket, Heart,
  Zap, Users, Plane, Target, Radio, Pickaxe, Boxes, Truck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CharacterWithProfessions } from '@/lib/types';
import shipsData from '@/config/games/star-citizen-ships.json';
import { getManufacturerLogo } from '@/config/games/star-citizen-utils';

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
  productionStatus: string;
  image?: string;
}

interface CharacterShip {
  id: string;
  character_id: string;
  ship_id: string;
  ownership_type: 'pledged' | 'in-game' | 'loaner';
  created_at: string;
}

interface ShipsViewProps {
  characters: CharacterWithProfessions[];
  userId: string;
  canManage: boolean;
  groupId: string;
}

// Normalize and group ship roles into logical categories
function normalizeRole(role: string): string {
  const roleLower = role.toLowerCase();
  
  // Combat roles
  if (roleLower.includes('fighter')) return 'Fighter';
  if (roleLower.includes('bomber')) return 'Bomber';
  if (roleLower.includes('gunship') || roleLower.includes('gun ship')) return 'Gunship';
  if (roleLower.includes('interdiction') || roleLower.includes('interdictor')) return 'Interdiction';
  if (roleLower.includes('stealth')) return 'Stealth';
  if (roleLower.includes('assault') || roleLower.includes('boarding')) return 'Assault';
  if (roleLower.includes('patrol')) return 'Patrol';
  if (roleLower.includes('anti-air') || roleLower.includes('minelayer')) return 'Anti-Aircraft';
  
  // Capital ships
  if (roleLower.includes('carrier')) return 'Carrier';
  if (roleLower.includes('frigate')) return 'Frigate';
  if (roleLower.includes('destroyer')) return 'Destroyer';
  if (roleLower.includes('corvette')) return 'Corvette';
  
  // Industrial roles
  if (roleLower.includes('freight') || roleLower.includes('cargo')) return 'Cargo';
  if (roleLower.includes('mining') || roleLower.includes('prospecting')) return 'Mining';
  if (roleLower.includes('salvage')) return 'Salvage';
  if (roleLower.includes('refinery') || roleLower.includes('refining')) return 'Refinery';
  if (roleLower.includes('construction')) return 'Construction';
  
  // Support roles
  if (roleLower.includes('medical') || roleLower.includes('ambulance')) return 'Medical';
  if (roleLower.includes('repair')) return 'Repair';
  if (roleLower.includes('refuel')) return 'Refueling';
  if (roleLower.includes('recovery')) return 'Recovery';
  
  // Exploration & Science
  if (roleLower.includes('exploration') || roleLower.includes('pathfinder') || roleLower.includes('expedition')) return 'Exploration';
  if (roleLower.includes('recon') || roleLower.includes('reconnaissance')) return 'Reconnaissance';
  if (roleLower.includes('science')) return 'Science';
  if (roleLower.includes('data') || roleLower.includes('reporting')) return 'Data';
  
  // Civilian roles
  if (roleLower.includes('transport') || roleLower.includes('passenger') || roleLower.includes('dropship')) return 'Transport';
  if (roleLower.includes('touring') || roleLower.includes('luxury')) return 'Luxury';
  if (roleLower.includes('racing')) return 'Racing';
  if (roleLower.includes('starter') || roleLower.includes('generalist')) return 'Starter';
  
  // Vehicles
  if (roleLower.includes('military') && roleLower.includes('vehicle')) return 'Military Vehicle';
  if (roleLower.includes('combat') && roleLower.includes('vehicle')) return 'Combat Vehicle';
  if (roleLower.includes('vehicle')) return 'Ground Vehicle';
  
  // Multi-role or unclassified
  if (roleLower.includes('multi') || roleLower.includes('modular')) return 'Multi-Role';
  if (roleLower.includes('combat')) return 'Combat';
  
  // Return original if no match (with title casing)
  return role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Get icon component for ship role
function getRoleIcon(role: string) {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('fighter') || roleLower.includes('combat') || roleLower.includes('gun')) return Sword;
  if (roleLower.includes('bomber') || roleLower.includes('assault')) return Rocket;
  if (roleLower.includes('freight') || roleLower.includes('cargo')) return Package;
  if (roleLower.includes('mining') || roleLower.includes('prospecting')) return Pickaxe;
  if (roleLower.includes('medical') || roleLower.includes('ambulance')) return Heart;
  if (roleLower.includes('repair') || roleLower.includes('construction')) return Wrench;
  if (roleLower.includes('salvage') || roleLower.includes('recovery')) return Boxes;
  if (roleLower.includes('exploration') || roleLower.includes('pathfinder') || roleLower.includes('recon')) return Search;
  if (roleLower.includes('transport') || roleLower.includes('passenger') || roleLower.includes('dropship')) return Users;
  if (roleLower.includes('refuel') || roleLower.includes('refining')) return Zap;
  if (roleLower.includes('stealth') || roleLower.includes('interdiction')) return Target;
  if (roleLower.includes('racing')) return Plane;
  if (roleLower.includes('data') || roleLower.includes('reporting')) return Radio;
  if (roleLower.includes('capital') || roleLower.includes('carrier') || roleLower.includes('frigate') || roleLower.includes('destroyer') || roleLower.includes('corvette')) return Shield;
  if (roleLower.includes('starter') || roleLower.includes('generalist')) return Ship;
  if (roleLower.includes('military') || roleLower.includes('vehicle')) return Truck;
  return Ship;
}

// Get color scheme for ship role
function getRoleColor(role: string) {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('fighter') || roleLower.includes('combat') || roleLower.includes('gun')) return 'text-red-400 bg-red-500/10';
  if (roleLower.includes('bomber') || roleLower.includes('assault')) return 'text-orange-400 bg-orange-500/10';
  if (roleLower.includes('freight') || roleLower.includes('cargo')) return 'text-yellow-400 bg-yellow-500/10';
  if (roleLower.includes('mining') || roleLower.includes('prospecting')) return 'text-amber-400 bg-amber-500/10';
  if (roleLower.includes('medical') || roleLower.includes('ambulance')) return 'text-pink-400 bg-pink-500/10';
  if (roleLower.includes('repair') || roleLower.includes('construction')) return 'text-blue-400 bg-blue-500/10';
  if (roleLower.includes('salvage') || roleLower.includes('recovery')) return 'text-slate-400 bg-slate-500/10';
  if (roleLower.includes('exploration') || roleLower.includes('pathfinder') || roleLower.includes('recon')) return 'text-teal-400 bg-teal-500/10';
  if (roleLower.includes('transport') || roleLower.includes('passenger') || roleLower.includes('dropship')) return 'text-indigo-400 bg-indigo-500/10';
  if (roleLower.includes('refuel') || roleLower.includes('refining')) return 'text-violet-400 bg-violet-500/10';
  if (roleLower.includes('stealth') || roleLower.includes('interdiction')) return 'text-purple-400 bg-purple-500/10';
  if (roleLower.includes('racing')) return 'text-fuchsia-400 bg-fuchsia-500/10';
  if (roleLower.includes('data') || roleLower.includes('reporting')) return 'text-sky-400 bg-sky-500/10';
  if (roleLower.includes('capital') || roleLower.includes('carrier') || roleLower.includes('frigate') || roleLower.includes('destroyer') || roleLower.includes('corvette')) return 'text-emerald-400 bg-emerald-500/10';
  if (roleLower.includes('starter') || roleLower.includes('generalist')) return 'text-cyan-400 bg-cyan-500/10';
  if (roleLower.includes('military') || roleLower.includes('vehicle')) return 'text-lime-400 bg-lime-500/10';
  return 'text-slate-400 bg-slate-500/10';
}

export function ShipsView({ characters, userId, canManage, groupId }: ShipsViewProps) {
  const [characterShips, setCharacterShips] = useState<Record<string, CharacterShip[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load character ships
  useEffect(() => {
    console.log('ShipsView - characters:', characters, 'groupId:', groupId);
    loadCharacterShips();
  }, [groupId, characters]);

  const loadCharacterShips = async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize empty ships for all characters
      const shipsByCharacter: Record<string, CharacterShip[]> = {};
      characters.forEach(char => {
        shipsByCharacter[char.id] = [];
      });

      console.log('Loading ships for character IDs:', characters.map(c => c.id));

      // Only query if we have characters
      if (characters.length > 0) {
        const { data, error: fetchError } = await supabase
          .from('character_ships')
          .select('*')
          .in('character_id', characters.map(c => c.id));

        console.log('Character ships query result:', { data, fetchError });

        if (fetchError) {
          console.error('Error loading ships:', fetchError);
          throw fetchError;
        }

        // Populate ships data
        if (data) {
          console.log('Found ships:', data);
          data.forEach(ship => {
            if (shipsByCharacter[ship.character_id]) {
              shipsByCharacter[ship.character_id].push(ship);
            }
          });
        }
      }

      console.log('Final characterShips state:', shipsByCharacter);
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
            <h2 className="text-2xl font-bold text-white">Ships Overview</h2>
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

  // ShipsView shows all guild characters and their ships (guild-wide overview by character)
  // Group all ships by character for character-based overview
  const charactersByOwner = characters.reduce((acc, char) => {
    const ownerUserId = char.user_id || 'unassigned';
    if (!acc[ownerUserId]) {
      acc[ownerUserId] = [];
    }
    acc[ownerUserId].push(char);
    return acc;
  }, {} as Record<string, CharacterWithProfessions[]>);

  const allShips = Object.values(characterShips).flat();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ship className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Ships Overview</h2>
            <p className="text-sm text-slate-400">Guild ships by character</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">{allShips.length}</div>
          <div className="text-xs text-slate-400">Total Ships</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Ships by Character */}
      {allShips.length === 0 ? (
        <div className="text-center py-12">
          <Ship className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No ships in the fleet yet</p>
          <p className="text-sm text-slate-500 mt-2">Ships will appear here once members add them to their characters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(charactersByOwner).map(([ownerUserId, chars]) => {
            const totalShips = chars.reduce((sum, char) => sum + (characterShips[char.id]?.length || 0), 0);
            if (totalShips === 0) return null;
            
            return (
              <div key={ownerUserId} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-300">
                  {chars[0]?.user_id || 'Member'}'s Characters
                  <span className="ml-2 text-sm text-slate-500">({totalShips} ship{totalShips !== 1 ? 's' : ''})</span>
                </h3>
                
                {chars.map(char => {
                  const ships = characterShips[char.id] || [];
                  if (ships.length === 0) return null;
                  
                  return (
                    <div key={char.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-4">{char.name}</h4>
                      
                      <div className="space-y-6">
                        {/* Ships Section */}
                        {ships.filter(s => {
                          const shipData = getShipData(s.ship_id);
                          return shipData && shipData.size !== 'vehicle';
                        }).length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ships</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {ships.filter(s => {
                                const shipData = getShipData(s.ship_id);
                                return shipData && shipData.size !== 'vehicle';
                              }).map(ship => {
                                const shipData = getShipData(ship.ship_id);
                                if (!shipData) return null;

                                const ownershipColor = {
                                  'pledged': 'border-green-500/30',
                                  'in-game': 'border-cyan-500/30',
                                  'loaner': 'border-blue-500/30',
                                }[ship.ownership_type];

                                const isConcept = shipData.productionStatus !== 'flight-ready';
                                const RoleIcon = getRoleIcon(shipData.role);
                                const roleColor = getRoleColor(shipData.role);
                                const manufacturerLogo = getManufacturerLogo(shipData.manufacturer);

                                return (
                                  <div
                                    key={ship.id}
                                    className={`p-3 bg-slate-800 border ${ownershipColor} rounded-lg`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-semibold text-white truncate">{shipData.name}</h5>
                                          {isConcept && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded">
                                              Concept
                                            </span>
                                          )}
                                        </div>
                                        <div className="mt-2 grid grid-cols-[48px,1fr] items-center gap-3">
                                          {manufacturerLogo && (
                                            <div className="flex h-12 w-12 items-center justify-center">
                                              <img src={manufacturerLogo} alt={shipData.manufacturer} className="h-12 w-12 object-contain brightness-0 invert opacity-100" title={shipData.manufacturer} />
                                            </div>
                                          )}
                                          <div className="min-w-0 leading-tight">
                                            <p className="text-sm text-slate-300">{shipData.manufacturer}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className={`p-1.5 rounded ${roleColor}`}>
                                            <RoleIcon className="w-3 h-3" />
                                          </div>
                                          <span className="text-xs text-slate-400">{shipData.role}</span>
                                        </div>
                                      </div>
                                      {canManage && (
                                        <button
                                          onClick={() => handleDeleteShip(ship.id)}
                                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                          title="Remove ship"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Ground Vehicles Section */}
                        {ships.filter(s => {
                          const shipData = getShipData(s.ship_id);
                          return shipData && shipData.size === 'vehicle';
                        }).length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Vehicles</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {ships.filter(s => {
                                const shipData = getShipData(s.ship_id);
                                return shipData && shipData.size === 'vehicle';
                              }).map(ship => {
                                const shipData = getShipData(ship.ship_id);
                                if (!shipData) return null;

                                const ownershipColor = {
                                  'pledged': 'border-green-500/30',
                                  'in-game': 'border-cyan-500/30',
                                  'loaner': 'border-blue-500/30',
                                }[ship.ownership_type];

                                const isConcept = shipData.productionStatus !== 'flight-ready';
                                const RoleIcon = getRoleIcon(shipData.role);
                                const roleColor = getRoleColor(shipData.role);
                                const manufacturerLogo = getManufacturerLogo(shipData.manufacturer);

                                return (
                                  <div
                                    key={ship.id}
                                    className={`p-3 bg-slate-800 border ${ownershipColor} rounded-lg`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-semibold text-white truncate">{shipData.name}</h5>
                                          {isConcept && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded">
                                              Concept
                                            </span>
                                          )}
                                        </div>
                                        <div className="mt-2 grid grid-cols-[48px,1fr] items-center gap-3">
                                          {manufacturerLogo && (
                                            <div className="flex h-12 w-12 items-center justify-center">
                                              <img src={manufacturerLogo} alt={shipData.manufacturer} className="h-12 w-12 object-contain brightness-0 invert opacity-100" title={shipData.manufacturer} />
                                            </div>
                                          )}
                                          <div className="min-w-0 leading-tight">
                                            <p className="text-sm text-slate-300">{shipData.manufacturer}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className={`p-1.5 rounded ${roleColor}`}>
                                            <RoleIcon className="w-3 h-3" />
                                          </div>
                                          <span className="text-xs text-slate-400">{shipData.role}</span>
                                        </div>
                                      </div>
                                      {canManage && (
                                        <button
                                          onClick={() => handleDeleteShip(ship.id)}
                                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                          title="Remove vehicle"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


