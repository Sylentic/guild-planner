# Changelog

## \[Unreleased]

### Added

* Public groups list on the home page for groups marked public.
* Admin setting to require approval for new members.
* Configurable starting role (trial or member) for new group members.
* Separate Group Settings page accessible from group root (`/[group]/settings`).
* Settings button in group header for admins to access group-wide settings.

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
