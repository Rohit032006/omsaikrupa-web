import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/Layout/PublicLayout';
import { UserLayout } from './components/Layout/UserLayout';
import { AdminLayout } from './components/Layout/AdminLayout';
import { useAuthStore } from './store/authStore';

// Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const VehiclesPage = lazy(() => import('./pages/public/VehiclesPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage'));

// User pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const SearchVehiclesPage = lazy(() => import('./pages/user/SearchVehiclesPage'));
const SeatSelectionPage = lazy(() => import('./pages/user/SeatSelectionPage'));
const PassengerDetailsPage = lazy(() => import('./pages/user/PassengerDetailsPage'));
const BookingReviewPage = lazy(() => import('./pages/user/BookingReviewPage'));
const PaymentPage = lazy(() => import('./pages/user/PaymentPage'));
const BookingConfirmationPage = lazy(() => import('./pages/user/BookingConfirmationPage'));
const MyBookingsPage = lazy(() => import('./pages/user/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/user/BookingDetailPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/user/NotificationsPage'));
const UserPaymentsPage = lazy(() => import('./pages/user/UserPaymentsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminBookingDetailPage = lazy(() => import('./pages/admin/AdminBookingDetailPage'));
const AdminVehiclesPage = lazy(() => import('./pages/admin/AdminVehiclesPage'));
const AdminDriversPage = lazy(() => import('./pages/admin/AdminDriversPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const NotificationsPageAdmin = lazy(() => import('./pages/user/NotificationsPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#ea580c', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth Routes (no nav/footer layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* User Routes */}
          <Route element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
            <Route path="/payments" element={<UserPaymentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Booking Flow - outside UserLayout for full-screen experience */}
          <Route path="/search-vehicles" element={
            <ProtectedRoute>
              <SearchVehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/book/seats" element={
            <ProtectedRoute>
              <SeatSelectionPage />
            </ProtectedRoute>
          } />
          <Route path="/book/passengers" element={
            <ProtectedRoute>
              <PassengerDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/book/review" element={
            <ProtectedRoute>
              <BookingReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/book/payment/:bookingId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/booking-confirmation/:bookingId" element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="bookings/:id" element={<AdminBookingDetailPage />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
            <Route path="drivers" element={<AdminDriversPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="notifications" element={<NotificationsPageAdmin />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
