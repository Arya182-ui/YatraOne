import React, { useState, useEffect } from 'react';
import { AlertCircle,Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminSOSAPI, busLocationAPI } from '../../lib/api';
import type { SOSReport, IncidentReport, Bus as BusType } from '../../types';
import { motion } from 'framer-motion';
import {
  Users,
  Bus,
  MessageSquare,
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../lib/api';
import api from '../../lib/api';
import { timetableAPI } from '../../lib/api';
import { AdminAnalytics } from '../../types';
import { Link } from 'react-router-dom';
import BusMap from '../BusTracking/BusMap';
import NotificationBell from '../notification/NotificationBell';


const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<{pending: number, resolved: number, percent_resolved: number, total: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState<BusType[]>([]);

  // SOS/Incident state
  const [sosReports, setSOSReports] = useState<SOSReport[]>([]);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [sosLoading, setSOSLoading] = useState(false);
  const [incidentLoading, setIncidentLoading] = useState(false);

  // Timetable upload state
  const [ttFile, setTTFile] = useState<File | null>(null);
  const [ttUploading, setTTUploading] = useState(false);
  const [ttUrl, setTTUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsData, feedbackStatsData] = await Promise.all([
          adminAPI.getAnalytics(),
          api.get('/feedback/stats').then(res => res.data)
        ]);
        setAnalytics(analyticsData);
        setFeedbackStats(feedbackStatsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const busData = await busLocationAPI.getAllLocations();
        setBuses(busData);
      } catch (error) {
        console.error('Error fetching bus locations:', error);
      }
    };
    fetchBusLocations();
  }, []);

  // Fetch SOS/Incident reports
  useEffect(() => {
    const fetchReports = async () => {
      setSOSLoading(true);
      setIncidentLoading(true);
      try {
        const [sos, incidents] = await Promise.all([
          adminSOSAPI.getSOSReports(),
          adminSOSAPI.getIncidentReports(),
        ]);
        setSOSReports(sos);
        setIncidentReports(incidents);
      } catch (e) {
        toast.error('Failed to load reports');
      } finally {
        setSOSLoading(false);
        setIncidentLoading(false);
      }
    };
    fetchReports();
  }, []);

  // On mount, set timetable URL
  useEffect(() => {
    setTTUrl(timetableAPI.getTimetableUrl());
  }, []);

  const handleSOSStatus = async (id: string, status: string) => {
    try {
      await adminSOSAPI.updateSOSReport(id, status);
      setSOSReports(reports => reports.map(r => r.id === id ? { ...r, status } : r));
      toast.success('SOS status updated');
    } catch {
      toast.error('Failed to update SOS');
    }
  };
  const handleSOSDelete = async (id: string) => {
    try {
      await adminSOSAPI.deleteSOSReport(id);
      setSOSReports(reports => reports.filter(r => r.id !== id));
      toast.success('SOS deleted');
    } catch {
      toast.error('Failed to delete SOS');
    }
  };
  const handleIncidentStatus = async (id: string, status: string) => {
    try {
      await adminSOSAPI.updateIncidentReport(id, status);
      setIncidentReports(reports => reports.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Incident status updated');
    } catch {
      toast.error('Failed to update incident');
    }
  };
  const handleIncidentDelete = async (id: string) => {
    try {
      await adminSOSAPI.deleteIncidentReport(id);
      setIncidentReports(reports => reports.filter(r => r.id !== id));
      toast.success('Incident deleted');
    } catch {
      toast.error('Failed to delete incident');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View and manage user accounts',
      path: '/admin/users',
      color: 'blue',
      count: analytics.totalUsers,
    },
    {
      icon: MessageSquare,
      title: 'Review Feedback',
      description: 'Handle user feedback and complaints',
      path: '/admin/feedback',
      color: 'green',
      count: feedbackStats ? feedbackStats.pending : 0,
    },
    {
      icon: AlertTriangle,
      title: 'SOS Reports',
      description: 'View and manage SOS reports',
      path: '/admin/sos-reports',
      color: 'red',
      count: sosReports.length,
    },
    {
      icon: AlertCircle,
      title: 'Incident Reports',
      description: 'View and manage Incident reports',
      path: '/admin/incident-reports',
      color: 'yellow',
      count: incidentReports.length,
    },
    {
      icon: Package,
      title: 'Lost & Found',
      description: 'Manage lost and found items',
      path: '/admin/lost-found',
      color: 'orange',
      count: analytics.totalLostFound - analytics.matchedItems,
    },
    {
      icon: Bus,
      title: 'Bus Management',
      description: 'Add, edit, assign, and manage buses',
      path: '/admin/buses',
      color: 'teal',
      count: analytics.totalBuses,
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View detailed reports',
      path: '/admin/analytics',
      color: 'purple',
      count: '24h',
    },
    {
      icon: UserIcon,
      title: 'Profile',
      description: 'Manage your account',
      path: '/profile',
      color: 'indigo',
      count: '',
    },
  ];

  // ...existing code...

  const handleTTUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttFile) return toast.error('Select a PDF file');
    setTTUploading(true);
    try {
      // Always use 'bus_timetable.pdf' as filename (handled in timetableAPI)
      await timetableAPI.uploadTimetable(ttFile);
      setTTUrl(timetableAPI.getTimetableUrl());
      toast.success('Timetable uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setTTUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard 🚌
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage the Smart Bus Platform operations.
            </p>
          </div>
          <NotificationBell userType="admin" userId={user?.id || ''} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
                  onClick={() => window.location.assign(action.path)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30`}>
                      <Icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {typeof action.count === 'string' ? action.count : action.count.toLocaleString()}
                      </p>
                      {typeof action.count === 'number' && action.count > 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {action.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Bus Map for Admin - Larger Size */}
        <div className="my-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Live Bus Locations</h2>
          <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow border border-blue-200 dark:border-blue-700 p-4 flex items-center justify-center">
            <BusMap buses={buses} />
          </div>
        </div>

        {/* Timetable Upload Section - moved below map */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-blue-200 dark:border-blue-700 p-6 mb-10 mt-8">
          <h2 className="text-xl font-bold mb-3 text-blue-700 dark:text-blue-300">Upload Bus Timetable PDF</h2>
          <form onSubmit={handleTTUpload} className="flex flex-col gap-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setTTFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={ttUploading}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-500 transition-colors disabled:opacity-60"
              disabled={ttUploading || !ttFile}
            >
              {ttUploading ? 'Uploading...' : 'Upload Timetable'}
            </button>
          </form>
          {ttUrl && (
            <div className="mt-4 flex flex-col gap-2">
              <a href={ttUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">View Timetable PDF</a>
              <a href={ttUrl} download className="text-emerald-600 underline font-medium">Download Timetable PDF</a>
            </div>
          )}
        </div>
      </div>

      {/* SOS Reports Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-600"><AlertTriangle /> SOS Reports</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-red-200 dark:border-red-700 p-6 overflow-x-auto">
          {sosLoading ? (
            <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>
          ) : sosReports.length === 0 ? (
            <div className="text-gray-500">No SOS reports found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2">User</th>
                  <th className="py-2">Message</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sosReports.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2">{r.user_id}</td>
                    <td className="py-2 max-w-xs truncate">{r.message || <span className="italic text-gray-400">(none)</span>}</td>
                    <td className="py-2">{r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : <span className="text-gray-400">N/A</span>}</td>
                    <td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'solved' ? 'bg-green-100 text-green-700' : r.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status ? r.status.replace('-', ' ') : 'pending'}
                      </span>
                    </td>
                    <td className="py-2 flex gap-2">
                      <button onClick={() => handleSOSStatus(r.id, 'in-progress')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs">In Progress</button>
                      <button onClick={() => handleSOSStatus(r.id, 'solved')} className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs">Solved</button>
                      <button onClick={() => handleSOSDelete(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Incident Reports Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-600"><AlertCircle /> Incident Reports</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-yellow-200 dark:border-yellow-700 p-6 overflow-x-auto">
          {incidentLoading ? (
            <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>
          ) : incidentReports.length === 0 ? (
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
                {incidentReports.map(r => (
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
                      <button onClick={() => handleIncidentStatus(r.id, 'in-progress')} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs">In Progress</button>
                      <button onClick={() => handleIncidentStatus(r.id, 'solved')} className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs">Solved</button>
                      <button onClick={() => handleIncidentDelete(r.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;