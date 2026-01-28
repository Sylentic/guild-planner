'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useClanMembership } from './useClanMembership';
import { ClanRole, roleHasPermission, canManageRole, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';

export interface RolePermissions {
  role: ClanRole;
  permissions: Set<string>;
}

export function usePermissions(clanId?: string) {
  const { user } = useAuth();
  const { membership } = useClanMembership(clanId || null, user?.id || null);
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch custom permission overrides from the server
  useEffect(() => {
    if (!clanId || !user) return;

    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/clan/permissions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'X-Clan-ID': clanId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const overrides = data.find((o: any) => o.role === membership?.role);
          if (overrides) {
            // Extract just the permission columns (all the boolean fields)
            const perms: Record<string, boolean> = {};
            Object.keys(overrides).forEach(key => {
              if (key !== 'id' && key !== 'clan_id' && key !== 'role' && key !== 'created_at' && key !== 'updated_at') {
                perms[key] = overrides[key];
              }
            });
            setCustomPermissions(perms);
          }
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [clanId, user, membership?.role]);
  
  // Check if current user has a specific permission
  // First checks custom overrides, then falls back to default role permissions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !membership) return false;

    // If we have custom permissions loaded, check those first
    if (customPermissions !== null) {
      // Convert permission ID to database column name (convert underscores to match DB format)
      const dbColumnName = permission; // Already in correct format from PERMISSIONS object
      if (dbColumnName in customPermissions) {
        return customPermissions[dbColumnName];
      }
    }

    // Fall back to default role permissions
    const userRole = membership.role as ClanRole;
    return roleHasPermission(userRole, permission);
  }, [user, membership, customPermissions]);

  // Get current user's role
  const getUserRole = useCallback((): ClanRole => {
    return (membership?.role as ClanRole) ?? 'pending';
  }, [membership]);

  // Check if user can manage another role
  const canManage = useCallback((targetRole: ClanRole): boolean => {
    const userRole = getUserRole();
    return canManageRole(userRole, targetRole);
  }, [getUserRole]);

  // Check multiple permissions (all must be true)
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(perm => hasPermission(perm));
  }, [hasPermission]);

  // Check multiple permissions (any must be true)
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(perm => hasPermission(perm));
  }, [hasPermission]);

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return getUserRole() === 'admin';
  }, [getUserRole]);

  // Check if user is admin or officer
  const isLeadership = useCallback((): boolean => {
    const role = getUserRole();
    return role === 'admin' || role === 'officer';
  }, [getUserRole]);

  return {
    userRole: getUserRole(),
    hasPermission,
    canManage,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isLeadership,
    rolePermissions: customPermissions,
    loading,
  };
}
