// Backend DTOs from ASP.NET API - camelCase serialization expected

// DTO from: GET /api/scenarios
export interface ScenarioListDto {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  isUnlocked: boolean;
  thumbnailUrl: string;
}

// DTO from: GET /api/users/profile
export interface UserProfileDto {
  userId: string;
  displayName: string;
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  currentStreak: number;
}

// DTO from: GET /api/scenarios/{id}
export interface ScenarioDetailDto {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  isUnlocked: boolean;
  thumbnailUrl: string;
  totalTurns: number;
  maxSuspicion: number;
}

// DTO from: POST /api/scenarios/{id}/complete
export interface ScenarioResultDto {
  scenarioId: string;
  isSuccess: boolean;
  xpEarned: number;
  finalSuspicion: number;
  turnsCompleted: number;
  medalUnlocked?: MedalDto;
}

// DTO for achievements/medals
export interface MedalDto {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}