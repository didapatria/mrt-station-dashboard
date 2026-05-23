import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { permissionService } from "@/services/permission.service";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const StationsPage = lazy(() => import("@/pages/StationsPage"));
const SchedulesPage = lazy(() => import("@/pages/SchedulesPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const ActivityLogPage = lazy(() => import("@/pages/ActivityLogPage"));
const StationDetailPage = lazy(() => import("@/pages/StationDetailPage"));
const RoutePlannerPage = lazy(() => import("@/pages/RoutePlannerPage"));
const StationComparePage = lazy(() => import("@/pages/StationComparePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ChangelogPage = lazy(() => import("@/pages/ChangelogPage"));
const AccessManagementPage = lazy(() => import("@/pages/AccessManagementPage"));
const CommandCenterPage = lazy(() => import("@/pages/CommandCenterPage"));
const IncidentsPage = lazy(() => import("@/pages/IncidentsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}

function App() {
  const { initFromStorage, token, permissions, setPermissions } =
    useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initFromStorage();
    initTheme();
  }, [initFromStorage, initTheme]);

  // Fetch permissions from API when user is logged in but permissions not yet in localStorage
  useEffect(() => {
    if (token && permissions.length === 0) {
      permissionService
        .getMyPermissions()
        .then((perms) => {
          if (perms.length > 0) {
            setPermissions(perms);
            localStorage.setItem("permissions", JSON.stringify(perms));
          }
        })
        .catch(() => {});
    }
  }, [token, permissions.length, setPermissions]);

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Dashboard routes */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/stations" element={<StationsPage />} />
                  <Route path="/stations/:id" element={<StationDetailPage />} />
                  <Route path="/schedules" element={<SchedulesPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/route-planner" element={<RoutePlannerPage />} />
                  <Route path="/compare" element={<StationComparePage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/access" element={<AccessManagementPage />} />
                  <Route path="/activity" element={<ActivityLogPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/changelog" element={<ChangelogPage />} />
                  <Route path="/command" element={<CommandCenterPage />} />
                  <Route path="/incidents" element={<IncidentsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* 404 */}
                <Route path="/404" element={<NotFoundPage />} />

                {/* Default redirect */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
