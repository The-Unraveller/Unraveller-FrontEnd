import axios from 'axios';

const API_BASE_URL = 'http://localhost:5251/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MissionDto {
  id: number;
  title: string;
  goal: string;
  description: string;
  startSuspicion: number;
  stage: string;
  difficulty: string;
  xpReward: number;
  imageUrl: string;
  npcName: string;
  npcEmoji: string;
  locked: boolean;
}

export interface DialogueRequestDto {
  userId: number;
  missionId: number;
  message: string;
}

export interface DialogueResponseDto {
  npcResponse: string;
  feedback: string;
  newSuspicionLevel: number;
  isWin: boolean;
  isLose: boolean;
  turnCount: number;
  xpEarned: number;
}

export const getMissions = async (): Promise<MissionDto[]> => {
  const response = await apiClient.get<MissionDto[]>('/Mission');
  return response.data;
};

export const getMissionById = async (id: number): Promise<MissionDto> => {
  const response = await apiClient.get<MissionDto>(`/Mission/${id}`);
  return response.data;
};

export const sendGameMessage = async (request: DialogueRequestDto): Promise<DialogueResponseDto> => {
  const response = await apiClient.post<DialogueResponseDto>('/Game/message', request);
  return response.data;
};

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  badge: string;
  isYou: boolean;
}

export const getLeaderboard = async (userId: number = 1): Promise<LeaderboardEntry[]> => {
  try {
    const res = await apiClient.get<LeaderboardEntry[]>(`/Leaderboard?userId=${userId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch leaderboard from API, returning mock data", err);
    return [
      { rank: 1, name: 'Minh Khôi', xp: 4800, badge: '👑', isYou: false },
      { rank: 2, name: 'Lan Anh',   xp: 3950, badge: '🥈', isYou: false },
      { rank: 3, name: 'Tuấn Khoa', xp: 3200, badge: '🥉', isYou: false },
      { rank: 4, name: 'KHOA_PRO',  xp: 1250, badge: '⚡', isYou: true }
    ];
  }
};
