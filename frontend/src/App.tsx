
import { lazy } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';


// Layout & Common
const Layout = lazy(() => import('./components/Layout/Layout'));
const ProtectedRoute = lazy(() => import('./components/Common/ProtectedRoute'));
const BatchUpload = lazy(() => import('./components/Common/BatchUpload'));
const SOSReports = lazy(() => import('./components/Common/SOSReports'));
const IncidentReports = lazy(() => import('./components/Common/IncidentReports'));
const ContactForm = lazy(() => import('./components/Contact/ContactForm'));

// Auth
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));

// Dashboard
const UserDashboard = lazy(() => import('./components/Dashboard/UserDashboard'));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'));

// Features
import BusTracking from './components/BusTracking/BusTracking';
const FeedbackForm = lazy(() => import('./components/Feedback/FeedbackForm'));
const LostFound = lazy(() => import('./components/Lost and Found/LostFound'));
const AdminLostFound = lazy(() => import('./components/Lost and Found/AdminLostFound'));
const AdminUsers = lazy(() => import('./components/Admin/AdminUsers'));
const BusManagement = lazy(() => import('./components/Admin/BusManagement'));
const FeedbackManagement = lazy(() => import('./components/Feedback/FeedbackManagement'));
const ProfilePage = lazy(() => import('./components/Profile/ProfilePage'));

const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.default })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.default })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.default })));
const RewardPage = lazy(() => import('./components/Reward/RewardPage').then(m => ({ default: m.default })));
const Hero = lazy(() => import('./components/HomePage/Hero').then(m => ({ default: m.default })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.default })));

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
};



const LazyLoadComponent = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>
  }>
    {children}
  </React.Suspense>
);


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <LazyLoadComponent>
                <Hero />
              </LazyLoadComponent>
            } />
            <Route path="/login" element={<LazyLoadComponent><Login /></LazyLoadComponent>} />
            <Route path="/register" element={<LazyLoadComponent><Register /></LazyLoadComponent>} />
            <Route path="/reset-password" element={<LazyLoadComponent><ResetPassword /></LazyLoadComponent>} />
            <Route path="/about" element={
              <LazyLoadComponent>
                <About />
              </LazyLoadComponent>
            } />
            <Route path="/contact" element={
              <LazyLoadComponent>
                <Contact />
              </LazyLoadComponent>
            } />
            <Route path="/privacy" element={
              <LazyLoadComponent>
                <Privacy />
              </LazyLoadComponent>
            } />
            <Route path="/faq" element={
              <LazyLoadComponent>
                <FAQ />
              </LazyLoadComponent>
            } />
            {/* Protected Routes with Layout */}
            <Route element={<LazyLoadComponent><ProtectedRoute><Layout /></ProtectedRoute></LazyLoadComponent>}>
              <Route path="dashboard" element={<LazyLoadComponent><DashboardRedirect /></LazyLoadComponent>} />
              <Route path="contact-form" element={<LazyLoadComponent><ContactForm /></LazyLoadComponent>} />
              <Route path="tracking" element={<BusTracking />} />
              <Route path="feedback" element={<LazyLoadComponent><FeedbackForm /></LazyLoadComponent>} />
              <Route path="lost-found" element={<LazyLoadComponent><LostFound /></LazyLoadComponent>} />
              <Route path="rewards" element={<LazyLoadComponent><RewardPage /></LazyLoadComponent>} />
              <Route path="profile" element={<LazyLoadComponent><ProfilePage /></LazyLoadComponent>} />

              {/* Admin Routes */}
              <Route path="admin" element={<LazyLoadComponent><ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/users" element={<LazyLoadComponent><ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/feedback" element={<LazyLoadComponent><ProtectedRoute requireAdmin><FeedbackManagement /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/lost-found" element={<LazyLoadComponent><ProtectedRoute requireAdmin><AdminLostFound /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/buses" element={<LazyLoadComponent><ProtectedRoute requireAdmin><BusManagement /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/sos-reports" element={<LazyLoadComponent><ProtectedRoute requireAdmin><SOSReports /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/incident-reports" element={<LazyLoadComponent><ProtectedRoute requireAdmin><IncidentReports /></ProtectedRoute></LazyLoadComponent>} />
              <Route path="admin/batch-upload" element={<LazyLoadComponent><ProtectedRoute requireAdmin><BatchUpload /></ProtectedRoute></LazyLoadComponent>} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #333)',
                border: '1px solid var(--toast-border, #e5e7eb)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;