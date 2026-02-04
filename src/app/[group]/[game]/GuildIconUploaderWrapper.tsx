import { useState } from 'react';
import { GuildIconUploader } from '@/components/GuildIconUploader';

interface GuildIconUploaderWrapperProps {
  groupId: string;
  currentUrl?: string;
  onIconChange: (url: string) => void;
}

export function GuildIconUploaderWrapper({ groupId, currentUrl, onIconChange }: GuildIconUploaderWrapperProps) {
  const [iconUrl, setIconUrl] = useState(currentUrl);

  return (
    <GuildIconUploader
      groupId={groupId}
      currentUrl={iconUrl}
      onUploaded={(url) => {
        setIconUrl(url);
        onIconChange(url);
      }}
    />
  );
}

