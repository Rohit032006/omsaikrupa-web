import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Printer, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../services/api';
import { generateBookingReceipt } from '../../utils/pdfReceipt';
import { exportToCSV } from '../../utils/helpers';

interface BookingRecord {
  id: string;
  bookingId: string;
  userName?: string;
  name?: string;
  userMobile?: string;
  mobile?: string;
  vehicleName?: string;
  vehicleNumber?: string;
  capacity?: number;
  travelDate: string;
  pickupLocation: string;
  dropLocation: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  seats?: any;
}

const AdminBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getAll();
      setBookings(res.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'CANCELLED') {
        await bookingApi.cancel(id);
      } else {
        await bookingApi.updateStatus(id, newStatus);
      }
      toast.success(`Booking status updated to ${newStatus}`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update booking status');
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error('No booking data to export');
      return;
    }
    const dataToExport = bookings.map(b => ({
      'Booking ID': b.bookingId,
      'Customer': b.userName || b.name || 'User',
      'Mobile': b.userMobile || b.mobile || '-',
      'Vehicle': b.vehicleName || 'Vehicle',
      'Travel Date': b.travelDate,
      'Pickup': b.pickupLocation,
      'Drop': b.dropLocation,
      'Total Amount': b.totalAmount,
      'Paid Amount': b.paidAmount || 0,
      'Balance': b.remainingAmount || 0,
      'Payment Status': b.paymentStatus,
      'Booking Status': b.bookingStatus,
    }));
    exportToCSV(dataToExport, `om_sai_krupa_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Bookings exported to CSV');
  };

  const filteredBookings = bookings.filter(booking => {
    const status = (booking.bookingStatus || '').toLowerCase();
    const matchesFilter = statusFilter === 'All' || status === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      (booking.bookingId || '').toLowerCase().includes(query) ||
      (booking.userName || booking.name || '').toLowerCase().includes(query) ||
      (booking.userMobile || booking.mobile || '').toLowerCase().includes(query) ||
      (booking.vehicleName || '').toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage All Bookings</h1>
          <p className="text-xs text-gray-500">View and update real customer bookings stored in the database.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5 text-gray-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs border-b border-gray-100">
                <th className="p-3.5 font-bold">Booking ID</th>
                <th className="p-3.5 font-bold">Customer</th>
                <th className="p-3.5 font-bold">Vehicle / Date</th>
                <th className="p-3.5 font-bold text-right">Amount</th>
                <th className="p-3.5 font-bold">Payment</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                    Loading real bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-400">
                    No bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 text-xs transition-colors">
                    <td className="p-3.5 font-bold text-orange-600">
                      <Link to={`/admin/bookings/${booking.id}`}>{booking.bookingId}</Link>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{booking.userName || booking.name || 'User'}</div>
                      <div className="text-[11px] text-gray-500">{booking.userMobile || booking.mobile || '-'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-gray-800">{booking.vehicleName || 'Vehicle'}</div>
                      <div className="text-[11px] text-gray-500">{booking.travelDate}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-orange-700 font-medium">Bal: ₹{booking.remainingAmount || 0}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        booking.paymentStatus === 'PARTIAL' || booking.paymentStatus === 'PARTIALLY_PAID' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        <Link 
                          to={`/admin/bookings/${booking.id}`} 
                          className="p-1 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {booking.bookingStatus === 'PENDING' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg" 
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {booking.bookingStatus !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg" 
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => generateBookingReceipt(booking)}
                          className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100" 
                          title="Download PDF Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Showing {filteredBookings.length} total entries from database</div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
