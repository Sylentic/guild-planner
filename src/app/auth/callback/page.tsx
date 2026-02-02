'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/?error=auth_failed');
        return;
      }

      // Check if the user came from dev domain (via Referer or redirect_to param)
      const redirectTo = localStorage.getItem('authRedirectTo');
      localStorage.removeItem('authRedirectTo');
      
      // If coming from dev domain, redirect back to dev
      if (redirectTo && redirectTo.includes('dev.gp')) {
        router.push(redirectTo);
      } else {
        // Check if we should redirect to dev based on current hostname
        const isDev = typeof window !== 'undefined' && 
                      window.location.hostname === 'dev.gp.pandamonium-gaming.com';
        
        if (isDev) {
          // Redirect to dev home
          router.push('/');
        } else {
          // Redirect to prod home or stored location
          router.push(redirectTo || '/');
        }
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Completing login...</p>
      </div>
    </div>
  );
}
