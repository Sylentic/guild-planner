import { Star, Sword, Shield, Truck, Wrench, Search, Zap, Users, Package, Hammer, Ship, Heart, Target, FlaskConical, Radio, Mountain, Timer, MapPin, Crown, BadgeHelp } from 'lucide-react';

export interface ShipRoleConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Star;
  category: 'combat' | 'transport' | 'industry' | 'exploration' | 'support' | 'racing' | 'ground' | 'other';
}

export const shipRoles: Record<string, ShipRoleConfig> = {
  // Combat Roles
  'light-fighter': {
    id: 'light-fighter',
    name: 'Light Fighter',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: Zap,
    category: 'combat'
  },
  'medium-fighter': {
    id: 'medium-fighter',
    name: 'Medium Fighter',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: Target,
    category: 'combat'
  },
  'heavy-fighter': {
    id: 'heavy-fighter',
    name: 'Heavy Fighter',
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30',
    icon: Sword,
    category: 'combat'
  },
  'stealth-fighter': {
    id: 'stealth-fighter',
    name: 'Stealth Fighter',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: Radio,
    category: 'combat'
  },
  'bomber': {
    id: 'bomber',
    name: 'Bomber',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: FlaskConical,
    category: 'combat'
  },
  'stealth-bomber': {
    id: 'stealth-bomber',
    name: 'Stealth Bomber',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/30',
    icon: FlaskConical,
    category: 'combat'
  },
  'gunship': {
    id: 'gunship',
    name: 'Gunship',
    color: 'text-red-700',
    bgColor: 'bg-red-700/10',
    borderColor: 'border-red-700/30',
    icon: Shield,
    category: 'combat'
  },
  'heavy-gun-ship': {
    id: 'heavy-gun-ship',
    name: 'Heavy Gun Ship',
    color: 'text-red-800',
    bgColor: 'bg-red-800/10',
    borderColor: 'border-red-800/30',
    icon: Shield,
    category: 'combat'
  },
  'modular-gunship': {
    id: 'modular-gunship',
    name: 'Modular Gunship',
    color: 'text-red-700',
    bgColor: 'bg-red-700/10',
    borderColor: 'border-red-700/30',
    icon: Shield,
    category: 'combat'
  },
  'interdiction': {
    id: 'interdiction',
    name: 'Interdiction',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Target,
    category: 'combat'
  },
  'frigate': {
    id: 'frigate',
    name: 'Frigate',
    color: 'text-red-900',
    bgColor: 'bg-red-900/10',
    borderColor: 'border-red-900/30',
    icon: Crown,
    category: 'combat'
  },
  'destroyer': {
    id: 'destroyer',
    name: 'Destroyer',
    color: 'text-red-950',
    bgColor: 'bg-red-950/10',
    borderColor: 'border-red-950/30',
    icon: Crown,
    category: 'combat'
  },
  'dropship': {
    id: 'dropship',
    name: 'Dropship',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: Users,
    category: 'combat'
  },
  'minelayer': {
    id: 'minelayer',
    name: 'Minelayer',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-600/10',
    borderColor: 'border-yellow-600/30',
    icon: Mountain,
    category: 'combat'
  },

  // Transport & Freight
  'light-freight': {
    id: 'light-freight',
    name: 'Light Freight',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Package,
    category: 'transport'
  },
  'medium-freight': {
    id: 'medium-freight',
    name: 'Medium Freight',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Package,
    category: 'transport'
  },
  'medium-freight-/-gun-ship': {
    id: 'medium-freight-/-gun-ship',
    name: 'Medium Freight / Gun Ship',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/30',
    icon: Package,
    category: 'transport'
  },
  'heavy-freight': {
    id: 'heavy-freight',
    name: 'Heavy Freight',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700/10',
    borderColor: 'border-blue-700/30',
    icon: Truck,
    category: 'transport'
  },

  // Industry & Utility
  'mining': {
    id: 'mining',
    name: 'Mining',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    borderColor: 'border-amber-600/30',
    icon: Mountain,
    category: 'industry'
  },
  'salvage': {
    id: 'salvage',
    name: 'Salvage',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    icon: Wrench,
    category: 'industry'
  },
  'heavy-salvage': {
    id: 'heavy-salvage',
    name: 'Heavy Salvage',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600/10',
    borderColor: 'border-teal-600/30',
    icon: Wrench,
    category: 'industry'
  },
  'refinery': {
    id: 'refinery',
    name: 'Refinery',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/30',
    icon: FlaskConical,
    category: 'industry'
  },
  'repair': {
    id: 'repair',
    name: 'Repair',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: Hammer,
    category: 'industry'
  },
  'medium-repair-/-medium-refuel': {
    id: 'medium-repair-/-medium-refuel',
    name: 'Medium Repair / Refuel',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/30',
    icon: Hammer,
    category: 'industry'
  },

  // Exploration
  'pathfinder': {
    id: 'pathfinder',
    name: 'Pathfinder',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: MapPin,
    category: 'exploration'
  },
  'starter-/-pathfinder': {
    id: 'starter-/-pathfinder',
    name: 'Starter / Pathfinder',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-300/10',
    borderColor: 'border-emerald-300/30',
    icon: Star,
    category: 'exploration'
  },
  'exploration': {
    id: 'exploration',
    name: 'Exploration',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    icon: Search,
    category: 'exploration'
  },
  'expedition': {
    id: 'expedition',
    name: 'Expedition',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: Search,
    category: 'exploration'
  },

  // Support
  'medical': {
    id: 'medical',
    name: 'Medical',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    borderColor: 'border-pink-400/30',
    icon: Heart,
    category: 'support'
  },
  'refueling': {
    id: 'refueling',
    name: 'Refueling',
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/30',
    icon: Package,
    category: 'support'
  },

  // Racing & Competition
  'racing': {
    id: 'racing',
    name: 'Racing',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    icon: Timer,
    category: 'racing'
  },
  'competition': {
    id: 'competition',
    name: 'Competition',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: Timer,
    category: 'racing'
  },

  // Luxury & Touring
  'luxury-touring': {
    id: 'luxury-touring',
    name: 'Luxury Touring',
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
    borderColor: 'border-violet-400/30',
    icon: Star,
    category: 'other'
  },
  'touring': {
    id: 'touring',
    name: 'Touring',
    color: 'text-violet-300',
    bgColor: 'bg-violet-300/10',
    borderColor: 'border-violet-300/30',
    icon: Ship,
    category: 'other'
  },

  // Ground Vehicles
  'military': {
    id: 'military',
    name: 'Military',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
    icon: Shield,
    category: 'ground'
  },
  'ground': {
    id: 'ground',
    name: 'Ground Vehicle',
    color: 'text-stone-400',
    bgColor: 'bg-stone-400/10',
    borderColor: 'border-stone-400/30',
    icon: Truck,
    category: 'ground'
  },

  // Multi-role / Other
  'multi': {
    id: 'multi',
    name: 'Multi-role',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    icon: Ship,
    category: 'other'
  },
  'snub-fighter': {
    id: 'snub-fighter',
    name: 'Snub Fighter',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    borderColor: 'border-indigo-400/30',
    icon: Zap,
    category: 'combat'
  }
};

