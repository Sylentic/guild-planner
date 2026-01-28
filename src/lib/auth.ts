// Update the guild icon URL for a clan
export async function updateClanIconUrl(clanId: string, url: string) {
  const { error } = await supabase
    .from('clans')
    .update({ guild_icon_url: url })
    .eq('id', clanId);
  if (error) throw error;
}
import { supabase } from './supabase';
import { getURL } from './url';

export type UserRole = 'admin' | 'officer' | 'member' | 'pending' | null;

export interface UserProfile {
  id: string;
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  display_name: string | null;
  timezone: string;
}

export interface ClanMembership {
  clan_id: string;
  role: UserRole;
  is_creator: boolean;
  approved_at: string | null;
}

/**
 * Sign in with Discord OAuth
 */
export async function signInWithDiscord(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: redirectTo || `${getURL()}auth/callback`,
      scopes: 'identify',
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Get current user profile from users table
 * Auto-creates profile if it doesn't exist (for users created before trigger was set up)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // First try to get existing profile
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  
  if (data) return data;
  
  // Profile doesn't exist - create it from auth.users data
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser || authUser.id !== userId) {
    return null; // Can't create profile without auth data
  }
  
  const metadata = authUser.user_metadata || {};
  const newProfile = {
    id: userId,
    discord_id: metadata.provider_id || null,
    discord_username: metadata.full_name || metadata.name || null,
    discord_avatar: metadata.avatar_url || null,
    display_name: metadata.full_name || metadata.name || 'User',
    timezone: 'UTC',
  };
  
  const { data: created, error: createError } = await supabase
    .from('users')
    .insert(newProfile)
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating user profile:', createError);
    return null;
  }
  
  return created;
}

/**
 * Update user's display name
 */
export async function updateDisplayName(userId: string, displayName: string) {
  const { error } = await supabase
    .from('users')
    .update({ display_name: displayName })
    .eq('id', userId)
    .select();
  
  if (error) throw error;
}

/**
 * Get user's membership in a specific clan
 */
export async function getClanMembership(clanId: string, userId: string): Promise<ClanMembership | null> {
  const { data, error } = await supabase
    .from('clan_members')
    .select('clan_id, role, is_creator, approved_at')
    .eq('clan_id', clanId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  
  return data;
}

/**
 * Apply to join a clan (creates pending membership)
 */
export async function applyToClan(clanId: string, userId: string) {
  const { error } = await supabase
    .from('clan_members')
    .insert({
      clan_id: clanId,
      user_id: userId,
      role: 'pending',
    })
    .select();
  
  if (error) throw error;
}

/**
 * Accept a pending member (Admin/Officer only)
 */
export async function acceptMember(membershipId: string, approvedBy: string) {
  const { error } = await supabase
    .from('clan_members')
    .update({
      role: 'member',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    })
    .eq('id', membershipId)
    .select();
  
  if (error) throw error;
}

/**
 * Reject/remove a member (Admin only for non-pending)
 */
export async function removeMember(membershipId: string) {
  const { error } = await supabase
    .from('clan_members')
    .delete()
    .eq('id', membershipId)
    .select();
  
  if (error) throw error;
}

/**
 * Update member's role (Admin only)
 */
export async function updateMemberRole(membershipId: string, newRole: 'admin' | 'officer' | 'member') {
  const { error } = await supabase
    .from('clan_members')
    .update({ role: newRole })
    .eq('id', membershipId)
    .select();
  
  if (error) throw error;
}

/**
 * Create a new clan (user becomes admin/creator)
 */
export async function createClan(slug: string, name: string, userId: string) {
  // Create clan
  const { data: clan, error: clanError } = await supabase
    .from('clans')
    .insert({ slug, name, created_by: userId })
    .select()
    .single();
  
  if (clanError) throw clanError;
  
  // Add creator as admin
  const { error: memberError } = await supabase
    .from('clan_members')
    .insert({
      clan_id: clan.id,
      user_id: userId,
      role: 'admin',
      is_creator: true,
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .select();
  
  if (memberError) throw memberError;
  
  return clan;
}

/**
 * Check if a clan exists by slug
 */
export async function getClanBySlug(slug: string) {
  const { data, error } = await supabase
    .from('clans')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  
  return data;
}

/**
 * Get all clans a user belongs to (approved members only)
 */
export async function getUserClans(userId: string): Promise<Array<{
  id: string;
  slug: string;
  name: string;
  role: string;
  isCreator: boolean;
}>> {
  const { data, error } = await supabase
    .from('clan_members')
    .select(`
      role,
      is_creator,
      clans(id, slug, name)
    `)
    .eq('user_id', userId)
    .neq('role', 'pending');
  
  if (error) throw error;
  
  // Transform to flat clan list with role info
  return (data || [])
    .filter(m => m.clans !== null)
    .map(m => {
      // Supabase returns single object for one-to-many join
      const clanData = m.clans as unknown as { id: string; slug: string; name: string } | null;
      if (!clanData) return null;
      return {
        id: clanData.id,
        slug: clanData.slug,
        name: clanData.name,
        role: m.role as string,
        isCreator: m.is_creator as boolean,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
}

