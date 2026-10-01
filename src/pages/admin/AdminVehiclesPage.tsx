import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Car, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleApi, driverApi } from '../../services/api';

interface VehicleRecord {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  baseFare: number;
  driverId?: string;
  driverName?: string;
  status: string;
  features?: string;
}

const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);

  // Form State
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [capacity, setCapacity] = useState(5);
  const [baseFare, setBaseFare] = useState(1200);
  const [driverId, setDriverId] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [features, setFeatures] = useState('AC, Pushback Seats, Luggage Space');
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const [vRes, dRes] = await Promise.all([
        vehicleApi.getAll(),
        driverApi.getAll().catch(() => ({ data: [] })),
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setVehicleName('');
    setVehicleNumber('');
    setVehicleType('Sedan');
    setCapacity(5);
    setBaseFare(1200);
    setDriverId('');
    setStatus('AVAILABLE');
    setFeatures('AC, Pushback Seats, Luggage Space');
    setShowModal(true);
  };

  const openEditModal = (v: VehicleRecord) => {
    setEditingVehicle(v);
    setVehicleName(v.vehicleName);
    setVehicleNumber(v.vehicleNumber);
    setVehicleType(v.vehicleType);
    setCapacity(v.capacity);
    setBaseFare(v.baseFare);
    setDriverId(v.driverId || '');
    setStatus(v.status || 'AVAILABLE');
    setFeatures(v.features || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim() || !vehicleNumber.trim()) {
      toast.error('Please enter vehicle name and number');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vehicleName,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vehicleType,
        capacity: Number(capacity),
        baseFare: Number(baseFare),
        driverId: driverId || null,
        status,
        features,
      };

      if (editingVehicle) {
        await vehicleApi.update(editingVehicle.id, payload);
        toast.success('Vehicle updated successfully!');
      } else {
        await vehicleApi.create(payload);
        toast.success('Vehicle added successfully!');
      }

      setShowModal(false);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await vehicleApi.delete(id);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Fleet & Vehicles</h1>
          <p className="text-xs text-gray-500">Live vehicles available for booking in the system.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Vehicle
        </button>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-xs text-gray-500">Loading vehicles from database...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">No vehicles in the fleet yet.</p>
          <button onClick={openAddModal} className="mt-3 text-xs text-orange-600 font-bold hover:underline">
            + Add First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-100/50 flex items-center justify-center relative p-4">
                <Car className="w-16 h-16 text-orange-500" />
                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase ${
                  vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                  vehicle.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-base">{vehicle.vehicleName}</h3>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-bold text-gray-700">
                    {vehicle.vehicleNumber}
                  </span>
                </div>
                
                <div className="space-y-1.5 mt-3 text-xs text-gray-600 flex-1">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Category</span>
                    <span className="font-semibold text-gray-800">{vehicle.vehicleType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Seating Capacity</span>
                    <span className="font-bold text-orange-600">{vehicle.capacity} Seats</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">Starting Fare</span>
                    <span className="font-bold text-gray-900">₹{vehicle.baseFare?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Driver</span>
                    <span className="font-semibold text-gray-800">{vehicle.driverName || 'Not Assigned'}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between">
                  <button 
                    onClick={() => openEditModal(vehicle)}
                    className="flex items-center text-xs font-bold text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(vehicle.id, vehicle.vehicleName)}
                    className="flex items-center text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle to Fleet'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="e.g. Innova Crysta"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Number Plate *</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH 12 AB 1234"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity (Seats) *</label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value={5}>5 Seater (Sedan)</option>
                    <option value={6}>6 Seater (SUV)</option>
                    <option value={14}>14 Seater (Minibus)</option>
                    <option value={17}>17 Seater (Tempo)</option>
                    <option value={20}>20 Seater (Coach)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type *</label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. AC SUV / Minibus"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Starting Fare (₹) *</label>
                  <input
                    type="number"
                    value={baseFare}
                    onChange={(e) => setBaseFare(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_TRIP">ON_TRIP</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Driver (Optional)</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="">No driver assigned</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.mobile}) - {d.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Features / Amenities</label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="e.g. AC, GPS, Luggage Rack, Bluetooth"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehiclesPage;
