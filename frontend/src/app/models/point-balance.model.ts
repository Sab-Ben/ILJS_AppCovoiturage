export type UserLevelName =
  | 'DEBUTANT'
  | 'EXPLORATEUR'
  | 'VOYAGEUR'
  | 'EXPERT'
  | 'AMBASSADEUR';

export interface PointBalance {
  currentBalance: number;
  totalEarned: number;
  level: UserLevelName;
  levelLabel: string;
  levelRank: number;
  nextLevel: UserLevelName | null;
  nextLevelLabel: string | null;
  pointsToNextLevel: number;
  nextLevelThreshold: number | null;
  currentLevelThreshold: number;
  levelProgressPercent: number;
  levelAvantages: string;
}

export interface UserLevelConfig {
  name: UserLevelName;
  label: string;
  rank: number;
  threshold: number;
  color: string;
  icon: string;
}

export const USER_LEVELS: UserLevelConfig[] = [
  { name: 'DEBUTANT', label: 'Débutant', rank: 1, threshold: 0, color: '#94a3b8', icon: '🌱' },
  { name: 'EXPLORATEUR', label: 'Explorateur', rank: 2, threshold: 200, color: '#3b82f6', icon: '🧭' },
  { name: 'VOYAGEUR', label: 'Voyageur', rank: 3, threshold: 600, color: '#8b5cf6', icon: '✈️' },
  { name: 'EXPERT', label: 'Expert', rank: 4, threshold: 1500, color: '#f59e0b', icon: '⭐' },
  { name: 'AMBASSADEUR', label: 'Ambassadeur', rank: 5, threshold: 4000, color: '#ef4444', icon: '👑' }
];
