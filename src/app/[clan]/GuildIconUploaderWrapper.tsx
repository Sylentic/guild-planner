import { useState } from 'react';
import { GuildIconUploader } from '@/components/GuildIconUploader';

interface GuildIconUploaderWrapperProps {
  clanId: string;
  currentUrl?: string;
  onIconChange: (url: string) => void;
}

export function GuildIconUploaderWrapper({ clanId, currentUrl, onIconChange }: GuildIconUploaderWrapperProps) {
  const [iconUrl, setIconUrl] = useState(currentUrl);

  return (
    <GuildIconUploader
      clanId={clanId}
      currentUrl={iconUrl}
      onUploaded={(url) => {
        setIconUrl(url);
        onIconChange(url);
      }}
    />
  );
}
