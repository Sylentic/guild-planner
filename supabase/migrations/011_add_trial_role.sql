-- Add trial role to clan_members
-- Migration to introduce the trial membership level between member and pending

BEGIN;

-- Update the CHECK constraint to include 'trial'
ALTER TABLE clan_members 
DROP CONSTRAINT clan_members_role_check;

ALTER TABLE clan_members
ADD CONSTRAINT clan_members_role_check 
  CHECK (role IN ('admin', 'officer', 'member', 'trial', 'pending'));

COMMIT;
