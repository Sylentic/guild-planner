'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  ClanRole, 
  PERMISSIONS, 
  ROLE_CONFIG, 
  getAllPermissionCategories,
  getPermissionsForCategory,
  DEFAULT_ROLE_PERMISSIONS,
  getRoleHierarchy
} from '@/lib/permissions';

interface PermissionsSettingsProps {
  clanId: string;
  userRole: ClanRole;
  onSave?: (rolePermissions: Record<ClanRole, Set<string>>) => Promise<void>;
}

export function PermissionsSettings({ clanId, userRole, onSave }: PermissionsSettingsProps) {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [selectedRole, setSelectedRole] = useState<ClanRole>('member');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Track custom permissions for each role
  const [customPermissions, setCustomPermissions] = useState<Record<ClanRole, Set<string>>>(() => {
    const perms: Record<ClanRole, Set<string>> = {
      admin: new Set(DEFAULT_ROLE_PERMISSIONS.admin),
      officer: new Set(DEFAULT_ROLE_PERMISSIONS.officer),
      member: new Set(DEFAULT_ROLE_PERMISSIONS.member),
      trial: new Set(DEFAULT_ROLE_PERMISSIONS.trial),
      pending: new Set(DEFAULT_ROLE_PERMISSIONS.pending),
    };
    return perms;
  });

  // Load permissions from database on mount (optional - will use defaults if not found)
  useEffect(() => {
    if (!session || userRole !== 'admin') {
      setIsLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        const response = await fetch(
          `/api/clan/permissions?clan_id=${clanId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          // If not found or error, just use defaults
          setIsLoading(false);
          return;
        }

        const { permissions } = await response.json();

        // If no custom permissions exist, use defaults
        if (!permissions || permissions.length === 0) {
          setIsLoading(false);
          return;
        }

        // Build Sets from boolean fields
        const loaded: Record<ClanRole, Set<string>> = {
          admin: new Set(),
          officer: new Set(),
          member: new Set(),
          trial: new Set(),
          pending: new Set(),
        };

        permissions.forEach((perm: any) => {
          const role = perm.role as ClanRole;
          const perms = new Set<string>();

          // Check each permission field
          Object.keys(perm).forEach(key => {
            if (key !== 'id' && key !== 'clan_id' && key !== 'role' && 
                key !== 'created_at' && key !== 'updated_at') {
              if (perm[key] === true) {
                perms.add(key);
              }
            }
          });

          loaded[role] = perms;
        });

        setCustomPermissions(loaded);
      } catch (error) {
        console.error('Error loading permissions:', error);
        // Silently fail and use defaults
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [session, clanId, userRole]);

  const hierarchy = getRoleHierarchy();
  const canEditRole = userRole === 'admin';

  // Get roles that current user can manage
  const manageableRoles = (Object.keys(ROLE_CONFIG) as ClanRole[])
    .filter(role => hierarchy[userRole] > hierarchy[role])
    .sort((a, b) => hierarchy[b] - hierarchy[a]);

  const togglePermission = (role: ClanRole, permissionId: string) => {
    if (!canEditRole || role === 'admin' || role === 'pending') return;

    setCustomPermissions(prev => {
      const updated = { ...prev };
      const rolePerms = new Set(updated[role]);
      
      if (rolePerms.has(permissionId)) {
        rolePerms.delete(permissionId);
      } else {
        rolePerms.add(permissionId);
      }
      
      updated[role] = rolePerms;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!canEditRole || !session) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Convert Sets to objects for API
      const rolePermissions: Record<string, Record<string, boolean>> = {};
      
      Object.entries(customPermissions).forEach(([role, perms]) => {
        rolePermissions[role] = {};
        
        // Start with all permissions set to false
        Object.keys(PERMISSIONS).forEach(permId => {
          rolePermissions[role][permId] = perms.has(permId);
        });
      });

      const response = await fetch('/api/clan/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          clanId,
          rolePermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to save permissions: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Permissions updated successfully!' });
      
      // Call optional callback if provided
      if (onSave) {
        await onSave(customPermissions);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save permissions' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCustomPermissions({
      admin: new Set(DEFAULT_ROLE_PERMISSIONS.admin),
      officer: new Set(DEFAULT_ROLE_PERMISSIONS.officer),
      member: new Set(DEFAULT_ROLE_PERMISSIONS.member),
      trial: new Set(DEFAULT_ROLE_PERMISSIONS.trial),
      pending: new Set(DEFAULT_ROLE_PERMISSIONS.pending),
    });
    setMessage(null);
  };

  const categories = getAllPermissionCategories().sort();
  const selectedRoleConfig = ROLE_CONFIG[selectedRole];
  const selectedRolePerms = customPermissions[selectedRole];

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-8 text-center text-slate-400">
        <p>Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Role Permissions</h3>
          <p className="text-sm text-slate-400 mt-1">
            {canEditRole 
              ? 'Customize what each role can do in your guild' 
              : 'You do not have permission to manage permissions'}
          </p>
        </div>
        {canEditRole && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            Reset to Default
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Role Selection */}
      <div className="flex gap-2 flex-wrap">
        {manageableRoles.length > 0 && (
          <>
            {manageableRoles.map((role) => {
              const roleConfig = ROLE_CONFIG[role];
              return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                disabled={!canEditRole}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === role
                    ? `ring-2 ring-offset-2 ring-offset-slate-900 ${roleConfig.color}`
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                } ${!canEditRole ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                style={selectedRole === role ? {
                  backgroundColor: roleConfig.color.replace('text-', '').slice(0, -2) + '30',
                } : undefined}
              >
                {roleConfig.label}
              </button>
            );
            })}
          </>
        )}
        {userRole === 'admin' && (
          <>
            {/* Show admin role but disabled */}
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 cursor-not-allowed opacity-50">
              {ROLE_CONFIG.admin.label}
              <span className="text-xs ml-1">(immutable)</span>
            </div>
            {/* Show pending role but disabled */}
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-400 cursor-not-allowed opacity-50">
              {ROLE_CONFIG.pending.label}
              <span className="text-xs ml-1">(immutable)</span>
            </div>
          </>
        )}
      </div>

      {/* Permissions Grid */}
      {canEditRole && manageableRoles.includes(selectedRole) ? (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryPermissions = getPermissionsForCategory(category);
            return (
              <div key={category} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryPermissions.map((perm) => {
                    const isChecked = selectedRolePerms.has(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-start gap-2 p-2 rounded hover:bg-slate-700/50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(selectedRole, perm.id)}
                          disabled={selectedRole === 'admin' || selectedRole === 'pending'}
                          className="mt-1 w-4 h-4 rounded border-slate-600 accent-orange-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                            {t(`permissions.${perm.id}.name`)}
                          </div>
                          <div className="text-xs text-slate-400">{t(`permissions.${perm.id}.description`)}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg p-8 text-center text-slate-400">
          <p>You cannot modify permissions for this role.</p>
          <p className="text-sm mt-1">Only admins can change role permissions.</p>
        </div>
      )}

      {/* Save Button */}
      {canEditRole && (
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Permissions'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
