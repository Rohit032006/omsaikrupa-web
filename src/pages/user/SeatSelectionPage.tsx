import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Info } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { vehicleApi } from '../../services/api';
import { SeatSelector } from '../../components/SeatSelector';

export const SeatSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedVehicle, travelDate, passengers, selectedSeats, toggleSeat, setSelectedSeats } = useBookingStore();
  
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicle) {
      navigate('/search-vehicles');
      return;
    }

    const fetchSeatsStatus = async () => {
      try {
        setLoading(true);
        const dateParam = travelDate || new Date().toISOString().split('T')[0];
        const response = await vehicleApi.getSeats(selectedVehicle.id, dateParam);
        setBookedSeats(response.data?.bookedSeats || []);
        setReservedSeats(response.data?.reservedSeats || []);
      } catch (error) {
        console.error('Failed to fetch seat status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatsStatus();
  }, [selectedVehicle, travelDate, navigate]);

  const handleContinue = () => {
    if (selectedSeats.length > 0) {
      navigate('/book/passengers');
    }
  };

  if (!selectedVehicle) return null;

  const maxSelectable = passengers || selectedVehicle.capacity;
  const pricePerSeat = selectedVehicle.baseFare || selectedVehicle.pricePerSeat || 0;
  const totalPrice = selectedSeats.length * pricePerSeat;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/search-vehicles')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Select Your Seats</h1>
            <p className="text-gray-500 text-sm">
              {selectedVehicle.vehicleName || selectedVehicle.name} • {selectedVehicle.vehicleType || selectedVehicle.type} • {selectedVehicle.capacity} Seater
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 text-sm">
          <span className="text-orange-600 font-semibold">Search</span>
          <span className="text-gray-300">→</span>
          <span className="text-orange-600 font-semibold">Select Vehicle</span>
          <span className="text-gray-300">→</span>
          <span className="font-bold text-orange-700 border-b-2 border-orange-600 pb-0.5">Select Seats</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Passengers</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Seat Selector Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
            <div className="mb-6 flex items-start p-4 bg-blue-50 text-blue-800 rounded-xl">
              <Info className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-sm">
                Select up to <strong>{maxSelectable} seat{maxSelectable > 1 ? 's' : ''}</strong>. 
                Click on a green seat to select it. Blue seats are your selections. Red seats are already booked.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent" />
                <p className="text-gray-500 text-sm">Loading seat availability...</p>
              </div>
            ) : (
              <SeatSelector
                capacity={selectedVehicle.capacity}
                bookedSeats={bookedSeats}
                reservedSeats={reservedSeats}
                selectedSeats={selectedSeats}
                maxSelectable={maxSelectable}
                onToggleSeat={toggleSeat}
              />
            )}
          </div>

          {/* Right Panel / Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium text-gray-900">{selectedVehicle.vehicleName || selectedVehicle.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Travel Date</span>
                  <span className="font-medium text-gray-900">
                    {travelDate ? new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Selected Seats</span>
                  <span className="font-medium text-gray-900">
                    {selectedSeats.length > 0 ? (
                      <span className="flex flex-wrap justify-end gap-1">
                        {[...selectedSeats].sort().map(s => (
                          <span key={s} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{s}</span>
                        ))}
                      </span>
                    ) : 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per Seat</span>
                  <span className="font-medium text-gray-900">₹{pricePerSeat.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-orange-600">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedSeats.length} seat(s) × ₹{pricePerSeat.toLocaleString('en-IN')}</p>
              </div>

              {selectedSeats.length === 0 && (
                <p className="text-center text-sm text-gray-500 mb-4">Please select at least one seat to continue</p>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  selectedSeats.length > 0
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Passengers
                {selectedSeats.length > 0 && <Check className="w-5 h-5" />}
              </button>

              {selectedSeats.length > 0 && (
                <button
                  onClick={() => setSelectedSeats([])}
                  className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
