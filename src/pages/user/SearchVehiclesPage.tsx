import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Calendar, Clock, MapPin, CheckCircle, Car, ArrowLeft, Search, Shield, ChevronRight } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { vehicleApi } from '../../services/api';
import { Logo } from '../../components/Logo';

export const SearchVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    pickup, 
    drop, 
    travelDate, 
    pickupTime, 
    passengers, 
    tripType,
    setSearchParams, 
    setSelectedVehicle 
  } = useBookingStore();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Local edit form state
  const [editPickup, setEditPickup] = useState(pickup || 'Pune');
  const [editDrop, setEditDrop] = useState(drop || 'Mumbai');
  const [editDate, setEditDate] = useState(travelDate || new Date().toISOString().split('T')[0]);
  const [editTime, setEditTime] = useState(pickupTime || '09:00 AM');
  const [editPassengers, setEditPassengers] = useState(passengers || 1);

  // Fetch vehicles whenever travelDate or passengers change
  useEffect(() => {
    let active = true;

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const queryDate = travelDate || editDate || new Date().toISOString().split('T')[0];
        const queryPassengers = passengers || editPassengers || 1;
        const response = await vehicleApi.search({
          date: queryDate,
          passengers: queryPassengers,
        });
        if (active) {
          setVehicles(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      active = false;
    };
  }, [travelDate, passengers, editDate, editPassengers]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      pickup: editPickup,
      drop: editDrop,
      travelDate: editDate,
      pickupTime: editTime,
      passengers: Number(editPassengers),
    });
    setIsEditing(false);
  };

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    navigate('/book/seats');
  };

  const getVehicleFeatures = (feat: any): string[] => {
    if (Array.isArray(feat)) return feat;
    if (typeof feat === 'string') {
      try {
        const parsed = JSON.parse(feat);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return feat.split(',').map((s: string) => s.trim());
      }
    }
    return ['AC', 'Pushback Seats', 'Luggage Space', '24/7 Helpline'];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/dashboard">
              <Logo size="sm" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 rounded-xl transition-colors"
            >
              My Dashboard
            </Link>
            <Link
              to="/my-bookings"
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 rounded-xl transition-colors"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar / Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {!isEditing ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-700">
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="font-bold text-gray-900">{pickup || 'Pickup'}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-bold text-gray-900">{drop || 'Drop'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{travelDate || editDate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{pickupTime || editTime}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{passengers || editPassengers} Passengers</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl text-xs font-bold transition-colors border border-orange-200 self-start md:self-auto"
              >
                Modify Search
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyFilter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Pickup Location</label>
                  <input
                    type="text"
                    value={editPickup}
                    onChange={(e) => setEditPickup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Pune Airport"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Drop Location</label>
                  <input
                    type="text"
                    value={editDrop}
                    onChange={(e) => setEditDrop(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Pickup Time</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Passengers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editPassengers}
                    onChange={(e) => setEditPassengers(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Update Results
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Available Vehicles ({vehicles.length})</h2>
            <p className="text-xs text-gray-500">Pick your preferred vehicle to proceed with airline-style seat booking.</p>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded w-16"></div>
                    <div className="h-6 bg-gray-100 rounded w-20"></div>
                  </div>
                </div>
                <div className="w-full md:w-48 flex flex-col items-end justify-center space-y-3">
                  <div className="h-8 bg-gray-100 rounded w-24"></div>
                  <div className="h-10 bg-gray-100 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Vehicles Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
              No vehicles available for the selected capacity or date. Try lowering the passenger count or selecting another date.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-700 transition-colors shadow-sm"
            >
              Modify Search Parameters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const featuresList = getVehicleFeatures(vehicle.features);
              const availableSeats = vehicle.availableSeats !== undefined ? vehicle.availableSeats : vehicle.capacity;
              const isFullyBooked = availableSeats <= 0;
              const displayName = vehicle.vehicleName || vehicle.name || 'Vehicle';
              const displayType = vehicle.vehicleType || vehicle.type || 'Standard';
              const fare = vehicle.baseFare || vehicle.pricePerSeat || 1200;

              return (
                <div 
                  key={vehicle.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md"
                >
                  {/* Left: Vehicle Silhouette */}
                  <div className="w-full md:w-52 shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100/50">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xs text-orange-600 mb-2">
                      <Car className="w-9 h-9" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center">{displayName}</h3>
                    <span className="text-xs text-orange-700 font-semibold mt-0.5">{displayType}</span>
                    {vehicle.vehicleNumber && (
                      <span className="mt-2 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-bold">
                        {vehicle.vehicleNumber}
                      </span>
                    )}
                  </div>

                  {/* Center: Info & Features */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {isFullyBooked ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                          Fully Booked
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {availableSeats} of {vehicle.capacity} Seats Available
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        Total Capacity: {vehicle.capacity} Seater
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {featuresList.map((f: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="bg-gray-50 text-gray-700 text-[11px] px-2.5 py-1 rounded-lg border border-gray-100 font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {vehicle.driverName && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-orange-500" />
                        Driver Assigned: <span className="font-semibold text-gray-800">{vehicle.driverName}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Fare & Booking CTA */}
                  <div className="w-full md:w-52 shrink-0 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center md:text-right mb-4">
                      <span className="text-xs text-gray-400 block font-medium">Base Fare Starting At</span>
                      <span className="text-2xl font-extrabold text-gray-900">₹{fare.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-gray-400 block">per trip</span>
                    </div>
                    
                    <button
                      onClick={() => handleSelectVehicle(vehicle)}
                      disabled={isFullyBooked}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isFullyBooked 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-md'
                      }`}
                    >
                      {isFullyBooked ? 'Sold Out' : (
                        <>
                          <span>Select Vehicle & Seats</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchVehiclesPage;
