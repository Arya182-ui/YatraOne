import React, { useEffect, useState } from 'react';
import { busAPI, userAPI, routeAPI } from '../../lib/api';
import { UtilizationData } from '../../types';

type BusWithStatus = UtilizationData & { status: string };
import { Loader2, Bus, Trash2, Edit2, Plus } from 'lucide-react';

const BusManagement: React.FC = () => {
  const [buses, setBuses] = useState<BusWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBuses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await busAPI.getBuses();
      // Ensure every bus has both busId and id set
      setBuses(data.map((bus: any) => ({ ...bus, busId: bus.busId || bus.id, id: bus.id || bus.busId })));
    } catch {
      setError('Failed to fetch buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    userAPI.getDrivers().then(setDrivers);
    routeAPI.getRoutes().then(setRoutes);
  }, []);


  const handleDelete = async (busId: string) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await busAPI.deleteBus(busId);
      fetchBuses();
    } catch {
      alert('Failed to delete bus.');
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', busNumber: '', utilization: 0, totalTrips: 0, status: 'active' });
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (bus: any) => {
    setShowEditModal(true);
    setEditForm({
      id: bus.busId,
      busNumber: bus.busNumber,
      utilization: bus.utilization,
      totalTrips: bus.totalTrips,
      status: bus.status || 'active',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await busAPI.updateBus(editForm.id, {
        busNumber: editForm.busNumber,
        utilization: editForm.utilization,
        totalTrips: editForm.totalTrips,
        status: editForm.status,
      });
      setShowEditModal(false);
      fetchBuses();
    } catch {
      alert('Failed to update bus.');
    } finally {
      setEditLoading(false);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ busNumber: '', utilization: 0, totalTrips: 0, status: 'active' });
  const [addLoading, setAddLoading] = useState(false);

  const handleAdd = () => {
    setShowAddModal(true);
    setAddForm({ busNumber: '', utilization: 0, totalTrips: 0, status: 'active' });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await busAPI.addBus(addForm);
      setShowAddModal(false);
      fetchBuses();
    } catch {
      alert('Failed to add bus.');
    } finally {
      setAddLoading(false);
    }
  };
  const handleStatus = async (busId: string, status: string) => {
    try {
      await busAPI.changeStatus(busId, status);
      fetchBuses();
    } catch {
      alert('Failed to change status.');
    }
  };

  // Assign Driver Modal State
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [assignDriverBusId, setAssignDriverBusId] = useState<string | null>(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignDriverLoading, setAssignDriverLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Assign Route Modal State
  const [showAssignRouteModal, setShowAssignRouteModal] = useState(false);
  const [assignRouteBusId, setAssignRouteBusId] = useState<string | null>(null);
  const [assignRouteIds, setAssignRouteIds] = useState<string[]>([]);
  const [assignRouteLoading, setAssignRouteLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);

  // Add Route Modal State
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [addRouteForm, setAddRouteForm] = useState({
    route_name: '',
    start_latitude: '',
    start_longitude: '',
    end_latitude: '',
    end_longitude: '',
    stops: '',
    speed_limit: '',
  });
  const [addRouteLoading, setAddRouteLoading] = useState(false);

  const openAssignDriverModal = (bus: any) => {
    setAssignDriverBusId(bus.id || bus.busId);
    setShowAssignDriverModal(true);
    setAssignDriverId('');
  };

  const openAssignRouteModal = (bus: any) => {
    setAssignRouteBusId(bus.id || bus.busId);
    setShowAssignRouteModal(true);
    setAssignRouteIds(bus.routeIds || []);
  };

  const handleAddRoute = () => {
    setShowAddRouteModal(true);
    setAddRouteForm({
      route_name: '',
      start_latitude: '',
      start_longitude: '',
      end_latitude: '',
      end_longitude: '',
      stops: '',
      speed_limit: '',
    });
  };

  const handleAddRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddRouteLoading(true);
    try {
      // Prepare payload for backend
      const payload = {
        route_name: addRouteForm.route_name,
        start_latitude: parseFloat(addRouteForm.start_latitude),
        start_longitude: parseFloat(addRouteForm.start_longitude),
        end_latitude: parseFloat(addRouteForm.end_latitude),
        end_longitude: parseFloat(addRouteForm.end_longitude),
        stops: addRouteForm.stops
          ? addRouteForm.stops.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        speed_limit: parseFloat(addRouteForm.speed_limit),
      };
      await routeAPI.addRoute(payload);
      setShowAddRouteModal(false);
      setAddRouteForm({
        route_name: '',
        start_latitude: '',
        start_longitude: '',
        end_latitude: '',
        end_longitude: '',
        stops: '',
        speed_limit: '',
      });
      // Refresh routes list
      const updatedRoutes = await routeAPI.getRoutes();
      setRoutes(updatedRoutes);
    } catch {
      alert('Failed to add route.');
    } finally {
      setAddRouteLoading(false);
    }
  };

  const handleAssignDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDriverBusId || !assignDriverId) return;
    setAssignDriverLoading(true);
    try {
      await busAPI.assignDriver(assignDriverBusId, assignDriverId);
      setShowAssignDriverModal(false);
      fetchBuses();
    } catch {
      alert('Failed to assign driver.');
    } finally {
      setAssignDriverLoading(false);
    }
  };

  // Handler for assign route
  const handleAssignRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRouteBusId || assignRouteIds.length === 0) return;
    setAssignRouteLoading(true);
    try {
      await busAPI.assignRoutes(assignRouteBusId, assignRouteIds);
      setShowAssignRouteModal(false);
      setAssignRouteIds([]);
      fetchBuses();
    } catch {
      alert('Failed to assign routes.');
    } finally {
      setAssignRouteLoading(false);
    }
  };

  const modals = <>
    {/* Edit Bus Modal */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-100 dark:border-gray-800 relative animate-fadeIn">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center tracking-tight">Edit Bus</h2>
          <div className="space-y-4">
            <input type="text" required value={editForm.busNumber} onChange={e => setEditForm(f => ({ ...f, busNumber: e.target.value }))} placeholder="Bus Number" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" min={0} max={100} step="any" value={editForm.utilization === 0 ? '' : editForm.utilization} onChange={e => { const val = e.target.value; setEditForm(f => ({ ...f, utilization: val === '' ? 0 : parseFloat(val) })); }} placeholder="Utilization (%)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" min={0} value={editForm.totalTrips === 0 ? '' : editForm.totalTrips} onChange={e => { const val = e.target.value; setEditForm(f => ({ ...f, totalTrips: val === '' ? 0 : Number(val) })); }} placeholder="Total Trips" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 transition-colors" disabled={editLoading}>{editLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Update'}</button>
            <button type="button" className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
          </div>
        </form>
      </div>
    )}

    {/* Assign Driver Modal */}
    {showAssignDriverModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <form onSubmit={handleAssignDriverSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-200 dark:border-gray-700 relative animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Assign Driver</h2>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Select Driver</label>
            <select required value={assignDriverId} onChange={e => setAssignDriverId(e.target.value)} className="w-full px-3 py-2 rounded border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <option value="">Select a driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName} ({driver.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 justify-center">
            <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow hover:scale-105 transition-transform" disabled={assignDriverLoading}>{assignDriverLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Assign'}</button>
            <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold shadow hover:scale-105 transition-transform" onClick={() => setShowAssignDriverModal(false)} disabled={assignDriverLoading}>Cancel</button>
          </div>
        </form>
      </div>
    )}

    {/* Assign Route Modal */}
    {showAssignRouteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <form onSubmit={handleAssignRouteSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-200 dark:border-gray-700 relative animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Assign Routes</h2>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Select Routes</label>
            <select
              multiple
              required
              value={assignRouteIds}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setAssignRouteIds(selected);
              }}
              className="w-full px-3 py-2 rounded border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              style={{ minHeight: 120 }}
            >
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.route_name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-2">Hold Ctrl (Windows) or Cmd (Mac) to select multiple routes.</div>
          </div>
          <div className="flex gap-4 justify-center">
            <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow hover:scale-105 transition-transform" disabled={assignRouteLoading}>{assignRouteLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Assign'}</button>
            <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold shadow hover:scale-105 transition-transform" onClick={() => setShowAssignRouteModal(false)} disabled={assignRouteLoading}>Cancel</button>
          </div>
        </form>
      </div>
    )}
    {/* Add Route Modal */}
    {showAddRouteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <form onSubmit={handleAddRouteSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-100 dark:border-gray-800 relative animate-fadeIn">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center tracking-tight">Add New Route</h2>
          <div className="space-y-4">
            <input type="text" required value={addRouteForm.route_name} onChange={e => setAddRouteForm(f => ({ ...f, route_name: e.target.value }))} placeholder="Route Name" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" step="any" required value={addRouteForm.start_latitude} onChange={e => setAddRouteForm(f => ({ ...f, start_latitude: e.target.value }))} placeholder="Start Latitude" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" step="any" required value={addRouteForm.start_longitude} onChange={e => setAddRouteForm(f => ({ ...f, start_longitude: e.target.value }))} placeholder="Start Longitude" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" step="any" required value={addRouteForm.end_latitude} onChange={e => setAddRouteForm(f => ({ ...f, end_latitude: e.target.value }))} placeholder="End Latitude" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" step="any" required value={addRouteForm.end_longitude} onChange={e => setAddRouteForm(f => ({ ...f, end_longitude: e.target.value }))} placeholder="End Longitude" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="text" value={addRouteForm.stops} onChange={e => setAddRouteForm(f => ({ ...f, stops: e.target.value }))} placeholder="Stops (comma separated)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" min={1} required value={addRouteForm.speed_limit} onChange={e => setAddRouteForm(f => ({ ...f, speed_limit: e.target.value }))} placeholder="Speed Limit (km/h)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 transition-colors" disabled={addRouteLoading}>{addRouteLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Add Route'}</button>
            <button type="button" className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setShowAddRouteModal(false)} disabled={addRouteLoading}>Cancel</button>
          </div>
        </form>
      </div>
    )}
    {/* Add Bus Modal */}
    {showAddModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <form onSubmit={handleAddSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-100 dark:border-gray-800 relative animate-fadeIn">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center tracking-tight">Add New Bus</h2>
          <div className="space-y-4">
            <input type="text" required value={addForm.busNumber} onChange={e => setAddForm(f => ({ ...f, busNumber: e.target.value }))} placeholder="Bus Number" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" min={0} max={100} step="any" value={addForm.utilization === 0 ? '' : addForm.utilization} onChange={e => { const val = e.target.value; setAddForm(f => ({ ...f, utilization: val === '' ? 0 : parseFloat(val) })); }} placeholder="Utilization (%)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <input type="number" min={0} value={addForm.totalTrips === 0 ? '' : addForm.totalTrips} onChange={e => { const val = e.target.value; setAddForm(f => ({ ...f, totalTrips: val === '' ? 0 : Number(val) })); }} placeholder="Total Trips" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base" />
            <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 text-base">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 transition-colors" disabled={addLoading}>{addLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Add Bus'}</button>
            <button type="button" className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setShowAddModal(false)} disabled={addLoading}>Cancel</button>
          </div>
        </form>
      </div>
    )}
  </>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-0 sm:p-0 relative">
      {modals}
      <div className="w-full">
        <div className="flex items-center justify-between mb-10 gap-4 flex-wrap px-6 pt-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-teal-400 tracking-tight drop-shadow-lg">Bus Management</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold shadow hover:scale-105 transition-transform text-lg"
              onClick={handleAdd}
            >
              <Plus className="w-6 h-6" /> Add Bus
            </button>
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-green-400 text-white font-bold shadow hover:scale-105 transition-transform text-lg"
              onClick={handleAddRoute}
            >
              <Plus className="w-6 h-6" /> Add Route
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-lg font-semibold px-6"><Loader2 className="w-6 h-6 animate-spin" /> Loading buses...</div>
        ) : error ? (
          <div className="text-red-500 text-lg font-semibold px-6">{error}</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto w-full px-0 py-2 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-800 hidden md:block">
              <table className="w-full min-w-[800px] rounded-2xl overflow-hidden text-base sm:text-base text-sm shadow-lg">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-blue-200/80 to-green-200/80 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-100">
                    <th className="px-6 py-4 text-lg font-extrabold text-left rounded-tl-2xl">Bus Number</th>
                    <th className="px-6 py-4 text-lg font-extrabold text-left">Driver</th>
                    <th className="px-6 py-4 text-lg font-extrabold text-left">Route</th>
                    <th className="px-6 py-4 text-lg font-extrabold text-left">Utilization</th>
                    <th className="px-6 py-4 text-lg font-extrabold text-left">Total Trips</th>
                    <th className="px-6 py-4 text-lg font-extrabold text-left rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 text-lg font-semibold">No buses found.</td>
                    </tr>
                  ) : (
                    buses.map((bus, idx) => {
                      // ...existing code...
                      let driverName = 'N/A';
                      const driverId = (bus as any).driverId || (bus as any).driver_id;
                      if (driverId) {
                        const driver = drivers.find(d => d.id === driverId);
                        driverName = driver ? `${driver.firstName || driver.name || ''} ${driver.lastName || ''}`.trim() : 'N/A';
                      }
                      // Route names (support multiple routes)
                      let routeNames: string[] = [];
                      if (Array.isArray((bus as any).routeIds) && (bus as any).routeIds.length > 0) {
                        routeNames = ((bus as any).routeIds as string[])
                          .map(rid => {
                            const route = routes.find(r => r.id === rid);
                            return route ? route.route_name || route.name : null;
                          })
                          .filter(Boolean) as string[];
                      } else {
                        const routeId = (bus as any).routeId || (bus as any).route_id;
                        if (routeId) {
                          const route = routes.find(r => r.id === routeId);
                          if (route) routeNames = [route.route_name || route.name];
                        }
                      }
                      return (
                        <tr
                          key={bus.busId}
                          className={`transition-colors group ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900/60' : 'bg-blue-50/60 dark:bg-gray-800/60'} hover:bg-blue-100/70 dark:hover:bg-gray-700/70 border-b border-blue-100 dark:border-gray-800`}
                        >
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap text-base sm:text-lg align-middle">
                            <div className="flex items-center gap-3 h-full min-h-[2.5rem]">
                              <Bus className="w-6 h-6 text-blue-500 flex-shrink-0" />
                              <span className="flex items-center h-full leading-tight tracking-wide">{bus.busNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-blue-800 dark:text-blue-200 font-semibold whitespace-nowrap align-middle">
                            <span className="inline-block px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold shadow-sm">{driverName}</span>
                          </td>
                          <td className="px-6 py-4 text-green-900 dark:text-green-200 font-semibold whitespace-nowrap align-middle">
                            {routeNames.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {routeNames.map((name, idx) => (
                                  <span key={idx} className="inline-block px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold shadow-sm">{name}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm font-bold shadow-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 flex items-center mb-1 shadow-inner" style={{ minWidth: 100, position: 'relative' }}>
                              <div
                                className={`h-5 rounded-full flex items-center justify-center ${bus.utilization > 0.8 ? 'bg-green-500' :
                                    bus.utilization > 0.6 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                  }`}
                                style={{ width: `${bus.utilization * 100}%`, transition: 'width 0.4s' }}
                              >
                                <span className="w-full text-center text-white font-bold text-sm" style={{ whiteSpace: 'nowrap' }}>{Math.round(bus.utilization * 100)}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap text-base align-middle">{bus.totalTrips}</td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 items-stretch sm:items-center">
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform text-sm sm:text-base"
                                onClick={() => openEditModal(bus)}
                                disabled={!bus.busId}
                              >
                                <Edit2 className="w-5 h-5" /> Edit
                              </button>
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform text-sm sm:text-base"
                                onClick={() => handleStatus(bus.busId, bus.status === 'active' ? 'inactive' : 'active')}
                                disabled={!bus.busId}
                              >
                                {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform text-sm sm:text-base"
                                onClick={() => openAssignDriverModal(bus)}
                              >
                                Assign Driver
                              </button>
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform text-sm sm:text-base"
                                onClick={() => openAssignRouteModal(bus)}
                              >
                                Assign Route
                              </button>
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-transform text-sm sm:text-base"
                                onClick={() => handleDelete(bus.busId)}
                              >
                                <Trash2 className="w-5 h-5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Card/List View */}
            <div className="block md:hidden px-2 space-y-6 mb-8 pb-8">
              {buses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-lg font-semibold">No buses found.</div>
              ) : (
                buses.map(bus => {
                  let driverName = 'N/A';
                  const driverId = (bus as any).driverId || (bus as any).driver_id;
                  if (driverId) {
                    const driver = drivers.find(d => d.id === driverId);
                    driverName = driver ? `${driver.firstName || driver.name || ''} ${driver.lastName || ''}`.trim() : 'N/A';
                  }
                  // Route names (support multiple routes)
                  let routeNames: string[] = [];
                  if (Array.isArray((bus as any).routeIds) && (bus as any).routeIds.length > 0) {
                    routeNames = ((bus as any).routeIds as string[])
                      .map(rid => {
                        const route = routes.find(r => r.id === rid);
                        return route ? route.route_name || route.name : null;
                      })
                      .filter(Boolean) as string[];
                  } else {
                    const routeId = (bus as any).routeId || (bus as any).route_id;
                    if (routeId) {
                      const route = routes.find(r => r.id === routeId);
                      if (route) routeNames = [route.route_name || route.name];
                    }
                  }
                  return (
                    <div key={bus.busId} className="rounded-2xl shadow-xl border border-blue-300 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-3 mb-1 min-h-[2.5rem]">
                        <Bus className="w-7 h-7 text-blue-500 flex-shrink-0" />
                        <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight flex items-center h-full leading-tight">{bus.busNumber}</span>
                        <span className="ml-auto px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold shadow flex items-center h-full">{driverName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 font-semibold flex-wrap">
                        {routeNames.length > 0 ? (
                          routeNames.map((name, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold shadow mb-1">{name}</span>
                          ))
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold shadow mb-1">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-sm shadow text-white ${bus.utilization > 0.8 ? 'bg-green-500' :
                              bus.utilization > 0.6 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                        >
                          {Math.round(bus.utilization * 100)}% Utilization
                        </span>
                        <span className="ml-auto text-lg font-extrabold text-blue-700 dark:text-blue-300 tracking-wide">
                          <span className="text-lg font-semibold text-black dark:text-black">Trips : </span> {bus.totalTrips}
                        </span>

                      </div>
                      <div className="flex flex-col gap-3 mt-2">
                        <button
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-transform text-base tracking-wide"
                          onClick={() => openEditModal(bus)}
                        >
                          <Edit2 className="w-5 h-5" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-green-400 text-white rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-transform text-base tracking-wide"
                          onClick={() => handleStatus(bus.busId, bus.status === 'active' ? 'inactive' : 'active')}
                        >
                          {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-transform text-base tracking-wide"
                          onClick={() => openAssignDriverModal(bus)}
                        >
                          Assign Driver
                        </button>
                        <button
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-transform text-base tracking-wide"
                          onClick={() => openAssignRouteModal(bus)}
                        >
                          Assign Route
                        </button>
                        <button
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition-transform text-base tracking-wide"
                          onClick={() => handleDelete(bus.busId)}
                        >
                          <Trash2 className="w-5 h-5" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusManagement;
