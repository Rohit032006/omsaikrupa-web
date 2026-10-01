import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { driverApi } from '../../services/api';

interface DriverRecord {
  id: string;
  name: string;
  mobile: string;
  licenseNumber: string;
  licenseExpiry?: string;
  status: string;
  vehicleName?: string;
}

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);

  // Form
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driverApi.getAll();
      setDrivers(res.data || []);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setMobile('');
    setLicenseNumber('');
    setLicenseExpiry('');
    setStatus('AVAILABLE');
    setShowModal(true);
  };

  const openEditModal = (d: DriverRecord) => {
    setEditingDriver(d);
    setName(d.name);
    setMobile(d.mobile);
    setLicenseNumber(d.licenseNumber || '');
    setLicenseExpiry(d.licenseExpiry || '');
    setStatus(d.status || 'AVAILABLE');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      toast.error('Name and mobile number are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        mobile,
        licenseNumber,
        licenseExpiry: licenseExpiry || null,
        status,
      };

      if (editingDriver) {
        await driverApi.update(editingDriver.id, payload);
        toast.success('Driver updated');
      } else {
        await driverApi.create(payload);
        toast.success('Driver registered');
      }

      setShowModal(false);
      fetchDrivers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, driverName: string) => {
    if (!window.confirm(`Delete driver ${driverName}?`)) return;
    try {
      await driverApi.delete(id);
      toast.success('Driver removed');
      fetchDrivers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete driver');
    }
  };

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.mobile.includes(search) ||
    (d.licenseNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Drivers</h1>
          <p className="text-xs text-gray-500">Fleet drivers registered in the database.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Driver
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver by name, phone or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold">{filtered.length} drivers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-3.5">Driver Info</th>
                <th className="p-3.5">License Details</th>
                <th className="p-3.5">Assigned Vehicle</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Loading drivers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No drivers found.</td>
                </tr>
              ) : (
                filtered.map((driver) => (
                  <tr key={driver.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{driver.name}</div>
                      <div className="text-[11px] text-gray-500">{driver.mobile}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-gray-800">{driver.licenseNumber || 'N/A'}</div>
                      {driver.licenseExpiry && (
                        <div className="text-[10px] text-gray-400">Exp: {driver.licenseExpiry}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-gray-700">
                      {driver.vehicleName || 'Not Assigned'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        driver.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        driver.status === 'ASSIGNED' || driver.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => openEditModal(driver)}
                          className="p-1 text-gray-500 hover:text-orange-600 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(driver.id, driver.name)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">
                {editingDriver ? 'Edit Driver' : 'Register New Driver'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Driving License</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="MH12 2018..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="OFF_DUTY">OFF_DUTY</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingDriver ? 'Update Driver' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDriversPage;
