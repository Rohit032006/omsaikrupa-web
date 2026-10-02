import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  CreditCard, 
  Clock, 
  ArrowRight,
  ChevronRight,
  Bell,
  Search,
  Phone
} from 'lucide-react';
import { bookingApi, notificationApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface Booking {
  id: string;
  bookingId: string;
  travelDate: string;
  vehicleName: string;
  pickupLocation: string;
  dropLocation: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: number;
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, notifsRes] = await Promise.all([
          bookingApi.getAll().catch(() => ({ data: [] })),
          notificationApi.getAll().catch(() => ({ data: [] }))
        ]);
        if (isMounted) {
          setBookings(bookingsRes?.data || []);
          setNotifications(notifsRes?.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const totalBookings = bookings.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTrips = bookings.filter(
    (b) => b.travelDate >= todayStr && b.bookingStatus !== 'CANCELLED'
  ).length;
  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const pendingPayments = bookings.reduce((sum, b) => sum + (Number(b.remainingAmount) || 0), 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Customer'}! 👋
          </h1>
          <p className="text-gray-500">Here's a live overview of your bookings and trips.</p>
        </div>
        <Link 
          to="/search-vehicles" 
          className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-sm font-medium"
        >
          <Search className="w-4 h-4 mr-2" />
          Book a Vehicle
        </Link>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Trips</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{upcomingTrips}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{pendingPayments.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Booking Card */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-orange-950 mb-1">Book your next journey</h3>
            <p className="text-orange-800 text-sm mb-4">Select vehicle, pick your favorite seat and pay easily via UPI.</p>
            <Link 
              to="/search-vehicles"
              className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-sm font-medium text-sm"
            >
              Start New Booking <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
              <Link to="/my-bookings" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center">
                View All ({bookings.length}) <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trip</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        Loading your bookings...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Car className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-sm font-semibold text-gray-900">No bookings yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Book your first vehicle ride with Om Sai Travels.</p>
                        <div className="mt-4">
                          <Link
                            to="/search-vehicles"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700"
                          >
                            <Search className="w-4 h-4 mr-2" /> Search Vehicles
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{booking.bookingId}</div>
                          <div className="text-xs text-gray-500">{booking.travelDate}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{booking.vehicleName || 'Vehicle'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{booking.pickupLocation}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span>{booking.dropLocation}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString('en-IN')}</div>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link 
                            to={`/my-bookings/${booking.id}`} 
                            className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Notifications & Support */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center">
                <Bell className="w-4 h-4 mr-2 text-orange-600" /> Notifications
              </h2>
              <Link to="/notifications" className="text-xs text-orange-600 hover:text-orange-700 font-semibold">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">No new notifications</p>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-xl text-left">
                    <p className="text-xs font-bold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-md p-6 text-white">
            <h3 className="text-lg font-bold mb-1">Need Assistance?</h3>
            <p className="text-orange-100 text-xs mb-4">
              Our 24/7 helpline is ready to assist you for immediate booking support or cancellations.
            </p>
            <a 
              href="tel:+918080959502"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" /> Call +91 8080959502
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
