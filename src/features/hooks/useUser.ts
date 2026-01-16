import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { getUsers, getProfile, updateUser, toggleUserActive } from '../api/user';

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setUsers(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProfile();
      setCurrentUser(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (id: string, data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateUser(id, data);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      if (currentUser?.id === id) setCurrentUser(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await toggleUserActive(id);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      if (currentUser?.id === id) setCurrentUser(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { users, currentUser, loading, error, fetchUsers, fetchProfile, editUser, toggleActive };
};
