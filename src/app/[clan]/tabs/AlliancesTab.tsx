"use client";

import { useAlliances } from '@/hooks/useAlliances';
import { AllianceView } from '@/components/AllianceView';

interface AlliancesTabProps {
  clanId: string;
  isOfficer: boolean;
}

export function AlliancesTab({ clanId, isOfficer }: AlliancesTabProps) {
  const {
    myAlliance,
    createAlliance,
    inviteGuild,
    leaveAlliance,
    loading,
    error,
  } = useAlliances(clanId);

  if (loading) return <div className="text-slate-400">Loading alliances...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <AllianceView
      alliance={myAlliance}
      clanId={clanId}
      onCreateAlliance={createAlliance}
      onInviteGuild={inviteGuild}
      onLeave={leaveAlliance}
      isOfficer={isOfficer}
    />
  );
}
