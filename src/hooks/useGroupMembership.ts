'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole, applyToGroup, getGroupMembership } from '@/lib/auth';
import { ClanRole } from '@/lib/permissions';

interface ClanMember {
  id: string;
  user_id: string;
  role: UserRole;
  guild_rank: string | null;
  is_creator: boolean;
  applied_at: string;
  approved_at: string | null;
  user: {
    display_name: string | null;
    discord_username: string | null;
    discord_avatar: string | null;
  } | null;
}

interface UseClanMembershipReturn {
  membership: {
    role: UserRole;
    isCreator: boolean;
    isApproved: boolean;
  } | null;
  members: ClanMember[];
  pendingMembers: ClanMember[];
  loading: boolean;
  error: string | null;
  apply: () => Promise<void>;
  acceptMember: (membershipId: string) => Promise<void>;
  rejectMember: (membershipId: string) => Promise<void>;
  updateRole: (membershipId: string, role: ClanRole) => Promise<void>;
  updateRank: (membershipId: string, rank: string | null) => Promise<void>;
  removeMember: (membershipId: string) => Promise<void>;
  refresh: () => Promise<void>;
  // Permission helpers
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
  canManageRoles: boolean;
}

export function useGroupMembership(groupId: string | null, userId: string | null, gameSlug: string = 'aoc'): UseClanMembershipReturn {
  const [membership, setMembership] = useState<UseClanMembershipReturn['membership']>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset state when groupId or userId changes (prevent stale data on route transition)
  useEffect(() => {
    setMembership(null);
    setMembers([]);
    setPendingMembers([]);
    setLoading(true);
  }, [groupId, userId]);

  const fetchMembership = useCallback(async () => {
    console.log('[DEBUG] useGroupMembership: groupId', groupId, 'userId', userId);
    if (!groupId || !userId) {
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getGroupMembership(groupId, userId);
      console.log('[DEBUG] getGroupMembership returned:', data);
      if (data) {
        setMembership({
          role: data.role as UserRole,
          isCreator: data.is_creator,
          isApproved: data.role !== 'pending',
        });
      } else {
        setMembership(null);
      }
    } catch (err) {
      console.error('Error fetching membership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
    }
  }, [groupId, userId]);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          guild_rank,
          is_creator,
          applied_at,
          approved_at,
          users!clan_members_user_id_fkey(display_name, discord_username, discord_avatar)
        `)
        .eq('group_id', groupId)
        .order('role');

      if (fetchError) throw fetchError;

      // Transform data - Supabase returns users as array or object depending on relationship
      const transformed = (data || []).map(m => ({
        ...m,
        user: Array.isArray(m.users) ? m.users[0] || null : m.users,
      })) as ClanMember[];

      const approved = transformed.filter(m => m.role !== 'pending');
      const pending = transformed.filter(m => m.role === 'pending');

      setMembers(approved);
      setPendingMembers(pending);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }, [groupId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMembership(), fetchMembers()]);
    } catch (e) {
      console.error('Error refreshing clan membership:', e);
      setError(e instanceof Error ? e.message : 'Failed to refresh membership');
    } finally {
      setLoading(false);
    }
  }, [fetchMembership, fetchMembers]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const apply = async () => {
    if (!groupId || !userId) throw new Error('Not authenticated');
    await applyToGroup(groupId, userId);
    await refresh();
  };

  const getWelcomeEmbed = (discordUsername: string) => {
    if (gameSlug === 'star-citizen') {
      const checklist = [
        '✅ Register your main character in the planner',
        '✅ Set your preferred role (Pilot, Engineer, Medic, etc.)',
        '✅ Connect your org tags and callsign',
        '✅ Review flight safety protocols and guidelines',
        '✅ Introduce yourself and your experience in Discord',
      ];
      return {
        title: '🚀 Welcome to the Squadron!',
        description: `Welcome <@${discordUsername}>! We're thrilled to have you join our squadron. Here's how to get started:`,
        color: 0xff6600, // Star Citizen orange
        fields: [
          {
            name: 'Getting Started',
            value: checklist.join('\n'),
            inline: false,
          },
          {
            name: 'Need Help?',
            value: 'Ask in this channel or contact a squad lead for assistance.',
            inline: false,
          },
        ],
        footer: { text: 'Star Citizen Squadron Planner' },
        timestamp: new Date().toISOString(),
      };
    } else {
      // Ashes of Creation (default)
      const checklist = [
        '✅ Set your main character in the planner',
        '✅ Fill out your professions and skills',
        '✅ Join upcoming events and RSVP',
        '✅ Read the guild rules and code of conduct',
        '✅ Introduce yourself in Discord',
      ];
      return {
        title: '🎉 Welcome to the Guild!',
        description: `Welcome <@${discordUsername}>! We're excited to have you join us. Here's how to get started:`,
        color: 0x22c55e, // green
        fields: [
          {
            name: 'Onboarding Checklist',
            value: checklist.join('\n'),
            inline: false,
          },
          {
            name: 'Need Help?',
            value: 'Ask in this channel or contact an officer for assistance.',
            inline: false,
          },
        ],
        footer: { text: 'AoC Guild Profession Planner' },
        timestamp: new Date().toISOString(),
      };
    }
  };

  const acceptMember = async (membershipId: string) => {
    if (!userId) throw new Error('Not authenticated');

    // Get the member info (to get user_id and discord_username)

    const { data: memberData, error: memberFetchError } = await supabase
      .from('group_members')
      .select('user_id, group_id, users!clan_members_user_id_fkey(discord_username)')
      .eq('id', membershipId)
      .maybeSingle();
    if (memberFetchError || !memberData) throw memberFetchError || new Error('Member not found');

    type UserWithDiscord = { discord_username?: string };
    const users = memberData.users as UserWithDiscord[] | UserWithDiscord | undefined;
    const discordUsername = Array.isArray(users)
      ? users[0]?.discord_username
      : users?.discord_username;
    const groupIdForWebhook = memberData.group_id;

    // Update the member's role
    const { error } = await supabase
      .from('group_members')
      .update({
        role: 'trial',
        approved_at: new Date().toISOString(),
        approved_by: userId,
      })
      .eq('id', membershipId)
      .select();
    if (error) throw error;

    // Fetch the clan's webhook URLs
    let webhookUrl = null;
    try {
      const group = await supabase
        .from('groups')
        .select('group_welcome_webhook_url, group_webhook_url')
        .eq('id', groupIdForWebhook)
        .maybeSingle();
      webhookUrl = group.data?.group_welcome_webhook_url || group.data?.group_webhook_url;
    } catch (e) {
      // ignore, just don't send if not found
    }


    // Enhanced onboarding message with checklist embed
    if (webhookUrl && discordUsername) {
      const checklist = [
        ':white_check_mark: Set your main character in the planner',
        ':white_check_mark: Fill out your professions and skills',
        ':white_check_mark: Join upcoming events and RSVP',
        ':white_check_mark: Read the guild rules and code of conduct',
        ':white_check_mark: Introduce yourself in Discord',
      ];
      const embed = {
        title: '🎉 Welcome to the Guild!',
        description: `Welcome <@${discordUsername}>! We’re excited to have you join us. Here’s how to get started:`,
        color: 0x22c55e, // green
        fields: [
          {
            name: 'Onboarding Checklist',
            value: checklist.join('\n'),
          },
          {
            name: 'Need Help?',
            value: 'Ask in this channel or contact an officer for assistance.',
          },
        ],
      };
      fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          payload: {
            content: `🎉 Welcome <@${discordUsername}> to the guild!`,
            embeds: [embed],
          },
        }),
      });
    }

    await refresh();
  };

  const rejectMember = async (membershipId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const updateRole = async (membershipId: string, role: ClanRole) => {
    const { error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const updateRank = async (membershipId: string, rank: string | null) => {
    const { error } = await supabase
      .from('group_members')
      .update({ guild_rank: rank })
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const removeMember = async (membershipId: string) => {
    await rejectMember(membershipId);
  };

  // Permission helpers
  const canView = membership?.role !== 'pending' && membership?.role !== null;
  const canEdit = membership?.role === 'admin' || membership?.role === 'officer';
  const canManageMembers = membership?.role === 'admin' || membership?.role === 'officer';
  const canManageRoles = membership?.role === 'admin';

  return {
    membership,
    members,
    pendingMembers,
    loading,
    error,
    apply,
    acceptMember,
    rejectMember,
    updateRole,
    updateRank,
    removeMember,
    refresh,
    canView,
    canEdit,
    canManageMembers,
    canManageRoles,
  };
}
