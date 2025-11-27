import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ExperienceProvider } from './providers/ExperienceProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import CallbackPage from './pages/auth/CallbackPage';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import ProviderLayout from './layouts/ProviderLayout';
import CustomerLayout from './layouts/CustomerLayout';
import PSMLayout from './layouts/PSMLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages - Service Operator (default) Experience
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ServiceOrdersPage from './pages/service-orders/ServiceOrdersPage';
import ServiceOrderDetailPage from './pages/service-orders/ServiceOrderDetailPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import ProvidersPage from './pages/providers/ProvidersPage';
import CreateProviderPage from './pages/providers/CreateProviderPage';
import CalendarPage from './pages/calendar/CalendarPage';
import TasksPage from './pages/tasks/TasksPage';
import PerformanceDashboardPage from './pages/performance/PerformanceDashboardPage';
import { OperationsGridPage } from './pages/operations';
import NotFoundPage from './pages/NotFoundPage';

// Provider Portal Pages
import {
  ProviderDashboardPage,
  ProviderJobsPage,
  ProviderTeamsPage,
  ProviderFinancialPage,
} from './pages/provider';

// Customer Portal Pages
import {
  CustomerStatusPage,
  CustomerSchedulePage,
  CustomerContractPage,
  CustomerPhotosPage,
  CustomerWCFPage,
  CustomerEvaluatePage,
} from './pages/customer';

// PSM Portal Pages
import {
  PSMDashboardPage,
  PSMPipelinePage,
  PSMProvidersPage,
  PSMCoveragePage,
} from './pages/psm';

// Seller Portal Pages
import {
  SellerDashboardPage,
  SellerAvailabilityPage,
  SellerTVReportPage,
} from './pages/seller';

// Admin Portal Pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminConfigPage,
} from './pages/admin';

// Offer Manager / Catalog Pages
import {
  OfferManagerServicesPage,
  OfferManagerPricingPage,
  OfferManagerChecklistsPage,
} from './pages/catalog';

// Placeholder for pages not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500 mt-2">Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ExperienceProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* ============================================================ */}
          {/* SERVICE OPERATOR / CONTROL TOWER (default experience) */}
          {/* ============================================================ */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="operations-grid" element={<OperationsGridPage />} />
            <Route path="service-orders" element={<ServiceOrdersPage />} />
            <Route path="service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="assignments/:id" element={<AssignmentDetailPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="providers/new" element={<CreateProviderPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="performance" element={<PerformanceDashboardPage />} />
          </Route>

          {/* ============================================================ */}
          {/* PROVIDER PORTAL */}
          {/* ============================================================ */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                <ProviderLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/provider/dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboardPage />} />
            <Route path="jobs" element={<ProviderJobsPage />} />
            <Route path="jobs/:id" element={<PlaceholderPage title="Job Details" />} />
            <Route path="calendar" element={<PlaceholderPage title="Provider Calendar" />} />
            <Route path="teams" element={<ProviderTeamsPage />} />
            <Route path="teams/:id" element={<PlaceholderPage title="Team Details" />} />
            <Route path="financial" element={<ProviderFinancialPage />} />
            <Route path="performance" element={<PlaceholderPage title="Provider Performance" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>

          {/* ============================================================ */}
          {/* CUSTOMER PORTAL (deep-link authenticated) */}
          {/* ============================================================ */}
          <Route path="/customer/:token" element={<CustomerLayout />}>
            <Route index element={<Navigate to="status" replace />} />
            <Route path="status" element={<CustomerStatusPage />} />
            <Route path="schedule" element={<CustomerSchedulePage />} />
            <Route path="contract" element={<CustomerContractPage />} />
            <Route path="photos" element={<CustomerPhotosPage />} />
            <Route path="wcf" element={<CustomerWCFPage />} />
            <Route path="evaluate" element={<CustomerEvaluatePage />} />
          </Route>

          {/* ============================================================ */}
          {/* PSM (Provider Success Manager) PORTAL */}
          {/* ============================================================ */}
          <Route
            path="/psm"
            element={
              <ProtectedRoute>
                <PSMLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/psm/dashboard" replace />} />
            <Route path="dashboard" element={<PSMDashboardPage />} />
            <Route path="pipeline" element={<PSMPipelinePage />} />
            <Route path="providers" element={<PSMProvidersPage />} />
            <Route path="providers/:id" element={<PlaceholderPage title="Provider Details" />} />
            <Route path="coverage" element={<PSMCoveragePage />} />
            <Route path="verification" element={<PlaceholderPage title="Document Verification" />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* ============================================================ */}
          {/* SELLER PORTAL */}
          {/* ============================================================ */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="availability" element={<SellerAvailabilityPage />} />
            <Route path="projects" element={<PlaceholderPage title="Customer Projects" />} />
            <Route path="projects/:id" element={<PlaceholderPage title="Project Details" />} />
            <Route path="reports" element={<SellerTVReportPage />} />
            <Route path="reports/:id" element={<PlaceholderPage title="Report Details" />} />
            <Route path="quotations" element={<PlaceholderPage title="Quotations" />} />
            <Route path="quotations/:id" element={<PlaceholderPage title="Quotation Details" />} />
          </Route>

          {/* ============================================================ */}
          {/* ADMIN PORTAL */}
          {/* ============================================================ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<PlaceholderPage title="User Details" />} />
            <Route path="roles" element={<PlaceholderPage title="Roles & Permissions" />} />
            <Route path="config" element={<AdminConfigPage />} />
            <Route path="audit" element={<PlaceholderPage title="Audit Logs" />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* ============================================================ */}
          {/* OFFER MANAGER / CATALOG */}
          {/* ============================================================ */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/catalog/services" replace />} />
            <Route path="services" element={<OfferManagerServicesPage />} />
            <Route path="services/:id" element={<PlaceholderPage title="Service Details" />} />
            <Route path="pricing" element={<OfferManagerPricingPage />} />
            <Route path="checklists" element={<OfferManagerChecklistsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ExperienceProvider>
    </AuthProvider>
  );
}

export default App;
