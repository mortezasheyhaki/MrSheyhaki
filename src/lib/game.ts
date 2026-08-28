// src/lib/game.ts
export interface Game {
  id: string;
  title: string;
  type: 'BE' | 'MR' | 'other';
  thumbnail: string;
  progress: number;
  score: number;
  accuracy: number;
  bestScore: number;
  bestAccuracy: number;
  bestStars: number;
}

const STORAGE_KEY = 'gamesData';

export function loadGames(): Game[] {
  if (typeof localStorage === 'undefined') return createDefaultGames();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDefaultGames();
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as Game[] : createDefaultGames();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return createDefaultGames();
  }
}

function createDefaultGames(): Game[] {
  return [
    {
      id: 'breakthrough',
      title: 'Breakthrough',
      type: 'BE',
      thumbnail: 'https://picsum.photos/id/1015/300/200',
      progress: 0,
      score: 0,
      accuracy: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestStars: 0,
    },
    {
      id: 'match-rush',
      title: 'Match Rush',
      type: 'MR',
      thumbnail: 'https://picsum.photos/id/201/300/200',
      progress: 0,
      score: 0,
      accuracy: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestStars: 0,
    },
    // add any other games the same way...
  ];
}

export function saveGames(games: Game[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch {
    // Storage may be unavailable, full, or disabled; keep the in-memory game state usable.
  }
}