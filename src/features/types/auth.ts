export interface RegisterDto {
    name: string;
    phone: string;
    role?: 'ADMIN' | 'USER';
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    role: 'ADMIN' | 'USER';
    redirect: string;
    user: {
      id: string;
      name: string;
      phone: string;
      role: 'ADMIN' | 'USER';
    };
  }
  