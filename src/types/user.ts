export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}

export interface HistoryEntry {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  progress: number;
  watchedAt: string;
}

export interface FavoriteEntry {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  addedAt: string;
}

export interface PlaylistEntry {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: number;
  position: number;
}
