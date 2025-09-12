import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { User } from '../../types';
import { Loader2, Trash2, UserCheck, UserX, Ban, ShieldCheck } from 'lucide-react';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'officer', label: 'Officer' },
  { value: 'admin', label: 'Admin' },
  { value: 'driver', label: 'Driver' },
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Modal state
  const [modal, setModal] = useState<null | { id: string; newRole: User['role']; oldRole: User['role']; name: string }>(null);
  // Block/unblock loading
  const [blockLoading, setBlockLoading] = useState<string | null>(null);
  // Block/unblock user
  const handleBlock = async (id: string, blocked: boolean) => {
    setBlockLoading(id);
    try {
      await api.patch(`/users/${id}/block`, null, { params: { blocked: !blocked } });
      setUsers(users => users.map(u => u.id === id ? { ...u, blocked: !blocked } : u));
    } catch {
      alert('Failed to update block status.');
    } finally {
      setBlockLoading(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers(users => users.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  // Show modal instead of direct change
  const handleRole = (id: string, role: string) => {
    const user = users.find(u => u.id === id);
    if (!user || user.role === role) return;
    setModal({ id, newRole: role as User['role'], oldRole: user.role, name: user.firstName + ' ' + user.lastName });
  };

  // Confirm role change from modal
  const confirmRoleChange = async () => {
    if (!modal) return;
    setActionLoading(modal.id);
    try {
      await api.patch(`/users/${modal.id}/role`, null, { params: { role: modal.newRole } });
      setUsers(users => users.map(u => u.id === modal.id ? { ...u, role: modal.newRole } : u));
      setModal(null);
    } catch {
      alert('Failed to update user role.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyDriver = async (id: string, verified: boolean) => {
    setActionLoading(id);
    try {
      await api.patch(`/users/${id}/verify-driver`, null, { params: { verified } });
      setUsers(users => users.map(u => u.id === id ? { ...u, driverVerified: verified } : u));
    } catch {
      alert('Failed to update driver verification.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 relative">
      {/* Modern glassmorphism modal for role change */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-200 dark:border-gray-700 relative animate-fadeIn">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-to-r from-blue-400 to-green-400 text-white rounded-full p-3 shadow-lg mb-2">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">Change Role?</h2>
              <p className="text-gray-700 dark:text-gray-300 text-center">Are you sure you want to change <span className="font-semibold text-blue-600 dark:text-blue-300">{modal.name}</span>'s role from <span className="font-semibold text-yellow-600 dark:text-yellow-300">{modal.oldRole}</span> to <span className="font-semibold text-green-600 dark:text-green-300">{modal.newRole}</span>?</p>
              <div className="flex gap-4 mt-4">
                <button
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  onClick={confirmRoleChange}
                  disabled={actionLoading === modal.id}
                >
                  {actionLoading === modal.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Yes, Change'}
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold shadow hover:scale-105 transition-transform"
                  onClick={() => setModal(null)}
                  disabled={actionLoading === modal.id}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 tracking-tight drop-shadow-lg">User Management</h1>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-lg font-semibold"><Loader2 className="w-6 h-6 animate-spin" /> Loading users...</div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold">{error}</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full">
              <div className="overflow-x-auto w-full px-0 py-2 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-800">
                <table className="w-full min-w-[900px] rounded-2xl overflow-hidden text-base shadow-lg">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-blue-200/80 to-green-200/80 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-100">
                      <th className="px-6 py-4 text-lg font-extrabold text-left rounded-tl-2xl">Name</th>
                      <th className="px-6 py-4 text-lg font-extrabold text-left">Email</th>
                      <th className="px-6 py-4 text-lg font-extrabold text-left">Role</th>
                      <th className="px-6 py-4 text-lg font-extrabold text-left">Driver Verified</th>
                      <th className="px-6 py-4 text-lg font-extrabold text-left rounded-tr-2xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id} className={`transition-colors group ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900/60' : 'bg-blue-50/60 dark:bg-gray-800/60'} hover:bg-gradient-to-r hover:from-blue-100/80 hover:to-green-100/80 dark:hover:from-gray-800 dark:hover:to-gray-700 border-b border-blue-100 dark:border-gray-800 shadow-sm hover:shadow-lg duration-200`}>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap align-middle flex items-center gap-3">
                          <span className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold shadow-md bg-gradient-to-br from-blue-400 to-green-400 text-white select-none`}>
                            {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                          </span>
                          <span>{user.firstName} {user.lastName}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 align-middle">{user.email}</td>
                        <td className="px-6 py-4 align-middle">
                          <select
                            value={user.role}
                            onChange={e => handleRole(user.id, e.target.value)}
                            className="rounded-lg px-3 py-2 border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow focus:ring-2 focus:ring-blue-400 font-semibold text-gray-800 dark:text-gray-100"
                            disabled={actionLoading === user.id}
                          >
                            {roleOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {user.role === 'driver' ? (
                            <button
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold ${user.driverVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} shadow`}
                              onClick={() => handleVerifyDriver(user.id, !user.driverVerified)}
                              disabled={actionLoading === user.id}
                            >
                              {user.driverVerified ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              {user.driverVerified ? 'Verified' : 'Not Verified'}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle flex flex-col gap-2">
                          <button
                            className={`px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center gap-1 text-sm shadow ${actionLoading === user.id ? 'opacity-50' : ''}`}
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoading === user.id}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                          <button
                            className={`px-3 py-1 rounded-lg ${user.blocked ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} font-bold flex items-center gap-1 text-sm shadow ${blockLoading === user.id ? 'opacity-50' : ''}`}
                            onClick={() => handleBlock(user.id, !!user.blocked)}
                            disabled={blockLoading === user.id}
                          >
                            {blockLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.blocked ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            {user.blocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Mobile Card/List View */}
            <div className="block md:hidden px-1 space-y-6 mb-8 pb-8">
              {users.map(user => (
                <div key={user.id} className="rounded-2xl shadow-xl border border-blue-300 dark:border-gray-700 bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-5 flex flex-col gap-4 transition-shadow duration-200 hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-1 min-h-[2.5rem]">
                    <span className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold shadow-md bg-gradient-to-br from-blue-400 to-green-400 text-white select-none`}>
                      {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                    </span>
                    <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight flex items-center h-full leading-tight">{user.firstName} {user.lastName}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold shadow flex items-center w-fit">{user.email}</span>
                  <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 font-semibold flex-wrap mt-2">
                    <select
                      value={user.role}
                      onChange={e => handleRole(user.id, e.target.value)}
                      className="rounded-lg px-3 py-2 border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow focus:ring-2 focus:ring-blue-400 font-semibold text-gray-800 dark:text-gray-100"
                      disabled={actionLoading === user.id}
                    >
                      {roleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {user.role === 'driver' ? (
                      <button
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold ${user.driverVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} shadow`}
                        onClick={() => handleVerifyDriver(user.id, !user.driverVerified)}
                        disabled={actionLoading === user.id}
                      >
                        {user.driverVerified ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        {user.driverVerified ? 'Verified' : 'Not Verified'}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      className={`px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center gap-1 text-sm shadow transition-all duration-150 active:scale-95 ${actionLoading === user.id ? 'opacity-50' : ''}`}
                      onClick={() => handleDelete(user.id)}
                      disabled={actionLoading === user.id}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      className={`px-3 py-1 rounded-lg ${user.blocked ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} font-bold flex items-center gap-1 text-sm shadow transition-all duration-150 active:scale-95 ${blockLoading === user.id ? 'opacity-50' : ''}`}
                      onClick={() => handleBlock(user.id, !!user.blocked)}
                      disabled={blockLoading === user.id}
                    >
                      {blockLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.blocked ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      {user.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
