
export interface LeaderboardEntry {
  name: string;
  score: number;
  accuracy: number;
  date: string;
}

export interface Target {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // pixels
  maxSize: number;
  createdAt: number;
  lifeDuration: number; // ms
  color: string;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  accuracy: number;
  clicks: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  notes: number[]; // Array of frequencies
  baseColor: string;
}

export interface GameState {
  status: 'menu' | 'playing' | 'gameover' | 'analyzing';
  stats: GameStats;
  targets: Target[];
  lives: number;
  aiComment?: string;
  currentSongId: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  size: number;
}
