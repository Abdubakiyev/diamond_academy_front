import { useState } from 'react';
import { Test } from '../types/test';
import { getTestsByLevel, getTest, createTest, updateTest, deleteTest } from '../api/test';

export const useTest = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByLevel = async (levelId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTestsByLevel(levelId);
      setTests(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tests');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOne = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getTest(id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTest = async (data: Partial<Test>) => {
    setLoading(true);
    setError(null);
    try {
      const newTest = await createTest(data);
      setTests(prev => [...prev, newTest]);
      return newTest;
    } catch (err: any) {
      setError(err.message || 'Failed to create test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editTest = async (id: string, data: Partial<Test>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTest(id, data);
      setTests(prev => prev.map(t => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTest = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const deleted = await deleteTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
      return deleted;
    } catch (err: any) {
      setError(err.message || 'Failed to delete test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { tests, loading, error, fetchByLevel, fetchOne, addTest, editTest, removeTest };
};
