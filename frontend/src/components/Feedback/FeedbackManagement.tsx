import React, { useEffect, useState } from 'react';
import { feedbackAPI } from '../../lib/api';
import { Feedback } from '../../types';
import { Loader2, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await feedbackAPI.getFeedback();
        setFeedbacks(data);
      } catch (err: any) {
        setError('Failed to fetch feedbacks.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Action handlers
  const handleResolve = async (id: string) => {
    try {
      await feedbackAPI.updateFeedbackStatus(id, 'resolved');
      setFeedbacks(fbs => fbs.map(fb => fb.id === id ? { ...fb, status: 'resolved' } : fb));
    } catch {
      setError('Failed to resolve feedback.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await feedbackAPI.deleteFeedback(id);
      setFeedbacks(fbs => fbs.filter(fb => fb.id !== id));
    } catch {
      setError('Failed to delete feedback.');
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 relative">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 tracking-tight drop-shadow-lg">Feedback Management</h1>
        {loading && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-lg font-semibold"><Loader2 className="w-6 h-6 animate-spin" /> Loading feedbacks...</div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-500 mb-4 text-lg font-semibold">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <table className="min-w-full rounded-xl">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                  <th className="px-6 py-3 text-lg font-bold text-left">Type</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">Subject</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">Message</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">User</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">Status</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">Created</th>
                  <th className="px-6 py-3 text-lg font-bold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 text-lg font-semibold">No feedbacks found.</td>
                  </tr>
                ) : (
                  feedbacks.map(fb => (
                    <tr key={fb.id} className="border-t border-blue-100 dark:border-gray-700 hover:bg-blue-50/40 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-6 py-3 capitalize font-semibold text-gray-900 dark:text-white">{fb.type}</td>
                      <td className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold">{fb.subject}</td>
                      <td className="px-6 py-3 max-w-xs truncate text-gray-600 dark:text-gray-300" title={fb.message}>{fb.message}</td>
                      <td className="px-6 py-3 text-blue-700 dark:text-blue-300 font-semibold">{fb.userId}</td>
                      <td className="px-6 py-3 capitalize">
                        {fb.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs font-semibold"><CheckCircle className="w-4 h-4" /> Resolved</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-xs font-semibold"><AlertTriangle className="w-4 h-4" /> {fb.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}</td>
                      <td className="px-6 py-3 flex gap-3">
                        {fb.status !== 'resolved' && (
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-lg font-bold shadow hover:scale-105 transition-transform"
                            title="Mark as Resolved"
                            onClick={() => handleResolve(fb.id)}
                          >
                            <CheckCircle className="w-4 h-4" /> Resolve
                          </button>
                        )}
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg font-bold shadow hover:scale-105 transition-transform"
                          title="Delete Feedback"
                          onClick={() => handleDelete(fb.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
};

export default FeedbackManagement;
