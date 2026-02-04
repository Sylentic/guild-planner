"use client";
import { useAuthContext } from '@/components/auth/AuthProvider';
import { MigrationBanner } from '@/components/common/MigrationBanner';

export function IsAdminBannerWrapper() {
  const { user } = useAuthContext();
  // TODO: Replace with actual admin check (e.g., from membership or a global admin flag)
  const isAdmin = !!user;
  return <MigrationBanner isAdmin={isAdmin} />;
}

