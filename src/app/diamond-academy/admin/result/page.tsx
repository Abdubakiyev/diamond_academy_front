'use client'

import { useEffect, useState } from 'react';
import api from '@/features/api/auth';
import { TestResult } from '@/features/types/test-result';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit, Trash2, Search, Filter, TrendingUp, User, Award, Calendar, RefreshCw, BarChart3, Users, Target } from 'lucide-react';

export default function AdminResults() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for Create / Update
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // --- Fetch ---
  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const { data } = await api.get<TestResult[]>('/test-result', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(data);
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to fetch results: ' + (err.response?.status || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // --- Create ---
  const handleAdd = async () => {
    if (!userId || !levelId) return alert('Please enter User ID and Level ID');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const { data } = await api.post<TestResult>(
        '/test-result',
        { userId, levelId, correctCount, wrongCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(prev => [...prev, data]);
      clearForm();
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to add result: ' + (err.response?.status || err.message));
    }
  };

  // --- Update ---
  const handleUpdate = async () => {
    if (!editingId) return;
    if (!userId || !levelId) return alert('Please enter User ID and Level ID');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const { data } = await api.patch<TestResult>(
        `/test-result/${editingId}`,
        { userId, levelId, correctCount, wrongCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(prev => prev.map(r => (r.id === editingId ? data : r)));
      clearForm();
      setEditingId(null);
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to update result: ' + (err.response?.status || err.message));
    }
  };

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      await api.delete(`/test-result/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to delete result: ' + (err.response?.status || err.message));
    }
  };

  // --- Edit ---
  const handleEdit = (r: TestResult) => {
    setEditingId(r.id);
    setUserId(r.userId);
    setLevelId(r.levelId);
    setCorrectCount(r.correctCount);
    setWrongCount(r.wrongCount);
  };

  const clearForm = () => {
    setEditingId(null);
    setUserId('');
    setLevelId('');
    setCorrectCount(0);
    setWrongCount(0);
  };

  // Calculate statistics
  const totalResults = results.length;
  const totalCorrect = results.reduce((sum, r) => sum + r.correctCount, 0);
  const totalWrong = results.reduce((sum, r) => sum + r.wrongCount, 0);
  const averageScore = results.length > 0
    ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
    : 0;

  // Get unique users
  const uniqueUsers = [...new Set(results.map(r => r.user?.name).filter(Boolean))];
  const totalUsers = uniqueUsers.length;

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' ||
      result.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.level?.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === '' ||
      new Date(result.createdAt).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesDate;
  });

  // Group by user for display
  const resultsByUser = filteredResults.reduce((acc: Record<string, TestResult[]>, result) => {
    const userName = result.user?.name ?? 'Unknown User';
    if (!acc[userName]) acc[userName] = [];
    acc[userName].push(result);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <AdminLayout />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminLayout />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Test Results Management</h1>
              <p className="text-gray-600">View and manage all test results</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button
                onClick={fetchResults}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Results</p>
                  <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Unique Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Correct Answers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCorrect}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                {editingId ? (
                  <>
                    <Edit className="w-5 h-5 mr-2 text-blue-600" />
                    Edit Result
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    Add New Result
                  </>
                )}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                  <input
                    type="text"
                    placeholder="Enter User ID"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level ID *</label>
                  <input
                    type="text"
                    placeholder="Enter Level ID"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={levelId}
                    onChange={e => setLevelId(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Count</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={correctCount}
                      onChange={e => setCorrectCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wrong Count</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wrongCount}
                      onChange={e => setWrongCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                {correctCount + wrongCount > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Score Preview</span>
                      <span>{Math.round((correctCount / (correctCount + wrongCount)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(correctCount / (correctCount + wrongCount)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    {editingId ? 'Update Result' : 'Add Result'}
                  </button>
                  {editingId && (
                    <button
                      onClick={clearForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
                    <p className="text-gray-600 text-sm">
                      {filteredResults.length} of {totalResults} results
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results by User */}
              <div className="divide-y divide-gray-100">
                {Object.entries(resultsByUser).length > 0 ? (
                  Object.entries(resultsByUser).map(([userName, userResults]) => (
                    <div key={userName} className="p-6 hover:bg-gray-50 transition-colors">
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{userName}</h3>
                            <p className="text-gray-600 text-sm">
                              {userResults.length} test{userResults.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Avg Score</p>
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(
                              userResults.reduce((sum, r) => sum + (r.correctCount / (r.correctCount + r.wrongCount) * 100), 0) / userResults.length
                            )}%
                          </p>
                        </div>
                      </div>

                      {/* User Results Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userResults.map(result => {
                              const total = result.correctCount + result.wrongCount;
                              const percentage = total > 0 ? Math.round((result.correctCount / total) * 100) : 0;
                              
                              return (
                                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mr-3">
                                        <Target className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <span className="font-medium text-gray-900">{result.level?.type ?? 'Unknown Level'}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-green-600 font-medium">{result.correctCount} correct</span>
                                        <span className="text-gray-700 font-bold">{percentage}%</span>
                                      </div>
                                      <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full transition-all duration-500 ${
                                            percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                            percentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                            'bg-gradient-to-r from-red-400 to-rose-500'
                                          }`}
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 text-sm">
                                    {new Date(result.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEdit(result)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(result.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      {searchTerm || dateFilter
                        ? 'No results match your search criteria'
                        : 'Add your first test result using the form on the left'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            {filteredResults.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Overall Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{totalCorrect}</div>
                    <p className="text-blue-200 text-sm">Total Correct</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{totalWrong}</div>
                    <p className="text-blue-200 text-sm">Total Wrong</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{averageScore}%</div>
                    <p className="text-blue-200 text-sm">Average Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{totalUsers}</div>
                    <p className="text-blue-200 text-sm">Active Users</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}