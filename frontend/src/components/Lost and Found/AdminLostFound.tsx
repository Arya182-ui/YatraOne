import React, { useEffect, useState } from 'react';
import { lostFoundAPI } from '../../lib/api';
import { LostFoundItem } from '../../types';
import { Loader2, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

const AdminLostFound: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await lostFoundAPI.getItems();
        setItems(data);
      } catch {
        setError('Failed to fetch lost & found items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleMarkFound = async (id: string) => {
    setActionLoading(id);
    try {
      await lostFoundAPI.updateItemStatus(id, 'returned');
      setItems(items => items.map(item => item.id === id ? { ...item, status: 'returned' } : item));
    } catch {
      alert('Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setActionLoading(id);
    try {
      await lostFoundAPI.deleteItem(id);
      setItems(items => items.filter(item => item.id !== id));
    } catch {
      alert('Failed to delete item.');
    } finally {
      setActionLoading(null);
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 relative">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 tracking-tight drop-shadow-lg">Lost &amp; Found Admin</h1>
          <div className="mb-8 flex flex-col xs:flex-row gap-2 xs:gap-3 items-center xs:justify-end w-full">
            <div className="flex flex-col xs:flex-row w-full xs:w-auto items-center gap-2 xs:gap-3">
              <label className="font-bold text-gray-700 dark:text-gray-300 text-base xs:text-sm">Filter:</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="w-full xs:w-auto px-4 py-2 rounded-xl border border-blue-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base xs:text-sm shadow"
              >
                <option value="all">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-lg font-semibold"><Loader2 className="w-6 h-6 animate-spin" /> Loading items...</div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500 text-lg font-semibold"><AlertTriangle className="w-5 h-5" /> {error}</div>
          ) : (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              {items.filter(item => filterType === 'all' ? true : item.type === filterType).length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 text-lg font-semibold backdrop-blur-md">No items found.</div>
              ) : (
                items.filter(item => filterType === 'all' ? true : item.type === filterType).map(item => (
                  <div key={item.id} className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-blue-200 dark:border-gray-700 p-6 sm:p-8 flex flex-col gap-4 mx-1 xs:mx-0 backdrop-blur-md hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow ${item.type === 'lost' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type.toUpperCase()}</span>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold shadow ${item.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.status}</span>
                      </div>
                      <span className="text-gray-400 text-xs font-mono">{item.dateReported ? new Date(item.dateReported).toLocaleString() : ''}</span>
                    </div>
                    <div className="font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white mb-1 tracking-tight">{item.itemName}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-base mb-2 leading-relaxed font-medium">{item.description}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      {item.category && <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded shadow font-semibold">{item.category}</span>}
                      {item.color && <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded shadow font-semibold">{item.color}</span>}
                      {item.brand && <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded shadow font-semibold">{item.brand}</span>}
                      {item.location && <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded shadow font-semibold">{item.location}</span>}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-3 border-t border-dashed border-blue-200 dark:border-gray-700">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        disabled={item.status === 'returned' || item.status === 'closed' || actionLoading === item.id}
                        onClick={() => handleMarkFound(item.id)}
                      >
                        <CheckCircle2 className="w-5 h-5" /> Mark as Found
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        disabled={actionLoading === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-5 h-5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
};

export default AdminLostFound;
