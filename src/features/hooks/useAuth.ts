import { useState } from 'react';
import { RegisterDto, AuthResponse } from '../types/auth';
import { register as registerApi } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerApi(data);
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
      throw err;
    }
  };

  return { user, loading, error, register };
};
