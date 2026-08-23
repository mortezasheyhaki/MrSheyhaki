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
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : createDefaultGames();
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}