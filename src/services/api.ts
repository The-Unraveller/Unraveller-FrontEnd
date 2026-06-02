import axios from 'axios';
// Deployed Backend (Render)
const API_BASE_URL = 'https://unraveller-backend.onrender.com/api';

// Local Backend (for adding new functions/testing)
// const API_BASE_URL = 'http://localhost:5251/api';
//for now, we use local backend

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT Interceptor: Automatically add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- DTOs ---

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
  approvalStatus: number;
  rejectionReason: string | null;
  createdByUserId: number | null;
  grammarTarget: string;
}

export interface DialogueRequestDto {
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

export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  role: string;
  energy: number;
  maxEnergy: number;
  lastEnergyRechargedAt: string;
  streakCount: number;
  lastActiveDate: string;
  xpBalance: number;
  isPremium: boolean;
  englishLevel: string;
  createdAt: string;
}

export interface ShopItemDto {
  id: number;
  name: string;
  description: string;
  type: string; // 'InGameHint', 'BribeNpc', 'Cosmetic'
  priceXp: number;
  emoji: string;
}

export interface BuyItemRequestDto {
  itemId: number;
  quantity: number;
}

export interface BuyItemResponseDto {
  success: boolean;
  message: string;
  newXpBalance: number;
  newQuantity: number;
}

export interface UseItemRequestDto {
  itemId: number;
  missionId: number;
}

export interface UseItemResponseDto {
  success: boolean;
  message: string;
  newSuspicionLevel?: number;
  hint?: string | null;
}

export interface CreatePaymentRequestDto {
  planId: string;
  amount: number;
}

export interface PaymentResponseDto {
  success: boolean;
  paymentUrl?: string;
  orderId?: string;
  message?: string;
}

// payOS — response from create-payos-link
export interface CreatePayOSLinkResponseDto {
  success: boolean;
  checkoutUrl?: string;
  message?: string;
}

export interface PaymentHistoryDto {
  id: number;
  planId: string;
  amount: number;
  status: string;
  createdAt: string;
  orderId: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  badge: string;
  isYou: boolean;
}

export interface UserInventoryDto {
  itemId: number;
  name: string;
  description: string;
  type: string;
  quantity: number;
  emoji: string;
}

// --- API Functions ---

// Auth
export const login = async (email: string, password: string): Promise<{ token: string }> => {
  const response = await apiClient.post<{ token: string }>('/Auth/login', { email, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/Auth/register', { username, email, password });
  return response.data;
};

export const loginWithGoogle = async (idToken: string): Promise<{ token: string }> => {
  const response = await apiClient.post<{ token: string }>('/Auth/google', { idToken });
  return response.data;
};

// User
export const getUserProfile = async (): Promise<UserProfileDto> => {
  const response = await apiClient.get<UserProfileDto>('/User/profile');
  return response.data;
};

export const updateStreak = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/User/update-streak');
  return response.data;
};

export const updateEnglishLevel = async (englishLevel: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/User/english-level', { englishLevel });
  return response.data;
};

export const updateUserProfile = async (username: string, email: string): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>('/User/profile', { username, email });
  return response.data;
};

// Missions
export const getMissions = async (): Promise<MissionDto[]> => {
  const response = await apiClient.get<MissionDto[]>('/Mission');
  return response.data;
};

export const getMissionById = async (id: number): Promise<MissionDto> => {
  const response = await apiClient.get<MissionDto>(`/Mission/${id}`);
  return response.data;
};

// Game
export interface DialogueMessageHistoryDto {
  role: string;
  playerMessage?: string;
  npcResponse?: string;
  feedback?: string;
  suspicionChange: number;
}

export interface GameSessionDto {
  hasActiveSession: boolean;
  currentSuspicion: number;
  turnCount: number;
  xpEarned: number;
  history: DialogueMessageHistoryDto[];
}

export const sendGameMessage = async (request: DialogueRequestDto): Promise<DialogueResponseDto> => {
  const response = await apiClient.post<DialogueResponseDto>('/Game/message', request);
  return response.data;
};

export const getGameSession = async (missionId: number): Promise<GameSessionDto> => {
  const response = await apiClient.get<GameSessionDto>(`/Game/session/${missionId}`);
  return response.data;
};

export const resetGameSession = async (missionId: number): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/Game/reset/${missionId}`);
  return response.data;
};

// Leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const res = await apiClient.get<LeaderboardEntry[]>(`/Leaderboard`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch leaderboard, returning mock data", err);
    return [
      { rank: 1, name: 'Minh Khôi', xp: 4800, badge: '👑', isYou: false },
      { rank: 2, name: 'Lan Anh', xp: 3950, badge: '🥈', isYou: false },
      { rank: 3, name: 'Tuấn Khoa', xp: 3200, badge: '🥉', isYou: false },
      { rank: 4, name: 'KHOA_PRO', xp: 1250, badge: '⚡', isYou: true }
    ];
  }
};

// Shop
export const getShopItems = async (): Promise<ShopItemDto[]> => {
  const response = await apiClient.get<ShopItemDto[]>('/Shop/items');
  return response.data;
};

export const buyItem = async (request: BuyItemRequestDto): Promise<BuyItemResponseDto> => {
  const response = await apiClient.post<BuyItemResponseDto>('/Shop/buy', request);
  return response.data;
};

export const useItem = async (request: UseItemRequestDto): Promise<UseItemResponseDto> => {
  const response = await apiClient.post<UseItemResponseDto>('/Game/use-item', request);
  return response.data;
};

export const getUserInventory = async (): Promise<UserInventoryDto[]> => {
  const response = await apiClient.get<UserInventoryDto[]>('/Shop/inventory');
  return response.data;
};

// Payments
export const createPayOSLink = async (request: CreatePaymentRequestDto): Promise<CreatePayOSLinkResponseDto> => {
  const response = await apiClient.post<CreatePayOSLinkResponseDto>('/Payment/create-payos-link', request);
  return response.data;
};

export const getPaymentHistory = async (): Promise<PaymentHistoryDto[]> => {
  const response = await apiClient.get<PaymentHistoryDto[]>(`/Payment/history`);
  return response.data;
};

// --- Moderator NPCs Management ---
export interface NpcDto {
  id: number;
  name: string;
  role: string;
  npcEmoji: string;
  description: string;
  personality: string;
}

export interface NpcCreateDto {
  name: string;
  role: string;
  npcEmoji: string;
  description: string;
  personality: string;
}

export const getModeratorNpcs = async (): Promise<NpcDto[]> => {
  const response = await apiClient.get<NpcDto[]>('/Moderator/npcs');
  return response.data;
};

export const createModeratorNpc = async (dto: NpcCreateDto): Promise<NpcDto> => {
  const response = await apiClient.post<NpcDto>('/Moderator/npcs', dto);
  return response.data;
};

export const updateModeratorNpc = async (id: number, dto: NpcCreateDto): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(`/Moderator/npcs/${id}`, dto);
  return response.data;
};
