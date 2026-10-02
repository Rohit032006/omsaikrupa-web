import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ArrowRight, Download, XCircle, Eye, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../services/api';
import { generateBookingReceipt } from '../../utils/pdfReceipt';

interface Booking {
  id: string;
  bookingId: string;
  travelDate: string;
  vehicleName: string;
  vehicleNumber?: string;
  pickupLocation: string;
  dropLocation: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  seats?: string[] | string;
  paymentStatus: string;
  bookingStatus: string;
}

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getAll().catch(() => ({ data: [] }));
      const apiList = res?.data || [];
      let localList: any[] = [];
      try {
        localList = JSON.parse(localStorage.getItem('osk_all_bookings') || '[]');
      } catch (e) {}

      const combined = [...apiList];
      localList.forEach((lb: any) => {
        if (!combined.some((b: any) => b.id === lb.id || b.bookingId === lb.bookingId)) {
          combined.push(lb);
        }
      });
      setBookings(combined);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      try {
        setBookings(JSON.parse(localStorage.getItem('osk_all_bookings') || '[]'));
      } catch (e) {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) {
      return;
    }
    try {
      setCancellingId(id);
      await bookingApi.cancel(id);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIALLY_PAID':
      case 'PARTIAL': return 'bg-orange-100 text-orange-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const parseSeats = (seats: any): string[] => {
    if (!seats) return [];
    if (Array.isArray(seats)) return seats;
    if (typeof seats === 'string') {
      try {
        const parsed = JSON.parse(seats);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return seats.split(',').map((s: string) => s.trim());
      }
    }
    return [];
  };

  const filteredBookings = bookings.filter(b => {
    const status = (b.bookingStatus || '').toLowerCase();
    const matchesTab = activeTab === 'All' || status === activeTab.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.bookingId || '').toLowerCase().includes(search) || 
      (b.pickupLocation || '').toLowerCase().includes(search) ||
      (b.dropLocation || '').toLowerCase().includes(search) ||
      (b.vehicleName || '').toLowerCase().includes(search);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500">Manage all your past and upcoming trips in real-time.</p>
        </div>
        <Link 
          to="/search-vehicles"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm"
        >
          Book Another Vehicle
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search booking ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-500">Loading your real bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Car className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || activeTab !== 'All' 
                ? "No bookings match your selected filter." 
                : "You have not made any bookings yet."}
            </p>
            {(searchTerm || activeTab !== 'All') ? (
              <button 
                onClick={() => { setActiveTab('All'); setSearchTerm(''); }}
                className="mt-4 text-sm text-orange-600 font-bold hover:text-orange-700"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/search-vehicles"
                className="inline-flex mt-4 items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm"
              >
                Book a Vehicle Now
              </Link>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const seatsList = parseSeats(booking.seats);
            return (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* ID & Date */}
                  <div className="w-full md:w-1/4">
                    <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                      <span className="font-extrabold text-orange-600 tracking-wide">{booking.bookingId}</span>
                      <span className={`md:hidden px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 font-medium">
                      <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                      {booking.travelDate}
                    </div>
                  </div>

                  {/* Route & Vehicle */}
                  <div className="w-full md:w-2/4">
                    <h4 className="font-bold text-gray-900 mb-1">{booking.vehicleName || 'Vehicle'}</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1.5 shrink-0 text-orange-500" />
                      <span className="truncate">{booking.pickupLocation}</span>
                      <ArrowRight className="w-4 h-4 mx-2 shrink-0 text-gray-400" />
                      <span className="truncate">{booking.dropLocation}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {seatsList.length > 0 ? (
                        seatsList.map((seat: string) => (
                          <span key={seat} className="px-2 py-0.5 bg-orange-50 border border-orange-200 rounded text-xs font-semibold text-orange-800">
                            Seat {seat}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Seats assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="w-full md:w-1/4 md:text-right flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">₹{booking.totalAmount?.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Paid: ₹{booking.paidAmount || 0} | Due: ₹{booking.remainingAmount || 0}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`hidden md:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions Footer */}
                <div className="bg-gray-50/70 px-5 py-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                  {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="flex items-center text-xs font-semibold text-red-600 hover:text-red-700 bg-white px-3 py-1.5 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                  <button 
                    onClick={() => generateBookingReceipt(booking)}
                    className="flex items-center text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white px-3 py-1.5 border border-gray-200 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-gray-500" />
                    Download Receipt
                  </button>
                  <Link 
                    to={`/my-bookings/${booking.id}`}
                    className="flex items-center text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
