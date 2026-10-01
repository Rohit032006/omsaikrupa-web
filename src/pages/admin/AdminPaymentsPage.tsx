import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '../../services/api';

interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingRef?: string;
  userName?: string;
  amount: number;
  method: string;
  utrNumber?: string;
  transactionId?: string;
  paymentDate?: string;
  createdAt: string;
  status: string;
}

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAll();
      setPayments(res.data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      setProcessingId(id);
      await paymentApi.verify(id);
      toast.success('Payment verified & confirmed!');
      fetchPayments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Reject this payment submission?')) return;
    try {
      setProcessingId(id);
      await paymentApi.reject(id);
      toast.success('Payment rejected');
      fetchPayments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const verifiedTotal = payments
    .filter(p => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingTotal = payments
    .filter(p => p.status === 'SUBMITTED' || p.status === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filtered = payments.filter(p => {
    const matchesTab = activeTab === 'All' || p.status.toUpperCase() === activeTab.toUpperCase();
    const q = search.toLowerCase();
    const matchesSearch = 
      (p.id || '').toLowerCase().includes(q) ||
      (p.bookingRef || p.bookingId || '').toLowerCase().includes(q) ||
      (p.utrNumber || p.transactionId || '').toLowerCase().includes(q) ||
      (p.userName || '').toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Payment Transactions</h1>
        <p className="text-xs text-gray-500">Verify customer UPI / Bank transfer payments.</p>
      </div>

      {/* Real Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500">Total Payments Recorded</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">₹{totalReceived.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-emerald-700">Verified & Approved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{verifiedTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-orange-700">Pending Verification</p>
          <p className="text-2xl font-extrabold text-orange-600 mt-1">₹{pendingTotal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <div className="flex overflow-x-auto w-full sm:w-auto gap-1">
            {['All', 'Submitted', 'Verified', 'Rejected', 'Pending'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by UTR or Booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-3.5">Booking</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">UTR / Reference</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Loading payment submissions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">No payment submissions found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-orange-600">{item.bookingRef || item.bookingId}</div>
                      <div className="text-[11px] text-gray-500">{item.userName || 'User'}</div>
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
                    <td className="p-3.5 text-center">
                      {item.status === 'SUBMITTED' || item.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleVerify(item.id)}
                            disabled={processingId === item.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={processingId === item.id}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium">Processed</span>
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

export default AdminPaymentsPage;
