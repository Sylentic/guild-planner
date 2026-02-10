"use client";
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { MigrationBanner } from '@/components/common/MigrationBanner';
import { supabase } from '@/lib/supabase';

export function IsAdminBannerWrapper() {
  const { user } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!user) {
      setIsAdmin(false);
      return () => {
        isActive = false;
      };
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', user.id)
        .or('role.eq.admin,is_creator.eq.true')
        .limit(1);

      if (!isActive) return;

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(Boolean(data?.length));
    };

    checkAdmin();

    return () => {
      isActive = false;
    };
  }, [user]);

  return <MigrationBanner isAdmin={isAdmin} />;
}

