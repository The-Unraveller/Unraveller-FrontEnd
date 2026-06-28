import axios from 'axios';
// Dynamic API URL: 
// 1. Uses VITE_API_URL env variable if defined.
// 2. In local development (DEV mode), falls back to localhost:5251.
// 3. In production build, falls back to the deployed Render API.
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5251/api' : 'https://unraveller-backend.onrender.com/api');

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

export interface SubTaskDto {
  id: number;
  missionId: number;
  orderIndex: number;
  label: string;
  labelEn: string;
  hintPhrase: string;
  isOptional: boolean;
  xpBonus: number;
  isCompleted: boolean;
}

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
  writingObjective: string;
  domain: number;
  cefrLevel: number;
  minTurnsToComplete: number;
  minAverageScore: number;
  initialChoices: string[];
  syntaxPuzzles: string;
  subTasks: SubTaskDto[];
}

export interface DialogueRequestDto {
  missionId: number;
  message: string;
}

export interface DialogueResponseDto {
  npcResponse: string;
  writingFeedback: WritingFeedbackDto;
  newSuspicionLevel: number;
  isWin: boolean;
  isLose: boolean;
  turnCount: number;
  xpEarned: number;
  completionToken?: string;
  updatedEnergy?: number;
  updatedMaxEnergy?: number;
  updatedSubTasks?: SubTaskDto[];
}

export interface WritingScoreDto {
  grammar: number;
  vocabulary: number;
  tone: number;
  naturalness: number;
  clarity: number;
  structure: number;
}

export interface CorrectionDto {
  axis: number;
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingFeedbackDto {
  scores: WritingScoreDto;
  corrections: CorrectionDto[];
  rewriteSuggestion: string | null;
  summary: string;
}

export interface SkillMapDto {
  currentAverage: WritingScoreDto;
  historicalTrend: Record<string, number>;
}

export interface PortfolioEntryDto {
  missionId: number;
  missionTitle: string;
  domain: string;
  cefrLevel: string;
  completedAt: string;
  finalScores: WritingScoreDto;
  turnsCount: number;
  totalXp: number;
}

export interface WeeklyReportDto {
  weekStartDate: string;
  averageScore: number;
  scenariosCompleted: number;
  topErrorTypes: string[];
  newVocabularyCount: number;
  recommendedScenarios: number[];
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
  // Subscription fields
  subscriptionPlanName?: string;
  subscriptionEndDate?: string;
  subscriptionDaysRemaining?: number;
  subscriptionExpiringSoon?: boolean;
  missionProgresses?: {
    missionId: number;
    currentSuspicion: number;
    status: string; // 'InProgress' | 'Completed' | 'Failed'
    turnCount: number;
    xpEarned: number;
    completionToken?: string;
    completedAt?: string;
  }[];
}

export interface ShopItemDto {
  id: number;
  name: string;
  description: string;
  type: string; // 'InGameHint', 'BribeNpc', 'Cosmetic'
  priceXp: number;
  discountPriceXp: number;
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
  planId: number;
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
  planId: number;
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
  subTasks: SubTaskDto[];
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

export const checkMissionAccess = async (missionId: number): Promise<{ isAccessible: boolean; message: string }> => {
  const response = await apiClient.get<{ isAccessible: boolean; message: string }>(`/Game/check-access/${missionId}`);
  return response.data;
};

// Progress
export const getSkillMap = async (): Promise<SkillMapDto> => {
  const response = await apiClient.get<SkillMapDto>('/Progress/skill-map');
  return response.data;
};

export const getPortfolio = async (): Promise<PortfolioEntryDto[]> => {
  const response = await apiClient.get<PortfolioEntryDto[]>('/Progress/portfolio');
  return response.data;
};

export const getWeeklyReport = async (): Promise<WeeklyReportDto> => {
  const response = await apiClient.get<WeeklyReportDto>('/Progress/weekly-report');
  return response.data;
};

// Leaderboard
// Friends / Leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiClient.get<LeaderboardEntry[]>(`/Leaderboard`, { headers });
    return res.data;
  } catch (err) {
console.error("Failed to fetch leaderboard", err);
return [];
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

// --- Subscription Plans ---
export interface SubscriptionPlanDto {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlanDto[]> => {
  const response = await apiClient.get<SubscriptionPlanDto[]>(`/Payment/plans`);
  return response.data;
};

// Subscription status for the current user
export interface SubscriptionStatusDto {
  isActive: boolean;
  planName: string;
  daysRemaining: number;
  expiresAt: string | null;
  isExpiringSoon: boolean;
}

export const getUserSubscriptionStatus = async (): Promise<SubscriptionStatusDto> => {
  const response = await apiClient.get<SubscriptionStatusDto>(`/Payment/subscription-status`);
  return response.data;
};

export const cancelSubscription = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/Payment/cancel-subscription`);
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

// ── Admin Shop Items CRUD ──

export interface AdminShopItemDto {
  id: number;
  name: string;
  description: string;
  type: string;
  priceXp: number;
  discountPriceXp: number;
  emoji: string;
}

export const getAdminShopItems = async (): Promise<AdminShopItemDto[]> => {
  const response = await apiClient.get<AdminShopItemDto[]>('/Admin/shop-items');
  return response.data;
};

export const createAdminShopItem = async (dto: {
  name: string;
  description: string;
  type: string;
  priceXp: number;
  discountPriceXp: number;
  emoji: string;
}): Promise<AdminShopItemDto> => {
  const response = await apiClient.post<AdminShopItemDto>('/Admin/shop-items', dto);
  return response.data;
};

export const updateAdminShopItem = async (id: number, dto: {
  name?: string;
  description?: string;
  type?: string;
  priceXp?: number;
  discountPriceXp?: number;
  emoji?: string;
}): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(`/Admin/shop-items/${id}`, dto);
  return response.data;
};

export const deleteAdminShopItem = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/Admin/shop-items/${id}`);
  return response.data;
};

export interface CertificateDto {
  token: string;
  completedAt: string;
  xpEarned: number;
  turnCount: number;
  user: {
    username: string;
    englishLevel: string;
  };
  mission: {
    id: number;
    title: string;
    goal: string;
    grammarTarget: string;
    stage: string;
    difficulty: string;
    npcName: string;
  };
}

export const getCertificateByToken = async (token: string): Promise<CertificateDto> => {
  const response = await apiClient.get<CertificateDto>(`/Game/certificate/${token}`);
  return response.data;
};



