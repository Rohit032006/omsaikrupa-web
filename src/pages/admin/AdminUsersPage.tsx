import { useState, useEffect } from 'react';
import { Search, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../services/api';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt: string;
  totalBookings?: number;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserRecord) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    if (!window.confirm(`Are you sure you want to mark ${user.name} as ${newStatus}?`)) return;

    try {
      await userApi.updateStatus(user.id, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update user status');
    }
  };

  const filtered = users.filter(u => {
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.mobile.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
        <p className="text-xs text-gray-500">Live database of customers and administrators.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="All">All Users ({users.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading registered users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{user.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{user.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-gray-800">{user.mobile}</div>
                      <div className="text-[11px] text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            user.status === 'BLOCKED' 
                              ? 'text-green-700 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={user.status === 'BLOCKED' ? 'Unblock User' : 'Block User'}
                        >
                          {user.status === 'BLOCKED' ? (
                            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Unblock</span>
                          ) : (
                            <span className="flex items-center gap-1"><ShieldOff className="w-3.5 h-3.5" /> Block</span>
                          )}
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

export default AdminUsersPage;
