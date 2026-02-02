'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameId } from '@/lib/games';

interface GameContextType {
  selectedGame: GameId | null;
  setSelectedGame: (gameId: GameId) => void;
  clearSelectedGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const handleSetGame = useCallback((gameId: GameId) => {
    setSelectedGame(gameId);
  }, []);

  const handleClearGame = useCallback(() => {
    setSelectedGame(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        selectedGame,
        setSelectedGame: handleSetGame,
        clearSelectedGame: handleClearGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
