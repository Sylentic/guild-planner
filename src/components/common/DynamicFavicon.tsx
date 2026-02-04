'use client';

import { useEffect } from 'react';

interface DynamicFaviconProps {
  iconUrl?: string;
}

export function DynamicFavicon({ iconUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (!iconUrl) return;

    // Update favicon
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = iconUrl;
    
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(link);
    }

    // Update apple touch icon
    const appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (appleLink) {
      appleLink.href = iconUrl;
    }

    // Cleanup - reset to default when component unmounts or iconUrl becomes undefined
    return () => {
      if (!iconUrl) {
        const defaultLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (defaultLink) {
          defaultLink.href = '/favicon.ico';
        }
      }
    };
  }, [iconUrl]);

  return null;
}
