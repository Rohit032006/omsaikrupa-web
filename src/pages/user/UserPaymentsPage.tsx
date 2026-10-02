import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../services/api';

export default function UserPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUserPayments = async () => {
      try {
        setLoading(true);
        const res = await bookingApi.getAll().catch(() => ({ data: [] }));
        const allBookings = res.data || [];
        // Extract all payments from user's bookings
        const extracted: any[] = [];
        allBookings.forEach((b: any) => {
          if (b.payments && Array.isArray(b.payments)) {
            b.payments.forEach((p: any) => {
              extracted.push({
                ...p,
                bookingId: b.bookingId,
                internalBookingId: b.id,
                vehicleName: b.vehicleName,
                totalAmount: b.totalAmount,
                travelDate: b.travelDate,
                pickupLocation: b.pickupLocation,
                dropLocation: b.dropLocation,
              });
            });
          }
        });
        setPayments(extracted);
      } catch (err) {
        console.error('Failed to load user payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPayments();
  }, []);

  const totalPaid = payments
    .filter(p => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingVerification = payments
    .filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.bookingId || '').toLowerCase().includes(q) ||
      (p.utrNumber || p.transactionId || '').toLowerCase().includes(q) ||
      (p.vehicleName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment History & Transactions</h1>
        <p className="text-xs text-gray-500">Track all your UPI and transfer payments made for vehicle bookings.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Verified Payments</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Under Admin Verification</p>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-0.5">₹{pendingVerification.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by UTR or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold">{filtered.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-3.5">Booking</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">UTR / Transaction ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading your transactions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No payment transactions found</p>
                    <p className="text-[11px] text-gray-400 mt-1">When you pay for a booking, transaction records will appear here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-orange-600">{item.bookingId}</div>
                      <div className="text-[11px] text-gray-500">{item.vehicleName || 'Vehicle'}</div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900 text-sm">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-700">{item.method || 'UPI'}</td>
                    <td className="p-3.5 font-mono text-gray-800 font-semibold">{item.utrNumber || item.transactionId || '-'}</td>
                    <td className="p-3.5 text-gray-500">
                      {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        item.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/my-bookings/${item.internalBookingId}`}
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-bold gap-1 text-[11px]"
                      >
                        View <ExternalLink className="w-3 h-3" />
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
  );
}
