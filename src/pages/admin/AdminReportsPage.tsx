import { useState, useEffect } from 'react';
import { Download, Calendar as CalendarIcon, TrendingUp, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportApi, bookingApi } from '../../services/api';
import { exportToCSV } from '../../utils/helpers';

const AdminReportsPage = () => {
  const [period, setPeriod] = useState('Monthly');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [vehicleStats, setVehicleStats] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [revRes, vehRes, statRes] = await Promise.all([
        reportApi.getRevenue(period.toLowerCase()).catch(() => ({ data: { totalRevenue: 0, items: [] } })),
        reportApi.getVehicles().catch(() => ({ data: [] })),
        bookingApi.getStats().catch(() => ({ data: {} })),
      ]);
      setRevenueData(revRes.data);
      setVehicleStats(vehRes.data || []);
      setBookingStats(statRes.data || {});
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExport = () => {
    if (!vehicleStats.length && !revenueData?.items?.length) {
      toast.error('No report data to export');
      return;
    }
    const data = vehicleStats.map(v => ({
      'Vehicle': v.vehicleName,
      'Capacity': `${v.capacity} Seats`,
      'Total Trips': v.totalTrips || 0,
      'Revenue Generated': `₹${v.revenue || 0}`,
      'Status': v.status,
    }));
    exportToCSV(data, `om_sai_travels_report_${period.toLowerCase()}.csv`);
    toast.success('Report downloaded as CSV');
  };

  const totalRevenue = bookingStats?.totalRevenue || revenueData?.totalRevenue || 0;
  const completedTrips = vehicleStats.reduce((sum, v) => sum + (Number(v.totalTrips) || 0), 0);
  const activeVehicles = vehicleStats.filter(v => v.status === 'AVAILABLE' || v.status === 'ON_TRIP').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Fleet Analytics</h1>
          <p className="text-xs text-gray-500">Live operational and revenue data from your database.</p>
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {['Daily', 'Weekly', 'Monthly'].map(p => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  period === p ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5 text-gray-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500">Total System Revenue</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-[11px] text-green-700 mt-3 font-semibold">
            Based on confirmed database payments
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{bookingStats?.totalBookings ?? 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-[11px] text-blue-700 mt-3 font-semibold">
            {bookingStats?.todayBookings ?? 0} booked today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500">Active Fleet</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeVehicles} Vehicles</h3>
            </div>
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <Car className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-[11px] text-orange-700 mt-3 font-semibold">
            Ready for passenger allocation
          </p>
        </div>
      </div>

      {/* Vehicle Fleet Utilization */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Vehicle Utilization & Revenue Breakdown</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real vehicle trip records and utilization metrics.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Plate Number</th>
                <th className="p-3.5">Capacity</th>
                <th className="p-3.5">Base Fare</th>
                <th className="p-3.5">Total Trips</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading fleet metrics...</td>
                </tr>
              ) : vehicleStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No vehicle data available.</td>
                </tr>
              ) : (
                vehicleStats.map((v, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">{v.vehicleName}</td>
                    <td className="p-3.5 font-mono text-gray-700 font-semibold">{v.vehicleNumber}</td>
                    <td className="p-3.5 font-medium text-orange-600">{v.capacity} Seater</td>
                    <td className="p-3.5 font-bold text-gray-800">₹{v.baseFare?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-bold text-gray-900">{v.totalTrips || 0}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        v.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {v.status}
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
  );
};

export default AdminReportsPage;
