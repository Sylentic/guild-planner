import { useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { updateClanIconUrl } from '@/lib/auth';

interface GuildIconUploaderProps {
  clanId: string;
  currentUrl?: string;
  onUploaded?: (url: string) => void;
}

export function GuildIconUploader({ clanId, currentUrl, onUploaded }: GuildIconUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [iconUrl, setIconUrl] = useState(currentUrl || '');
  const { user, session } = useAuthContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user || !session) {
      alert('You must be logged in to upload a guild icon.');
      return;
    }
    // Debug output for session/user
    console.log('GuildIconUploader: user', user);
    console.log('GuildIconUploader: session', session);
    setUploading(true);
    const filePath = `${clanId}/icon.png`;
    const { error } = await supabase.storage
      .from('guild-icons')
      .upload(filePath, file, { upsert: true });
    if (error) {
      alert('Upload failed! ' + (error.message || ''));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('guild-icons').getPublicUrl(filePath);
    if (data?.publicUrl) {
      await updateClanIconUrl(clanId, data.publicUrl);
      setIconUrl(data.publicUrl);
      if (onUploaded) onUploaded(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {iconUrl && (
        <img src={iconUrl} alt="Guild Icon" className="w-16 h-16 rounded-full border border-slate-700" />
      )}
      <label className={`inline-block px-4 py-2 rounded bg-blue-600 text-white font-semibold cursor-pointer hover:bg-blue-700 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ position: 'relative' }}>
        {uploading ? 'Uploading...' : 'Choose File'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
