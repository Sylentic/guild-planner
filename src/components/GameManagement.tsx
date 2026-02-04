'use client';

import { useState, useEffect } from 'react';
import { Archive, ArchiveRestore, Loader2, Check, AlertCircle } from 'lucide-react';
import { getGroupGames, archiveGameForGroup, unarchiveGameForGroup } from '@/lib/group-games';
import { getAllGames } from '@/lib/games';

interface GameManagementProps {
  groupId: string;
  onUpdate?: () => void;
}

interface GameStatus {
  slug: string;
  name: string;
  icon: string;
  archived: boolean;
}

export function GameManagement({ groupId, onUpdate }: GameManagementProps) {
  const [games, setGames] = useState<GameStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchGameStatuses = async () => {
    setLoading(true);
    try {
      // Get all active games
      const activeGames = await getGroupGames(groupId, false);
      // Get all games including archived
      const allGames = await getGroupGames(groupId, true);
      
      const allGamesList = getAllGames();
      
      // Build status for each game the group has enabled
      const gameStatuses: GameStatus[] = allGamesList
        .filter(game => allGames.includes(game.id))
        .map(game => ({
          slug: game.id,
          name: game.name,
          icon: game.icon,
          archived: !activeGames.includes(game.id),
        }));
      
      setGames(gameStatuses);
    } catch (err) {
      console.error('Error fetching game statuses:', err);
      setErrorMessage('Failed to load game statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameStatuses();
  }, [groupId]);

  const handleArchive = async (gameSlug: string, gameName: string) => {
    setActionInProgress(gameSlug);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const success = await archiveGameForGroup(groupId, gameSlug);
      if (success) {
        setSuccessMessage(`${gameName} has been archived`);
        await fetchGameStatuses();
        onUpdate?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(`Failed to archive ${gameName}`);
      }
    } catch (err) {
      setErrorMessage(`Error archiving ${gameName}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnarchive = async (gameSlug: string, gameName: string) => {
    setActionInProgress(gameSlug);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const success = await unarchiveGameForGroup(groupId, gameSlug);
      if (success) {
        setSuccessMessage(`${gameName} has been restored`);
        await fetchGameStatuses();
        onUpdate?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(`Failed to restore ${gameName}`);
      }
    } catch (err) {
      setErrorMessage(`Error restoring ${gameName}`);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Game Management</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Game Management</h3>
        <p className="text-slate-400 text-sm">No games configured for this group.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Game Management</h3>
      <p className="text-slate-400 text-sm mb-4">
        Archive games to hide them from the UI and prevent updates, while preserving all data.
      </p>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Games List */}
      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.slug}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              game.archived
                ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{game.icon}</span>
              <div>
                <div className="font-medium text-white">{game.name}</div>
                {game.archived && (
                  <div className="text-xs text-slate-500 mt-0.5">Archived</div>
                )}
              </div>
            </div>

            <button
              onClick={() =>
                game.archived
                  ? handleUnarchive(game.slug, game.name)
                  : handleArchive(game.slug, game.name)
              }
              disabled={actionInProgress === game.slug}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                game.archived
                  ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30'
                  : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {actionInProgress === game.slug ? (
                <Loader2 size={16} className="animate-spin" />
              ) : game.archived ? (
                <>
                  <ArchiveRestore size={16} />
                  Restore
                </>
              ) : (
                <>
                  <Archive size={16} />
                  Archive
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        <strong>Note:</strong> Archiving a game hides it from navigation and prevents any updates,
        but all characters, ships, and other data remain in the database and can be restored at any time.
      </div>
    </div>
  );
}
