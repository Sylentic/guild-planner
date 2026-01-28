"use client";
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { updateClanIconUrl } from '@/lib/auth';

// Use env var for bucket name, fallback to 'guild-icons'
const GUILD_ICON_BUCKET = process.env.NEXT_PUBLIC_GUILD_ICON_BUCKET || 'guild-icons';

interface GuildIconUploaderProps {
  clanId: string;
  currentUrl?: string;
  onUploaded?: (url: string) => void;
}

export function GuildIconUploader({ clanId, currentUrl, onUploaded }: GuildIconUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [iconUrl, setIconUrl] = useState(currentUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, session } = useAuthContext();

  // Keep iconUrl in sync with currentUrl prop
  useEffect(() => {
    setIconUrl(currentUrl || '');
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user || !session) {
      setError('You must be logged in to upload a guild icon.');
      return;
    }
    setUploading(true);
    const filePath = `${clanId}/icon.png`;
    const { error } = await supabase.storage
      .from(GUILD_ICON_BUCKET)
      .upload(filePath, file, { upsert: true });
    if (error) {
      setError('Upload failed! ' + (error.message || ''));
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(GUILD_ICON_BUCKET).getPublicUrl(filePath);
    if (data?.publicUrl) {
      await updateClanIconUrl(clanId, data.publicUrl);
      setIconUrl(data.publicUrl);
      setSuccess('Icon uploaded successfully!');
      if (onUploaded) onUploaded(data.publicUrl);
    }
    setUploading(false);
    // Reset file input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {iconUrl && (
        <img src={iconUrl} alt="Guild Icon" className="w-16 h-16 rounded-full border border-slate-700" />
      )}
      <label
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-dashed border-slate-600 hover:border-orange-500/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ position: 'relative' }}
      >
        {uploading ? (
          <span className="font-medium">Uploading...</span>
        ) : (
          <span className="font-medium">Choose File</span>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-1">{success}</div>}
    </div>
  );
}
