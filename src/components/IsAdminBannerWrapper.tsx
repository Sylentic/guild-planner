import { useAuthContext } from '@/components/AuthProvider';
import { MigrationBanner } from '@/components/MigrationBanner';

export function IsAdminBannerWrapper() {
  const { profile } = useAuthContext();
  // You may want to refine this check based on your actual admin logic
  const isAdmin = profile?.role === 'admin' || profile?.is_creator;
  return <MigrationBanner isAdmin={!!isAdmin} />;
}
