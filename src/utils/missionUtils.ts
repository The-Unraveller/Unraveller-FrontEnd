import type { UserProfileDto } from '../services/api';

export const MissionDomain = {
  Professional: 0,
  Academic: 1,
  Social: 2,
} as const;

export type MissionDomain = (typeof MissionDomain)[keyof typeof MissionDomain];

export const DOMAIN_LABELS: Record<number, string> = {
  [MissionDomain.Professional]: 'Kỹ năng Công việc',
  [MissionDomain.Academic]: 'Học thuật',
  [MissionDomain.Social]: 'Giao tiếp Xã hội',
};

export const DOMAIN_ICONS: Record<number, string> = {
  [MissionDomain.Professional]: '💼',
  [MissionDomain.Academic]: '📚',
  [MissionDomain.Social]: '☕',
};

export interface MissionDisplay {
  id: number;
  stage: string;
  title: string;
  desc: string;
  img: string;
  locked: boolean;
  stars: number;
  difficulty: string;
  diffColor: string;
  xpReward: number;
  grammarTarget: string;
  domain: MissionDomain;
  completed: boolean;
}

export function getMissionLockStatus(
  missionId: number,
  user: UserProfileDto | null
): boolean {
  // Not logged in → only mission 1 accessible
  if (!user) return missionId > 1;
  // Premium → everything unlocked
  if (user.isPremium) return false;
  // Mission 1 always accessible
  if (missionId === 1) return false;
  // Sequential unlock: mission N unlocks when mission N-1 is completed
  const prevCompleted = (prevId: number) =>
    user.missionProgresses?.some(
      (p) => p.missionId === prevId && p.status === 'Completed'
    ) ?? false;

  return !prevCompleted(missionId - 1);
}

/** Calculate stars from mission progress (0-3) */
export function getMissionStars(
  missionId: number,
  user: UserProfileDto | null
): number {
  if (!user?.missionProgresses) return 0;
  const progress = user.missionProgresses.find(
    (p) => p.missionId === missionId && p.status === 'Completed'
  );
  if (!progress) return 0;
  if (progress.currentSuspicion < 25) return 3;
  if (progress.currentSuspicion < 50) return 2;
  return 1;
}

/** Check if a mission is completed */
export function isMissionCompleted(
  missionId: number,
  user: UserProfileDto | null
): boolean {
  return (
    user?.missionProgresses?.some(
      (p) => p.missionId === missionId && p.status === 'Completed'
    ) ?? false
  );
}

/** Map domain number to display label */
export function getDomainLabel(domain: number): string {
  return DOMAIN_LABELS[domain as MissionDomain] ?? 'Khác';
}

/** Map domain number to icon */
export function getDomainIcon(domain: number): string {
  return DOMAIN_ICONS[domain as MissionDomain] ?? '📌';
}

/** Resolve difficulty color class from string */
export function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    Beginner: 'badge-success',
    Easy: 'badge-success',
    Intermediate: 'badge-cyan',
    Medium: 'badge-cyan',
    Advanced: 'badge-purple',
    Hard: 'badge-purple',
  };
  return map[difficulty] || 'badge-cyan';
}