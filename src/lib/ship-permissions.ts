// Ship management permission logic
// Determines which users can manage ships based on role hierarchy

import { GroupRole, getRoleHierarchy } from './permissions';

/**
 * Determines if a user can manage (add/edit/delete) ships for a character
 * @param userRole - The user's role in the group
 * @param characterOwnerId - The ID of the character's owner (user_id)
 * @param currentUserId - The current user's ID
 * @param minRoleForGameShips - The minimum role required to manage ships for this game (from database)
 * @returns true if the user can manage ships for this character
 */
export function canManageShips(
  userRole: GroupRole,
  characterOwnerId: string | null,
  currentUserId: string,
  minRoleForGameShips: GroupRole = 'member'
): boolean {
  // Check if user's role meets minimum requirement for ship management
  const hierarchy = getRoleHierarchy();
  if (hierarchy[userRole] < hierarchy[minRoleForGameShips]) {
    return false; // User's role is too low for ship management
  }

  // Admin can manage any ship
  if (userRole === 'admin') {
    return true;
  }

  // Officer can manage ships for their own characters and members' characters
  if (userRole === 'officer') {
    if (characterOwnerId === currentUserId) {
      return true; // Can manage their own ships
    }
    // Can manage members' ships (not other officers' or admins')
    return true; // Verification of target user's role happens at API level
  }

  // Member can only manage their own ships
  if (userRole === 'member') {
    return characterOwnerId === currentUserId;
  }

  // Trial and pending can't manage ships
  return false;
}

/**
 * Determines if a user can delete a ship
 * Same rules as managing for now, but can be customised
 */
export function canDeleteShip(
  userRole: GroupRole,
  characterOwnerId: string | null,
  currentUserId: string,
  minRoleForGameShips: GroupRole = 'member'
): boolean {
  return canManageShips(userRole, characterOwnerId, currentUserId, minRoleForGameShips);
}

/**
 * Gets a human-readable error message for why a user can't manage ships
 */
export function getShipManagementErrorMessage(
  userRole: GroupRole,
  characterOwnerId: string | null,
  currentUserId: string,
  minRoleForGameShips: GroupRole = 'member'
): string {
  const hierarchy = getRoleHierarchy();
  
  if (hierarchy[userRole] < hierarchy[minRoleForGameShips]) {
    return `Only ${minRoleForGameShips}s and above can manage ships`;
  }

  if (userRole === 'admin') {
    return 'Admins can manage any ships';
  }

  if (userRole === 'officer') {
    if (characterOwnerId === currentUserId) {
      return 'You can manage your own ships';
    }
    return 'Officers can manage member ships';
  }

  if (userRole === 'member') {
    if (characterOwnerId === currentUserId) {
      return 'You can only manage your own ships';
    }
    return 'Members can only manage their own ships';
  }

  return 'You do not have permission to manage ships for this character';
}