// Helper function to get role config by role string
export function getShipRoleConfig(role: string): ShipRoleConfig {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '-');
  return shipRoles[normalizedRole] || {
    id: 'unknown',
    name: role,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    icon: BadgeHelp,
    category: 'other'
  };
}

// Ownership types configuration
export interface OwnershipTypeConfig {
  id: 'owned-pledge' | 'owned-auec' | 'concept-pledge' | 'loaner';
  name: string;
  description: string;
  color: string;
  bgColor: string;
  requiresFlightReady: boolean;
}

export const ownershipTypes: Record<string, OwnershipTypeConfig> = {
  'owned-pledge': {
    id: 'owned-pledge',
    name: 'Owned (Pledge)',
    description: 'Pledged with real money',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    requiresFlightReady: true
  },
  'owned-auec': {
    id: 'owned-auec',
    name: 'Owned (aUEC)',
    description: 'Purchased in-game',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    requiresFlightReady: true
  },
  'concept-pledge': {
    id: 'concept-pledge',
    name: 'Concept (Pledge)',
    description: 'Pledged but not flight-ready',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    requiresFlightReady: false
  },
  'loaner': {
    id: 'loaner',
    name: 'Loaner',
    description: 'Temporary loaner ship',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    requiresFlightReady: true
  }
};

// Production status configuration
export interface ProductionStatusConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

export const productionStatuses: Record<string, ProductionStatusConfig> = {
  'flight-ready': {
    id: 'flight-ready',
    name: 'Flight Ready',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  'in-concept': {
    id: 'in-concept',
    name: 'Concept',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  'in-production': {
    id: 'in-production',
    name: 'In Production',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  }
};

