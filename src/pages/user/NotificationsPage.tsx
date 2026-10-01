import { useState, useEffect } from 'react';
import { Bell, CreditCard, Car, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../../services/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: number;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: 1 } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const getIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('booking')) return <Car className="w-5 h-5 text-orange-600" />;
    if (t.includes('payment')) return <CreditCard className="w-5 h-5 text-green-600" />;
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  const getIconBg = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('booking')) return 'bg-orange-100';
    if (t.includes('payment')) return 'bg-green-100';
    return 'bg-blue-100';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time status updates on your bookings, payments and trips.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center px-4 py-2 text-xs font-bold text-orange-700 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
             <p className="text-xs text-gray-400 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No notifications</h3>
            <p className="text-xs text-gray-400 mt-1">When you make a booking or payment, updates will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer ${!notification.isRead ? 'bg-orange-50/30' : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-4 items-start">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0 self-center pl-2">
                      <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" title="Unread"></div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
