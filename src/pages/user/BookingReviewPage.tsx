import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Info, ShieldCheck, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBookingStore } from '../../store/bookingStore';
import { bookingApi } from '../../services/api';

export const BookingReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    travelDate, 
    pickupTime, 
    pickup, 
    drop, 
    tripType, 
    flightNumber, 
    selectedVehicle, 
    selectedSeats, 
    passengerDetails, 
    setBookingId,
    setSearchParams
  } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTrip, setIsEditingTrip] = useState(false);

  // Editable trip details
  const todayStr = new Date().toISOString().split('T')[0];
  const [curPickup, setCurPickup] = useState(pickup || 'Pune');
  const [curDrop, setCurDrop] = useState(drop || 'Mumbai');
  const [curDate, setCurDate] = useState(travelDate || todayStr);
  const [curTime, setCurTime] = useState(pickupTime || '09:00 AM');

  // Redirect if critical data is missing
  if (!selectedVehicle || selectedSeats.length === 0 || passengerDetails.length === 0) {
    navigate('/search-vehicles');
    return null;
  }

  const baseFare = selectedVehicle.baseFare || selectedVehicle.pricePerSeat || 1200;
  const totalAmount = baseFare * selectedSeats.length;

  const handleSaveTripEdits = () => {
    setSearchParams({
      pickup: curPickup,
      drop: curDrop,
      travelDate: curDate,
      pickupTime: curTime,
    });
    setIsEditingTrip(false);
    toast.success('Trip details updated');
  };

  const handleProceedToPayment = async () => {
    try {
      setIsSubmitting(true);
      
      const finalPickup = curPickup || pickup || 'Pune';
      const finalDrop = curDrop || drop || 'Mumbai';
      const finalDate = curDate || travelDate || todayStr;
      const finalTime = curTime || pickupTime || '09:00 AM';

      const payload = {
        vehicleId: selectedVehicle.id,
        travelDate: finalDate,
        pickupTime: finalTime,
        pickupLocation: finalPickup,
        dropLocation: finalDrop,
        tripType: tripType || 'LOCAL',
        flightNumber: flightNumber || null,
        seats: selectedSeats,
        passengers: passengerDetails,
        totalAmount,
      };

      const response = await bookingApi.create(payload);
      
      // Store returned booking ID and navigate
      setBookingId(response.data.id, response.data.bookingId);
      toast.success('Booking initiated! Proceeding to payment...');
      navigate(`/book/payment/${response.data.id}`);
      
    } catch (error: any) {
      console.error('Failed to create booking', error);
      const msg = error?.response?.data?.error || 'Failed to initiate booking. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/book/passengers')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Booking</h1>
          <p className="text-gray-600">Please review your trip details before proceeding to payment</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Trip Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">Trip & Route Details</h2>
              {!isEditingTrip ? (
                <button
                  onClick={() => setIsEditingTrip(true)}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Route / Date
                </button>
              ) : (
                <button
                  onClick={handleSaveTripEdits}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mr-4 shrink-0 font-bold border border-orange-100">
                  🚗
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedVehicle.vehicleName || selectedVehicle.name}</h3>
                  <p className="text-xs text-gray-600">{selectedVehicle.vehicleType || selectedVehicle.type} • {selectedVehicle.capacity} Seater</p>
                </div>
              </div>

              {!isEditingTrip ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Travel Date & Time</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">
                        {curDate}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{curTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Route</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">From: {curPickup}</p>
                      <p className="font-bold text-gray-900 text-sm">To: {curDrop}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Location *</label>
                    <input
                      type="text"
                      value={curPickup}
                      onChange={(e) => setCurPickup(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g. Pune Airport"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Drop Location *</label>
                    <input
                      type="text"
                      value={curDrop}
                      onChange={(e) => setCurDrop(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Travel Date *</label>
                    <input
                      type="date"
                      value={curDate}
                      onChange={(e) => setCurDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Time *</label>
                    <input
                      type="text"
                      value={curTime}
                      onChange={(e) => setCurTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      placeholder="e.g. 09:00 AM"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Passengers Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-600" />
                Passenger Details
              </h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                {passengerDetails.length} Passengers
              </span>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {passengerDetails.map((passenger, idx) => (
                  <li key={idx} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-base mb-1">{passenger.name}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          <span>📱 {passenger.mobile}</span>
                          {passenger.age && <span>👤 {passenger.age} yrs, {passenger.gender}</span>}
                          {!passenger.age && <span>👤 {passenger.gender}</span>}
                        </div>
                        {passenger.specialRequirement && (
                          <div className="mt-2 text-xs flex items-start text-orange-700">
                            <Info className="w-4 h-4 mr-1 shrink-0 mt-0.5" />
                            <span>Note: {passenger.specialRequirement}</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-left md:text-right">
                        <span className="text-xs text-gray-400 block mb-1">Seat Number</span>
                        <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 text-orange-800 font-extrabold text-sm rounded-lg">
                          {passenger.seatNumber}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Price Summary Panel */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Price Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Base Fare ({selectedSeats.length} seats)</span>
                <span className="font-medium text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Booking Fee</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & GST</span>
                <span className="text-gray-900 font-medium">Included</span>
              </div>
              
              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-orange-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-gray-400 block">Inclusive of all taxes</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 mb-6 flex items-start text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600 mr-2 shrink-0 mt-0.5" />
              <span>Safe and secure checkout. We verify your UPI transaction directly with reference UTR.</span>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Proceed to Payment →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;
