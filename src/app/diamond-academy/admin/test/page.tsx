'use client'

import { useEffect, useState } from 'react';
import api from '@/features/api/auth';
import { Test } from '@/features/types/test';
import AdminLayout from '@/components/AdminLayout';
import { Level, LevelType } from '@/features/types/level';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle, XCircle, Book, RefreshCw } from 'lucide-react';

type OptionLetter = 'A' | 'B' | 'C' | 'D';

export default function AdminTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelId, setLevelId] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrect, setNewCorrect] = useState<OptionLetter>('A');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');

  // --- Fetch tests & levels ---
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('No token found');
      setLoading(false);
      return;
    }

    try {
      const [testsRes, levelsRes] = await Promise.all([
        api.get<Test[]>('/test', { headers: { Authorization: `Bearer ${token}` } }),
        api.get<Level[]>('/level', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setTests(testsRes.data);
      setLevels(levelsRes.data);
    } catch (err: any) {
      console.error(err.response ?? err);
      alert('Failed to fetch data: ' + (err.response?.status || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Add Test ---
  const handleAddTest = async () => {
    if (!levelId) return alert('Please select a Level!');
    if (!newQuestion || !newOptionA || !newOptionB || !newOptionC)
      return alert('Please fill all required fields!');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const { data } = await api.post<Test>(
        '/test',
        {
          question: newQuestion,
          optionA: newOptionA,
          optionB: newOptionB,
          optionC: newOptionC,
          optionD: newOptionD || null,
          levelId,
          correct: newCorrect,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTests(prev => [...prev, data]);
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data ?? err);
      alert(err.response?.data?.message || 'Failed to add test');
    }
  };

  // --- Delete Test ---
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      await api.delete(`/test/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err.response?.data ?? err);
      alert(err.response?.data?.message || 'Failed to delete test');
    }
  };

  // --- Edit Test ---
  const handleEdit = (test: Test) => {
    setEditingId(test.id);
    setNewQuestion(test.question);
    setNewOptionA(test.optionA);
    setNewOptionB(test.optionB);
    setNewOptionC(test.optionC);
    setNewOptionD(test.optionD || '');
    setLevelId(test.levelId);
    setNewCorrect(test.correct as OptionLetter);
  };

  // --- Update Test ---
  const handleUpdate = async () => {
    if (!editingId) return;
    if (!levelId) return alert('Please select a Level!');
    if (!newQuestion || !newOptionA || !newOptionB || !newOptionC)
      return alert('Please fill all required fields!');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const { data } = await api.patch<Test>(
        `/test/${editingId}`,
        {
          question: newQuestion,
          optionA: newOptionA,
          optionB: newOptionB,
          optionC: newOptionC,
          optionD: newOptionD || null,
          levelId,
          correct: newCorrect,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTests(prev => prev.map(t => (t.id === editingId ? data : t)));
      resetForm();
    } catch (err: any) {
      console.error(err.response?.data ?? err);
      alert(err.response?.data?.message || 'Failed to update test');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewQuestion('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setLevelId('');
    setNewCorrect('A');
  };

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.optionA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.optionB.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.optionC.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevelFilter || test.levelId === selectedLevelFilter;
    return matchesSearch && matchesLevel;
  });

  // Statistics
  const totalTests = tests.length;
  const testsByLevel = levels.map(level => ({
    level,
    count: tests.filter(t => t.levelId === level.id).length
  }));
  const testsWithOptionD = tests.filter(t => t.optionD).length;

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
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading tests...</p>
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Test Management</h1>
              <p className="text-gray-600">Create, edit, and manage test questions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Book className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Levels</p>
                  <p className="text-2xl font-bold text-gray-900">{levels.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">With Option D</p>
                  <p className="text-2xl font-bold text-gray-900">{testsWithOptionD}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
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
                    Edit Test
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    Add New Test
                  </>
                )}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                  <select
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={levelId}
                    onChange={e => setLevelId(e.target.value)}
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                  <textarea
                    placeholder="Enter the question"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option A *</label>
                    <input
                      type="text"
                      placeholder="Option A"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOptionA}
                      onChange={e => setNewOptionA(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option B *</label>
                    <input
                      type="text"
                      placeholder="Option B"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOptionB}
                      onChange={e => setNewOptionB(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option C *</label>
                    <input
                      type="text"
                      placeholder="Option C"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOptionC}
                      onChange={e => setNewOptionC(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option D (optional)</label>
                    <input
                      type="text"
                      placeholder="Option D"
                      className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newOptionD}
                      onChange={e => setNewOptionD(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setNewCorrect(option)}
                        className={`px-4 py-2 text-gray-900 rounded-lg border transition-all ${
                          newCorrect === option
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={editingId ? handleUpdate : handleAddTest}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                  >
                    {editingId ? 'Update Test' : 'Add Test'}
                  </button>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">All Tests</h2>
                    <p className="text-gray-600 text-sm">
                      {filteredTests.length} of {totalTests} tests
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={selectedLevelFilter}
                        onChange={e => setSelectedLevelFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Levels</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTests.map(test => {
                      const level = levels.find(l => l.id === test.levelId);
                      return (
                        <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 mb-2">{test.question}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="w-6 font-medium">A:</span>
                                  <span className="ml-2">{test.optionA}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-6 font-medium">B:</span>
                                  <span className="ml-2">{test.optionB}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-6 font-medium">C:</span>
                                  <span className="ml-2">{test.optionC}</span>
                                </div>
                                {test.optionD && (
                                  <div className="flex items-center">
                                    <span className="w-6 font-medium">D:</span>
                                    <span className="ml-2">{test.optionD}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {level ? (
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                                {level.type}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              test.correct === 'A' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                              test.correct === 'B' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                              test.correct === 'C' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                              'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800'
                            }`}>
                              {test.correct}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(test)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(test.id)}
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

              {/* Empty State */}
              {filteredTests.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Book className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedLevelFilter
                      ? 'No tests match your search criteria'
                      : 'Add your first test using the form on the left'}
                  </p>
                </div>
              )}
            </div>

            {/* Level Distribution */}
            {levels.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tests by Level</h3>
                <div className="space-y-4">
                  {testsByLevel.map(({ level, count }) => (
                    <div key={level.id} className="flex items-center">
                      <div className="w-32">
                        <span className="text-gray-700 font-medium">{level.type}</span>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{count} tests</span>
                          <span className="text-gray-600">
                            {totalTests > 0 ? Math.round((count / totalTests) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${totalTests > 0 ? (count / totalTests) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}