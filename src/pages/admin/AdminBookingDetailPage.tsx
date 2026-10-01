import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Car, 
  CreditCard, Printer, Check, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi, paymentApi } from '../../services/api';
import { generateBookingReceipt } from '../../utils/pdfReceipt';

const AdminBookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await bookingApi.getById(id);
      setBooking(res.data);
      setSelectedStatus(res.data.bookingStatus || 'PENDING');
    } catch (error) {
      console.error('Failed to load booking details:', error);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!booking) return;
    try {
      setUpdatingStatus(true);
      if (selectedStatus === 'CANCELLED') {
        await bookingApi.cancel(booking.id);
      } else {
        await bookingApi.updateStatus(booking.id, selectedStatus);
      }
      toast.success(`Booking status changed to ${selectedStatus}`);
      fetchBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      await paymentApi.verify(paymentId);
      toast.success('Payment verified successfully!');
      fetchBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to verify payment');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!window.confirm('Reject this payment transaction?')) return;
    try {
      await paymentApi.reject(paymentId);
      toast.success('Payment marked as rejected');
      fetchBooking();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to reject payment');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-2 text-xs text-gray-500">Loading booking #{id}...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto mt-8">
        <h2 className="text-lg font-bold text-gray-800">Booking not found</h2>
        <button 
          onClick={() => navigate('/admin/bookings')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const passengers = booking.passengers || [];
  const payments = booking.payments || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
          <Link to="/admin/bookings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Booking {booking.bookingId}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {booking.bookingStatus}
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Created {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => generateBookingReceipt(booking)}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5 text-gray-500" /> Print Receipt
          </button>
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-orange-950">Update Status:</span>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-orange-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button 
            onClick={handleUpdateStatus}
            disabled={updatingStatus}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {updatingStatus ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-orange-600" /> Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.userName || booking.name || 'User'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile Number</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5 flex items-center">
                  {booking.userMobile || booking.mobile || '-'}
                  <Phone className="w-3.5 h-3.5 ml-1.5 text-gray-400" />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800 text-sm mt-0.5">{booking.userEmail || booking.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2 text-orange-600" /> Trip Details
            </h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500">Route</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.pickupLocation} → {booking.dropLocation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.travelDate} at {booking.pickupTime || 'Flexible'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vehicle</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.vehicleName || 'Vehicle'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trip Type</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{booking.tripType || 'One Way'}</p>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-orange-600" /> Passengers ({passengers.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-2.5">Seat</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Age</th>
                    <th className="p-2.5">Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {passengers.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-orange-600">{p.seatNumber}</td>
                      <td className="p-2.5 font-semibold text-gray-900">{p.name}</td>
                      <td className="p-2.5 text-gray-600">{p.gender || '-'}</td>
                      <td className="p-2.5 text-gray-600">{p.age || '-'}</td>
                      <td className="p-2.5 text-gray-600">{p.mobile || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Payments */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-orange-600" /> Payment Overview
            </h2>
            <div className="space-y-3 mb-4 border-b border-gray-100 pb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-gray-900 text-sm">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Amount Paid</span>
                <span className="font-bold text-sm">₹{(booking.paidAmount || 0)?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-orange-700">
                <span>Balance Due</span>
                <span className="font-bold text-sm">₹{(booking.remainingAmount || 0)?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Transactions</h3>
            <div className="space-y-2.5">
              {payments.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">No payment transactions yet.</p>
              ) : (
                payments.map((txn: any) => (
                  <div key={txn.id} className="bg-gray-50 p-3 rounded-xl text-xs border border-gray-100 space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-900">₹{txn.amount} ({txn.method || 'UPI'})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        txn.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        txn.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      UTR: <span className="font-mono text-gray-700 font-semibold">{txn.utrNumber || txn.transactionId || '-'}</span>
                    </div>
                    {txn.status === 'SUBMITTED' || txn.status === 'PENDING' ? (
                      <div className="flex gap-2 pt-2 border-t border-gray-200 mt-2">
                        <button
                          onClick={() => handleVerifyPayment(txn.id)}
                          className="flex-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Verify
                        </button>
                        <button
                          onClick={() => handleRejectPayment(txn.id)}
                          className="flex-1 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetailPage;
