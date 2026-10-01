import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  CalendarDays, 
  Users, 
  UserCheck, 
  Map, 
  CreditCard,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuthStore } from '../../store/authStore';


export const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Vehicles', path: '/admin/vehicles', icon: Car },
    { name: 'Drivers', path: '/admin/drivers', icon: UserCheck },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link to="/admin" className="flex items-center space-x-2">
          <Logo size="sm" />
        </Link>
        <div className="mt-4 bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center uppercase tracking-wider">
          <ShieldCheck size={14} className="mr-2 text-emerald-400" />
          Admin Portal
        </div>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-3 px-2 mb-4">
          <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white fixed h-full z-20 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-slate-900 text-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-0 right-0 -mr-12 pt-4">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none bg-slate-800 hover:bg-slate-700 shadow-md"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} className="text-white" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10 h-16 flex items-center px-4 shadow-sm">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="text-slate-600 hover:text-slate-900 focus:outline-none mr-4 p-2 rounded-md hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck size={20} className="text-blue-600" />
            <span className="font-bold text-slate-800">Admin Portal</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
