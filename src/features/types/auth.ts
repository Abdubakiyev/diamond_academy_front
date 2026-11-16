import type { Role } from './common';

export interface RegisterDto {
  name: string;
  phone: string;
  password: string;
  role?: Role;
}

export interface MeUser {
  id: string;
  name: string;
  phone: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  role: Role;
  redirect: string;
  user: MeUser;
}
