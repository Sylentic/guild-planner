// Character editing permission logic
// Determines which users can edit/delete which characters based on role hierarchy

import { ClanRole, getRoleHierarchy } from './permissions';

/**
 * Determines if a user can edit a specific character
 * @param userRole - The user's role in the group
 * @param characterOwnerId - The ID of the character's owner (user_id)
 * @param currentUserId - The current user's ID
 * @returns true if the user can edit the character
 */
export function canEditCharacter(
  userRole: ClanRole,
  characterOwnerId: string | null,
  currentUserId: string
): boolean {
  // Admin can edit any character
  if (userRole === 'admin') {
    return true;
  }

  // Officer can edit characters they own or members' characters
  if (userRole === 'officer') {
    // Can edit their own characters
    if (characterOwnerId === currentUserId) {
      return true;
    }
    // Can edit members' characters (not other officers' or admins')
    return true; // We'll verify the target user's role at the API level
  }

  // Member can only edit their own characters
  if (userRole === 'member') {
    return characterOwnerId === currentUserId;
  }

  // Trial and pending can't edit any characters
  return false;
}

/**
 * Determines if a user can delete a specific character
 * Same rules as editing for now, but can be customized
 */
export function canDeleteCharacter(
  userRole: ClanRole,
  characterOwnerId: string | null,
  currentUserId: string
): boolean {
  return canEditCharacter(userRole, characterOwnerId, currentUserId);
}

/**
 * Determines if an officer can edit another user's character
 * Officers can only manage members' characters, not other officers/admins
 * @param userRole - The user's role (should be officer)
 * @param targetUserRole - The role of the character owner
 * @returns true if officer can edit target user's characters
 */
export function canOfficerManageUser(
  userRole: ClanRole,
  targetUserRole: ClanRole
): boolean {
  if (userRole !== 'officer') {
    return false;
  }

  const hierarchy = getRoleHierarchy();
  // Officer can manage users with lower hierarchy
  return hierarchy['officer'] > hierarchy[targetUserRole];
}

/**
 * Gets a human-readable error message for why a user can't edit a character
 */
export function getEditPermissionErrorMessage(
  userRole: ClanRole,
  characterOwnerId: string | null,
  currentUserId: string
): string {
  if (userRole === 'admin') {
    return 'Admins can edit any character';
  }

  if (userRole === 'officer') {
    if (characterOwnerId === currentUserId) {
      return 'You can edit your own characters';
    }
    return 'Officers can edit member characters';
  }

  if (userRole === 'member') {
    if (characterOwnerId === currentUserId) {
      return 'You can only edit your own characters';
    }
    return 'Members can only edit their own characters';
  }

  return 'You do not have permission to edit this character';
}
