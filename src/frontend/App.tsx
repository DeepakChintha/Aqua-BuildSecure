import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { AppShell } from './components/shell'
import { LoginPage, RegisterPage, UtilityAuthPage } from './pages/auth'
import { DashboardPage } from './pages/dashboards'
import { AdminManagementPage, AppointmentsPage, BookingPage, DoctorProfilePage, DoctorsPage, HealthPage, LabsPage, MessagesPage, NotificationsPage, PrescriptionsPage, RecordsPage, SettingsPage } from './pages/workspace'
import type { Role } from './types'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function RoleRoute({ role }: { role: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  return <AppShell><Outlet /></AppShell>
}

function NotFound() {
  return <div className="not-found"><span className="eyebrow">404 / Page not found</span><h2>That page is not in your care plan.</h2><p>Use the navigation to return to your workspace.</p><a className="btn btn-primary" href="/login">Return to MEDIDESK</a></div>
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<UtilityAuthPage mode="forgot" />} />
    <Route path="/reset-password" element={<UtilityAuthPage mode="reset" />} />
    <Route path="/verify-email" element={<UtilityAuthPage mode="verify" />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/patient" element={<RoleRoute role="patient" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage role="patient" />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorProfilePage />} />
        <Route path="appointments" element={<AppointmentsPage role="patient" />} />
        <Route path="book-appointment" element={<BookingPage />} />
        <Route path="medical-records" element={<RecordsPage role="patient" />} />
        <Route path="prescriptions" element={<PrescriptionsPage role="patient" />} />
        <Route path="lab-reports" element={<LabsPage role="patient" />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage role="patient" />} />
      </Route>
      <Route path="/doctor" element={<RoleRoute role="doctor" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage role="doctor" />} />
        <Route path="appointments" element={<AppointmentsPage role="doctor" />} />
        <Route path="appointments/:id" element={<AppointmentsPage role="doctor" />} />
        <Route path="patients" element={<RecordsPage role="doctor" />} />
        <Route path="patients/:id" element={<RecordsPage role="doctor" />} />
        <Route path="medical-records" element={<RecordsPage role="doctor" />} />
        <Route path="prescriptions" element={<PrescriptionsPage role="doctor" />} />
        <Route path="lab-reports" element={<LabsPage role="doctor" />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="available-timings" element={<SettingsPage role="doctor" />} />
        <Route path="reviews" element={<DoctorsPage />} />
        <Route path="earnings" element={<AdminManagementPage />} />
        <Route path="settings" element={<SettingsPage role="doctor" />} />
      </Route>
      <Route path="/admin" element={<RoleRoute role="admin" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage role="admin" />} />
        <Route path="doctors" element={<AdminManagementPage />} />
        <Route path="patients" element={<AdminManagementPage />} />
        <Route path="staff" element={<AdminManagementPage />} />
        <Route path="appointments" element={<AdminManagementPage />} />
        <Route path="hospital" element={<AdminManagementPage />} />
        <Route path="departments" element={<AdminManagementPage />} />
        <Route path="beds" element={<AdminManagementPage />} />
        <Route path="revenue" element={<AdminManagementPage />} />
        <Route path="analytics" element={<AdminManagementPage />} />
        <Route path="reports" element={<AdminManagementPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage role="admin" />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
}
