import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, XCircle, MapPin, Calendar, Clock, 
  Car, User, CreditCard, ShieldCheck, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../services/api';
import { generateBookingReceipt } from '../../utils/pdfReceipt';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await bookingApi.getById(id);
      setBooking(res.data);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      toast.error('Could not load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) {
      return;
    }
    try {
      setCancelling(true);
      await bookingApi.cancel(booking.id);
      toast.success('Booking cancelled');
      fetchBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto mt-8">
        <h2 className="text-xl font-bold text-gray-800">Booking not found</h2>
        <p className="text-sm text-gray-500 mt-1">The requested booking does not exist.</p>
        <button 
          onClick={() => navigate('/my-bookings')} 
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const passengers = booking.passengers || [];
  const payments = booking.payments || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/my-bookings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              {booking.bookingId}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {booking.bookingStatus}
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
            <button 
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
          <button 
            onClick={() => generateBookingReceipt(booking)}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-xl font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download Receipt
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Booking Progress</h3>
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>
          <div className="relative flex justify-between">
            <div>
              <span className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center ring-4 ring-white shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </span>
              <p className="mt-2 text-xs font-semibold text-gray-900">Initiated</p>
            </div>
            <div>
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                booking.paymentStatus === 'PAID' || booking.paymentStatus === 'PARTIALLY_PAID' || booking.paymentStatus === 'SUBMITTED' 
                  ? 'bg-orange-600' : 'bg-gray-300'
              }`}>
                <CheckCircle2 className="h-5 w-5 text-white" />
              </span>
              <p className="mt-2 text-xs font-semibold text-gray-900">Payment</p>
            </div>
            <div>
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                booking.bookingStatus === 'CONFIRMED' || booking.bookingStatus === 'COMPLETED' ? 'bg-orange-600' : 'bg-gray-300'
              }`}>
                <CheckCircle2 className="h-5 w-5 text-white" />
              </span>
              <p className="mt-2 text-xs font-semibold text-gray-900">Confirmed</p>
            </div>
            <div>
              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                booking.bookingStatus === 'COMPLETED' ? 'bg-orange-600' : 'bg-gray-300'
              }`}>
                <CheckCircle2 className="h-5 w-5 text-white" />
              </span>
              <p className="mt-2 text-xs font-semibold text-gray-900">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Trip Details</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Travel Date</p>
                <p className="font-bold text-gray-900 flex items-center mt-1 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-orange-500" /> {booking.travelDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Pickup Time</p>
                <p className="font-bold text-gray-900 flex items-center mt-1 text-sm">
                  <Clock className="w-4 h-4 mr-1 text-orange-500" /> {booking.pickupTime || 'Flexible'}
                </p>
              </div>
            </div>
            
            <div className="relative pl-6 py-2 border-l-2 border-dashed border-gray-200 space-y-4 ml-2">
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow"></div>
                <p className="text-xs text-gray-500 font-medium">Pickup Location</p>
                <p className="font-semibold text-gray-900 text-sm">{booking.pickupLocation}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow"></div>
                <p className="text-xs text-gray-500 font-medium">Drop Location</p>
                <p className="font-semibold text-gray-900 text-sm">{booking.dropLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Trip Type</p>
                <p className="font-semibold text-gray-900 text-sm">{booking.tripType || 'One Way'}</p>
              </div>
              {booking.flightNumber && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Flight Number</p>
                  <p className="font-semibold text-gray-900 text-sm">{booking.flightNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle & Driver Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Car className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Vehicle Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600 shrink-0">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{booking.vehicleName || 'Vehicle'}</h3>
                <p className="text-xs text-gray-600">{booking.vehicleType} • {booking.capacity} Seater</p>
                {booking.vehicleNumber && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-yellow-100 border border-yellow-300 rounded font-mono font-bold text-xs text-yellow-900">
                    {booking.vehicleNumber}
                  </span>
                )}
              </div>
            </div>

            {booking.driverName ? (
              <div className="pt-3 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Assigned Driver</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{booking.driverName}</p>
                    <p className="text-xs text-gray-600">{booking.driverMobile || '-'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-orange-500 shrink-0" />
                  Driver details will be assigned and shared prior to the journey.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Passenger Information</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-orange-100 rounded-full text-xs font-bold text-orange-800">
              {passengers.length || booking.passengerCount || 1} Passengers
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Seat</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {passengers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-xs text-gray-400">
                      No separate passenger list recorded.
                    </td>
                  </tr>
                ) : (
                  passengers.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 rounded font-bold text-xs text-orange-800">
                          {p.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.gender || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.age || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.mobile || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History & Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 md:col-span-2 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-base font-bold text-gray-900">Payment Breakdown</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="text-xs text-gray-500 font-medium">Total Amount</span>
                <p className="text-xl font-extrabold text-gray-900 mt-1">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-xs text-green-700 font-medium">Amount Paid</span>
                <p className="text-xl font-extrabold text-green-700 mt-1">₹{(booking.paidAmount || 0)?.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <span className="text-xs text-orange-700 font-medium">Balance Due</span>
                <p className="text-xl font-extrabold text-orange-700 mt-1">₹{(booking.remainingAmount || 0)?.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {booking.remainingAmount > 0 && booking.bookingStatus !== 'CANCELLED' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-900">Pending Balance: ₹{booking.remainingAmount}</p>
                  <p className="text-xs text-amber-700">You can pay the remaining amount via UPI QR code.</p>
                </div>
                <button
                  onClick={() => navigate(`/book/payment/${booking.id}`)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Pay Now
                </button>
              </div>
            )}

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">UTR / Ref</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-xs text-gray-400">
                        No payment submissions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                          {p.paymentDate || p.createdAt}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-900">
                          ₹{p.amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{p.method || 'UPI'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-700">{p.utrNumber || p.transactionId || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${
                            p.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            p.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
