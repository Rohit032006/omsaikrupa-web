import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, CreditCard, 
  IndianRupee, Users, Car, Map, Eye, XCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        bookingApi.getStats(),
        bookingApi.getAll(),
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'CANCELLED') {
        await bookingApi.cancel(id);
      } else {
        await bookingApi.updateStatus(id, newStatus);
      }
      toast.success(`Booking marked as ${newStatus}`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Loading live admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Live system statistics from your database.</p>
        </div>
        <div className="text-xs text-gray-400">
          Last refreshed: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<Calendar className="w-6 h-6 text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Today's Bookings" value={stats?.todayBookings ?? 0} icon={<Clock className="w-6 h-6 text-orange-600" />} color="bg-orange-50" />
        <StatCard title="Upcoming Trips" value={stats?.upcomingTrips ?? 0} icon={<Map className="w-6 h-6 text-green-600" />} color="bg-green-50" />
        <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} icon={<IndianRupee className="w-6 h-6 text-yellow-600" />} color="bg-yellow-50" />
        <StatCard title="Pending Payments" value={`₹${(stats?.pendingPayments ?? 0).toLocaleString('en-IN')}`} icon={<CreditCard className="w-6 h-6 text-red-600" />} color="bg-red-50" />
        <StatCard title="Registered Users" value={stats?.totalUsers ?? 0} icon={<Users className="w-6 h-6 text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Available Vehicles" value={stats?.availableVehicles ?? 0} icon={<Car className="w-6 h-6 text-teal-600" />} color="bg-teal-50" />
        <StatCard title="Vehicles on Trip" value={stats?.vehiclesOnTrip ?? 0} icon={<Car className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Fleet & Trips Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-gray-900">Fleet Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-semibold text-gray-600">Total Fleet Vehicles</span>
              <span className="text-sm font-bold text-gray-900">
                {(stats?.availableVehicles ?? 0) + (stats?.vehiclesOnTrip ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-xs font-semibold text-emerald-800">Ready for Booking</span>
              <span className="text-sm font-bold text-emerald-800">{stats?.availableVehicles ?? 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-xs font-semibold text-blue-800">Currently on Trip</span>
              <span className="text-sm font-bold text-blue-800">{stats?.vehiclesOnTrip ?? 0}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/vehicles"
              className="w-full flex items-center justify-center py-2.5 px-4 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              Manage Fleet & Vehicles →
            </Link>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Real Bookings</h2>
            <Link to="/admin/bookings" className="text-orange-600 text-xs font-bold hover:underline">
              View All ({recentBookings.length})
            </Link>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs border-b border-gray-100">
                <th className="p-3 font-semibold">Booking ID</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Vehicle</th>
                <th className="p-3 font-semibold">Travel Date</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-gray-400">
                    No bookings created yet.
                  </td>
                </tr>
              ) : (
                recentBookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 text-xs transition-colors">
                    <td className="p-3 text-orange-600 font-bold">{booking.bookingId}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{booking.userName || booking.name || 'User'}</div>
                      <div className="text-[11px] text-gray-500">{booking.userMobile || booking.mobile || '-'}</div>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">{booking.vehicleName || 'Vehicle'}</td>
                    <td className="p-3 text-gray-600">{booking.travelDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        booking.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3 flex items-center justify-end space-x-1.5">
                      <Link 
                        to={`/admin/bookings/${booking.id}`} 
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg" 
                        title="View Full Booking"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {booking.bookingStatus === 'PENDING' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" 
                          title="Confirm Booking"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {booking.bookingStatus !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" 
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{value}</h3>
    </div>
  </div>
);

export default AdminDashboard;
