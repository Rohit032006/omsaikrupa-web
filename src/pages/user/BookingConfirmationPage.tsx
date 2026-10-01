import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, FileText, Home, Clock } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { useBookingStore } from '../../store/bookingStore';
import { generateBookingReceipt } from '../../utils/pdfReceipt';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { resetBooking } = useBookingStore();

  useEffect(() => {
    let active = true;

    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await bookingApi.getById(bookingId);
        if (active && response.data) {
          setBookingDetails(response.data);
        }
      } catch (error) {
        console.error('Failed to load real booking', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBooking();
    
    // Clear the booking store so next booking is fresh
    return () => {
      active = false;
      resetBooking();
    };
  }, [bookingId, resetBooking]);

  const handleDownloadReceipt = () => {
    if (!bookingDetails) return;
    generateBookingReceipt(bookingDetails);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Booking Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-600 underline">Return Home</button>
      </div>
    );
  }

  const bStatus = bookingDetails.bookingStatus || bookingDetails.status || 'PENDING';
  const pStatus = bookingDetails.paymentStatus || 'PENDING';
  const isConfirmed = bStatus === 'CONFIRMED' || pStatus === 'VERIFIED' || pStatus === 'PAID';
  const displayId = bookingDetails.bookingId || bookingDetails.id || bookingId;
  const travelDateStr = bookingDetails.travelDate || bookingDetails.date || new Date().toISOString();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center">
        {/* Success Header */}
        <div className={`pt-12 pb-8 px-6 ${isConfirmed ? 'bg-emerald-50/60' : 'bg-amber-50/60'}`}>
          <div className="flex justify-center mb-5">
            {isConfirmed ? (
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-60"></div>
                <CheckCircle className="w-20 h-20 text-emerald-500 relative z-10 bg-white rounded-full p-1" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-10 h-10" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isConfirmed ? 'Booking Confirmed Successfully!' : 'Booking Submitted Successfully!'}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            {isConfirmed 
              ? 'Your seats have been reserved. Your booking is confirmed and verified.'
              : 'Your booking has been received and is pending payment verification by our team.'}
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          <div className="inline-block bg-orange-50 border border-orange-200/80 rounded-2xl px-7 py-3.5 mb-8">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Booking Reference ID</p>
            <p className="text-2xl font-extrabold tracking-wider text-gray-900 font-mono">{displayId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8 border border-gray-200 rounded-2xl p-6 shadow-sm bg-gray-50/50">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle</p>
              <p className="font-extrabold text-gray-900 text-sm mt-0.5">{bookingDetails.vehicleName || 'Vehicle Booked'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Travel Date</p>
              <p className="font-extrabold text-gray-900 text-sm mt-0.5">{travelDateStr}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Route</p>
              <p className="font-extrabold text-gray-900 text-sm mt-0.5">{bookingDetails.pickupLocation} → {bookingDetails.dropLocation}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <p className={`font-extrabold text-sm mt-0.5 ${isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {bStatus}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </button>
            <Link
              to="/my-bookings"
              className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-md"
            >
              <FileText className="w-5 h-5 mr-2" />
              View My Bookings
            </Link>
          </div>
          
          <div className="mt-8">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
