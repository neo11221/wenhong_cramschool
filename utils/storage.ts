
import { UserProfile, Redemption, UserRole } from '../types';
import { STORAGE_KEYS } from '../constants';

const INITIAL_STUDENTS: UserProfile[] = [
  {
    id: 'user_zhou',
    name: '周同學',
    points: 1200,
    totalEarned: 2500,
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhou'
  },
  {
    id: 'user_hu',
    name: '胡同學',
    points: 800,
    totalEarned: 1800,
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hu'
  },
  {
    id: 'user_lin',
    name: '林同學',
    points: 2100,
    totalEarned: 4200,
    role: UserRole.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lin'
  }
];

// 管理員帳號
const ADMIN_USER: UserProfile = {
  id: 'user_admin',
  name: '導師管理員',
  points: 0,
  totalEarned: 0,
  role: UserRole.ADMIN,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
};

export const getStudents = (): UserProfile[] => {
  const stored = localStorage.getItem('workshop_students');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('workshop_students', JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
};

export const saveStudents = (students: UserProfile[]) => {
  localStorage.setItem('workshop_students', JSON.stringify(students));
};

export const getUser = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) return JSON.parse(stored);
  // 預設以周同學身份登入
  const defaultUser = INITIAL_STUDENTS[0];
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
  return defaultUser;
};

export const saveUser = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  // 同步回學生列表
  if (user.role === UserRole.STUDENT) {
    const students = getStudents();
    const updated = students.map(s => s.id === user.id ? user : s);
    saveStudents(updated);
  }
};

export const getRedemptions = (): Redemption[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const addRedemption = (redemption: Redemption) => {
  const current = getRedemptions();
  const updated = [redemption, ...current];
  localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(updated));
};

export const updateRedemptionStatus = (id: string, status: 'completed' | 'cancelled') => {
  const current = getRedemptions();
  const updated = current.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(updated));
};
