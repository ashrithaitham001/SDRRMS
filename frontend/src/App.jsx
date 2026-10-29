import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from './pages/DashboardPage';

// Requests
import ReliefRequestsPage from './pages/requests/ReliefRequestsPage';
import SubmitRequestPage from './pages/requests/SubmitRequestPage';
import RequestDetailsPage from './pages/requests/RequestDetailsPage';

// Resources
import ResourcesPage from './pages/resources/ResourcesPage';
import AddEditResourcePage from './pages/resources/AddEditResourcePage';
import ResourceTransactionsPage from './pages/resources/ResourceTransactionsPage';

// Volunteers
import VolunteersPage from './pages/volunteers/VolunteersPage';
import VolunteerAssignmentsPage from './pages/volunteers/VolunteerAssignmentsPage';

// Missions
import MissionsPage from './pages/missions/MissionsPage';

// Disasters
import DisastersPage from './pages/disasters/DisastersPage';

// Donations
import DonationsPage from './pages/donations/DonationsPage';
import NewDonationPage from './pages/donations/NewDonationPage';

// Alerts
import AlertsPage from './pages/alerts/AlertsPage';

// Hospitals
import HospitalsPage from './pages/hospitals/HospitalsPage';
import AmbulanceRequestsPage from './pages/hospitals/AmbulanceRequestsPage';

// Map
import MapPage from './pages/MapPage';

// SOS
import SOSPage from './pages/SOSPage';

// Profile
import UserProfilePage from './pages/profile/UserProfilePage';

// Admin
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Error pages
import AccessDeniedPage from './pages/errors/AccessDeniedPage';
import NotFoundPage from './pages/errors/NotFoundPage';

import { ROLES } from './utils/constants';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/sos" element={<SOSPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Protected routes inside dashboard layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Relief Requests */}
        <Route path="/requests" element={<ReliefRequestsPage />} />
        <Route path="/requests/my" element={<ReliefRequestsPage myOnly />} />
        <Route path="/requests/new" element={<SubmitRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailsPage />} />

        {/* Resources */}
        <Route path="/resources" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE]}>
            <ResourcesPage />
          </ProtectedRoute>
        } />
        <Route path="/resources/new" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE]}>
            <AddEditResourcePage />
          </ProtectedRoute>
        } />
        <Route path="/resources/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE]}>
            <AddEditResourcePage />
          </ProtectedRoute>
        } />
        <Route path="/resources/transactions" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE]}>
            <ResourceTransactionsPage />
          </ProtectedRoute>
        } />

        {/* Volunteers */}
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/volunteers/assignments" element={
          <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]}>
            <VolunteerAssignmentsPage />
          </ProtectedRoute>
        } />

        {/* Missions */}
        <Route path="/missions" element={<MissionsPage />} />

        {/* Disasters */}
        <Route path="/disasters" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.GOV_OFFICIAL]}>
            <DisastersPage />
          </ProtectedRoute>
        } />

        {/* Donations */}
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/donations/my" element={<DonationsPage myOnly />} />
        <Route path="/donations/new" element={<NewDonationPage />} />

        {/* Alerts */}
        <Route path="/alerts" element={<AlertsPage />} />

        {/* Map */}
        <Route path="/map" element={<MapPage />} />

        {/* Hospitals */}
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/ambulance" element={<AmbulanceRequestsPage />} />

        {/* Profile */}
        <Route path="/profile" element={<UserProfilePage />} />

        {/* Admin */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
