
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'electronic' | 'ticket' | 'other';
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
}

export interface UserProfile {
  id: string;
  name: string;
  points: number;
  totalEarned: number;
  role: UserRole;
  avatar: string;
}

export interface Redemption {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  pointsSpent: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'cancelled';
  qrCodeData: string;
}

export interface RankTitle {
  name: string;
  threshold: number;
  color: string;
  icon: string;
}

export interface LearningMission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'quiz' | 'reading' | 'practice';
}
