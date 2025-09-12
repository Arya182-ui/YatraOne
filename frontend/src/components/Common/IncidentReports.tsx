import React, { useEffect, useState } from 'react';
import { adminSOSAPI } from '../../lib/api';
import type { IncidentReport } from '../../types';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const IncidentReports: React.FC = () => {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{ total: number; solved: number; pending: number; inProgress: number }>({ total: 0, solved: 0, pending: 0, inProgress: 0 });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await adminSOSAPI.getIncidentReports();
        setReports(data);

        const solved = data.filter((r: IncidentReport) => r.status === 'solved').length;
        const inProgress = data.filter((r: IncidentReport) => r.status === 'in-progress').length;
        const pending = data.filter((r: IncidentReport) => !r.status || r.status === 'pending').length;
        setAnalytics({ total: data.length, solved, pending, inProgress });

        // Show success toast if redirected after creation (201)
        if (window.location.hash.includes('incident-success')) {
          toast.success('Incident report created successfully!');
          window.location.hash = '';
        }
      } catch {
        toast.error('Failed to load incident reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await adminSOSAPI.updateIncidentReport(id, status);
      setReports(reports => reports.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await adminSOSAPI.deleteIncidentReport(id);
      setReports(reports => reports.filter(r => r.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-yellow-600"><AlertCircle /> Incident Reports</h1>
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</div>
          <div className="text-gray-500 text-sm">Total</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 shadow border text-center">
          <div className="text-2xl font-bold text-green-700">{analytics.solved}</div>
          <div className="text-green-700 text-sm">Solved</div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 shadow border text-center">
          <div className="text-2xl font-bold text-yellow-700">{analytics.inProgress}</div>
          <div className="text-yellow-700 text-sm">In Progress</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 shadow border text-center">
          <div className="text-2xl font-bold text-red-700">{analytics.pending}</div>
          <div className="text-red-700 text-sm">Pending</div>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-yellow-200 dark:border-yellow-700 p-6 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-500">No incident reports found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">User</th>
                <th className="py-2">Type</th>
                <th className="py-2">Description</th>
                <th className="py-2">Location</th>
                <th className="py-2">Time</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">{r.user_id}</td>
                  <td className="py-2">{r.type}</td>
                  <td className="py-2 max-w-xs truncate">{r.description}</td>
                  <td className="py-2">{r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : <span className="text-gray-400">N/A</span>}</td>
                  <td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'solved' ? 'bg-green-100 text-green-700' : r.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status ? r.status.replace('-', ' ') : 'pending'}
                    </span>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button onClick={() => handleStatus(r.id, 'in-progress')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs">In Progress</button>
                    <button onClick={() => handleStatus(r.id, 'solved')} className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs">Solved</button>
                    <button onClick={() => handleDelete(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IncidentReports;
