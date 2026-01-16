import { useState } from 'react';

import { submitTestResult, getTestResults, getTestResult } from '../api/test-result';
import { CreateTestResultDto, TestResult } from '../types/test-result';

export const useTestResult = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CreateTestResultDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await submitTestResult(data);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to submit test');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTestResults();
      setResults(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOne = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTestResult(id);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch result');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, submit, fetchAll, fetchOne };
};
