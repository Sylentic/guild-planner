# GitHub Copilot Instructions

Quick reference for developing on Guild Planner. See [.ai-instructions.md](../.ai-instructions.md) for the comprehensive guide.

## Code Patterns

### Permission Checks

```typescript
// ✅ Correct
const canEdit = hasPermission('settings_edit_roles');  // Check src/lib/permissions.ts for valid names

// ❌ Wrong
const canEdit = hasPermission('settings_edit_permissions');  // This permission doesn't exist
```

### New Components

```typescript
interface ComponentProps {
  groupId: string;
  userRole: GroupRole;  // Always include for permission checks
  onSave?: (data: any) => Promise<void>;
}

// In settings pages, always check permissions first
const { hasPermission } = usePermissions(group?.id);
const canDoX = hasPermission('permission_name');  // Verify permission exists in src/lib/permissions.ts
if (!canDoX) return <AccessDenied />;
```

### Async Operations

```typescript
// Always wrap fetches in try/catch with user feedback
try {
  setLoading(true);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(await response.text());
  
  const data = await response.json();
  setMessage({ type: 'success', text: 'Success!' });
} catch (error) {
  setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed' });
  console.error('Operation failed:', error);
} finally {
  setLoading(false);
}
```

## Version Management

### Changelog

Update `CHANGELOG.md` when:

* ✅ Adding features
* ✅ Fixing bugs (especially permission/auth)
* ✅ Database schema changes
* ❌ Internal refactors without user-facing changes

Format:

```markdown
## [Unreleased]

### Added
- Feature description

### Fixed
- Bug fix description

### Changed
- Breaking change description
```

### Database Migrations

```bash
# Create new migration (sequential 3-digit number)
touch supabase/migrations/001_feature_name.sql

# Test locally first
npx supabase db reset --linked  # in dev

# Apply to production
npx supabase db push
```

**Rules:**

* ✅ Always create NEW migrations, never edit existing ones
* ✅ Migrations must be reversible (UP/DOWN)
* ✅ Test in dev first with `.env.local.dev`
* ❌ Don't edit `000_baseline.sql` unless squashing old migrations

## Logging

### Console Usage

```typescript
// ✅ Keep these - helps with debugging
console.error('User auth failed:', error);
console.warn('Deprecated API called');

// ❌ Remove before merging
console.log('Debug message');
console.log('currentUser:', user);
```

### Error Messages

```typescript
// Show user-facing messages via state
setMessage({ 
  type: 'error', 
  text: 'Failed to update permissions: Access denied' 
});

// Log technical details for debugging
console.error('API error:', { status, code, message });
```

## Critical Checks

* \[ ] **Permissions**: Valid name from `src/lib/permissions.ts`?
* \[ ] **Role Hierarchy**: Using `getRoleHierarchy()` for comparisons?
* \[ ] **Auth**: User identity verified before database changes?
* \[ ] **Types**: No `any` types unless impossible to avoid
* \[ ] **Logging**: Removed debug console.log statements?
* \[ ] **CHANGELOG**: Updated if feature/bug fix/breaking change?
* \[ ] **Migrations**: Tested in dev with `.env.local.dev` first?

## Common Issues

| Problem | Fix |
|---------|-----|
| "user is not an admin" after backup | Run `scripts/restore-admin-role.ps1` |
| Permissions section not showing | Check permission name typo - should be `settings_edit_roles` |
| Type errors with `GroupRole` | Import from `src/lib/permissions.ts` |
| Database migration fails | Create NEW file, don't edit existing migrations |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/permissions.ts` | Single source of truth for all permissions |
| `src/app/api/group/permissions/route.ts` | Backend permission API (admin req'd) |
| `supabase/migrations/000_baseline.sql` | Complete database schema |
| `src/components/settings/PermissionsSettings.tsx` | Permission editor UI |

## Environment

```bash
# Development
npm run dev              # Start dev server
# Uses .env.local.dev + dev Supabase project

# Production requires .env.local
# Never test permission changes on prod without approval
```

## Before Committing

```bash
npm run lint       # Fix style issues
npm run type-check # Verify types
```

***

**For detailed information**, see [.ai-instructions.md](../.ai-instructions.md) in the project root.
