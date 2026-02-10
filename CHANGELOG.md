# Changelog

## \[Unreleased]

### Added

* Public groups list on the home page for groups marked public.
* Admin setting to require approval for new members.
* Configurable starting role (trial or member) for new group members.
* Separate Group Settings page accessible from group root (`/[group]/settings`).
* Settings button in group header for admins to access group-wide settings.
* **Testing infrastructure with Jest and React Testing Library**
* **Phase 1 authentication and permission system test suite: 133 passing tests**
  * Permission system tests (30 tests, 100% coverage)
  * Utility function tests (9 tests, 100% coverage)
  * Game validation tests (8 tests)
  * Authentication system tests (42 tests) - OAuth flows, user profiles, group membership, role management
  * usePermissions hook tests (40 tests) - permission checking, role management, custom overrides, security
* Test patterns for mocking Supabase, React hooks, and async operations
* Testing documentation: TESTING.md, TESTING\_QUICK\_REFERENCE.md, TESTING\_ROADMAP.md
* npm test scripts (test, test:watch, test:coverage) with 50% coverage thresholds
* Missing `guild_bank_manage` permission definition

### Changed

* New joins auto-approve with group-configured role when approval is disabled.
* Manual approval now assigns the group-configured starting role.
* Split settings into Group Settings (recruitment, permissions, games, icon, membership) and Game Settings (game-specific rank management, webhooks).
* Moved member management (accepting/rejecting, role updates, removal) to Group Settings.
* Game-specific settings pages now only show rank management for that game's members.
* Game-specific settings pages now link to Group Settings for group-wide configuration.
* Added `approval_required` and `default_role` flags on groups.

### Fixed

* Restored role colors and creator-first member sorting in member management lists.
* Bug where `guild_bank_manage` permission was referenced but not defined in PERMISSIONS constant
