'use client'

import { useEffect, useState } from 'react';
import api from '@/features/api/auth';
import { User } from '@/features/types/user';
import { TestResult } from '@/features/types/test-result';
import AdminLayout from '@/components/AdminLayout';

export default function AdminHome() {
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  // --- User Form state ---
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>('USER');

  // --- TestResult Form state ---
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultUserId, setResultUserId] = useState('');
  const [resultLevelId, setResultLevelId] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // --- Fetch Users & Results ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return alert('No token found');

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<User[]>('/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err: any) {
        console.error(err.response ?? err);
        alert('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<TestResult[]>('/test-result', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(data);
      } catch (err: any) {
        console.error(err.response ?? err);
        alert('Failed to fetch test results');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchResults();
  }, []);

  // --- User CRUD ---
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      const { data } = await api.post<User>(
        '/user',
        { name: userName, phone: userPhone, role: userRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => [...prev, data]);
      clearUserForm();
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to add user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      const { data } = await api.patch<User>(
        `/user/${editingUserId}`,
        { name: userName, phone: userPhone, role: userRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => (u.id === editingUserId ? data : u)));
      clearUserForm();
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      await api.delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to delete user');
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserName(u.name);
    setUserPhone(u.phone);
    setUserRole(u.role);
  };

  const clearUserForm = () => {
    setEditingUserId(null);
    setUserName('');
    setUserPhone('');
    setUserRole('USER');
  };

  // --- TestResult CRUD ---
  const handleAddResult = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      const { data } = await api.post<TestResult>(
        '/test-result',
        { userId: resultUserId, levelId: resultLevelId, correctCount, wrongCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(prev => [...prev, data]);
      clearResultForm();
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to add result');
    }
  };

  const handleUpdateResult = async () => {
    if (!editingResultId) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      const { data } = await api.patch<TestResult>(
        `/test-result/${editingResultId}`,
        { userId: resultUserId, levelId: resultLevelId, correctCount, wrongCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(prev => prev.map(r => (r.id === editingResultId ? data : r)));
      clearResultForm();
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to update result');
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!confirm('Delete this result?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');

      await api.delete(`/test-result/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to delete result');
    }
  };

  const handleEditResult = (r: TestResult) => {
    setEditingResultId(r.id);
    setResultUserId(r.userId);
    setResultLevelId(r.levelId);
    setCorrectCount(r.correctCount);
    setWrongCount(r.wrongCount);
  };

  const clearResultForm = () => {
    setEditingResultId(null);
    setResultUserId('');
    setResultLevelId('');
    setCorrectCount(0);
    setWrongCount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <AdminLayout/>
      {/* Header */}
      <div className="mb-8 mt-5">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and test results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
              <div className="text-blue-600 font-bold text-xl">👥</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-green-600 font-bold text-xl">👑</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Test Results</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-purple-600 font-bold text-xl">📊</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {results.length > 0 
                  ? Math.round(results.reduce((acc, r) => acc + (r.correctCount / (r.correctCount + r.wrongCount) * 100), 0) / results.length)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
              <div className="text-amber-600 font-bold text-xl">⭐</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Users Management</h2>
            <p className="text-blue-100 text-sm">Create, read, update, delete users</p>
          </div>

          {/* Form */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUserId ? 'Edit User' : 'Add New User'}
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value as 'USER' | 'ADMIN')}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={editingUserId ? handleUpdateUser : handleAddUser}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                >
                  {editingUserId ? 'Update User' : 'Add User'}
                </button>
                {editingUserId && (
                  <button
                    onClick={clearUserForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">{u.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="text-gray-400 text-2xl">👤</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Add your first user using the form above</p>
            </div>
          )}
        </div>

        {/* Test Results Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Test Results Management</h2>
            <p className="text-purple-100 text-sm">Manage test results and scores</p>
          </div>

          {/* Form */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingResultId ? 'Edit Test Result' : 'Add New Test Result'}
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="User ID"
                  value={resultUserId}
                  onChange={e => setResultUserId(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Level ID"
                  value={resultLevelId}
                  onChange={e => setResultLevelId(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Correct Count"
                    value={correctCount}
                    onChange={e => setCorrectCount(Number(e.target.value))}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Wrong Count"
                    value={wrongCount}
                    onChange={e => setWrongCount(Number(e.target.value))}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={editingResultId ? handleUpdateResult : handleAddResult}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  {editingResultId ? 'Update Result' : 'Add Result'}
                </button>
                {editingResultId && (
                  <button
                    onClick={clearResultForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map(r => {
                  const total = r.correctCount + r.wrongCount;
                  const percentage = total > 0 ? Math.round((r.correctCount / total) * 100) : 0;
                  
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium">
                              {r.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{r.user?.name ?? 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{r.level?.type ?? 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-green-600">{r.correctCount} correct</span>
                              <span className="text-gray-600">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditResult(r)}
                            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResult(r.id)}
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="text-gray-400 text-2xl">📊</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No test results found</h3>
              <p className="text-gray-600">Add your first test result using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}