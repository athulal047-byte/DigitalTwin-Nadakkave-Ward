import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Component to log route changes for UE5 debugging
function RouteLogger() {
  const location = useLocation();
  useEffect(() => {
    // Route changes intentionally silenced for production
  }, [location]);
  return null;
}

// Lazy load pages for code splitting (Performance optimization - Phase 8)
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DepartmentDashboard = lazy(() => import("./pages/DepartmentDashboard"));
const CitizenPortal = lazy(() => import("./pages/CitizenPortal"));
const Reports = lazy(() => import("./pages/Reports"));
const Buildings = lazy(() => import("./pages/Buildings"));
const Roads = lazy(() => import("./pages/Roads"));
const Grievances = lazy(() => import("./pages/Grievances"));
const Water = lazy(() => import("./pages/Water"));
const Electricity = lazy(() => import("./pages/Electricity"));
const Telecom = lazy(() => import("./pages/Telecom"));
const Sewerage = lazy(() => import("./pages/Sewerage"));
const Stormwater = lazy(() => import("./pages/Stormwater"));
const Environment = lazy(() => import("./pages/Environment"));
const SolidWaste = lazy(() => import("./pages/SolidWaste"));
const SocialInfrastructure = lazy(() => import("./pages/SocialInfrastructure"));
const Demographics = lazy(() => import("./pages/Demographics"));
const EconomicActivity = lazy(() => import("./pages/EconomicActivity"));
const Disaster = lazy(() => import("./pages/Disaster"));
const IoT = lazy(() => import("./pages/IoT"));
const Governance = lazy(() => import("./pages/Governance"));
const ThreeDView = lazy(() => import("./pages/ThreeDView"));
const WidgetSidebar = lazy(() => import("./pages/WidgetSidebar"));
const WidgetTopbar = lazy(() => import("./pages/WidgetTopbar"));
const WidgetInfoPanel = lazy(() => import("./pages/WidgetInfoPanel"));
const WidgetEmpty = lazy(() => import("./pages/WidgetEmpty"));

const PageLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm z-50">
    <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <RouteLogger />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public route — Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard with Layout (sidebar + topbar + content) */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<ProtectedRoute roles={['admin', 'corporation']}><Dashboard /></ProtectedRoute>} />
              <Route path="/department-dashboard" element={<ProtectedRoute roles={['electricity_dept', 'water_dept', 'road_dept', 'telecom_dept', 'solid_waste_dept', 'environment_dept', 'disaster_dept', 'health_dept']}><DepartmentDashboard /></ProtectedRoute>} />
              <Route path="/citizen-portal" element={<ProtectedRoute roles={['citizen']}><CitizenPortal /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute permissions={['reports']}><Reports /></ProtectedRoute>} />
              <Route path="/buildings" element={<ProtectedRoute permissions={['buildings']}><Buildings /></ProtectedRoute>} />
              <Route path="/roads" element={<ProtectedRoute permissions={['roads']}><Roads /></ProtectedRoute>} />
              <Route path="/grievances" element={<ProtectedRoute permissions={['grievances']}><Grievances /></ProtectedRoute>} />
              <Route path="/water" element={<ProtectedRoute permissions={['water']}><Water /></ProtectedRoute>} />
              <Route path="/electricity" element={<ProtectedRoute permissions={['electricity']}><Electricity /></ProtectedRoute>} />
              <Route path="/telecom" element={<ProtectedRoute permissions={['telecom']}><Telecom /></ProtectedRoute>} />
              <Route path="/sewerage" element={<ProtectedRoute permissions={['water']}><Sewerage /></ProtectedRoute>} />
              <Route path="/stormwater" element={<ProtectedRoute permissions={['water']}><Stormwater /></ProtectedRoute>} />
              <Route path="/environment" element={<ProtectedRoute permissions={['environment']}><Environment /></ProtectedRoute>} />
              <Route path="/solid-waste" element={<ProtectedRoute permissions={['solid_waste']}><SolidWaste /></ProtectedRoute>} />
              <Route path="/social" element={<ProtectedRoute permissions={['buildings']}><SocialInfrastructure /></ProtectedRoute>} />
              <Route path="/demographics" element={<ProtectedRoute permissions={['users']}><Demographics /></ProtectedRoute>} />
              <Route path="/economic" element={<ProtectedRoute permissions={['reports']}><EconomicActivity /></ProtectedRoute>} />
              <Route path="/disaster" element={<ProtectedRoute permissions={['disaster']}><Disaster /></ProtectedRoute>} />
              <Route path="/iot" element={<ProtectedRoute permissions={['electricity', 'water']}><IoT /></ProtectedRoute>} />
              <Route path="/governance" element={<ProtectedRoute roles={['admin', 'corporation']}><Governance /></ProtectedRoute>} />
              <Route path="/3d" element={<ProtectedRoute permissions={['digital_twin']}><ThreeDView /></ProtectedRoute>} />
            </Route>

            {/* Isolated widget routes for WB_3DView's separate Web Browsers (no auth needed) */}
            <Route path="/widget/sidebar" element={<WidgetSidebar />} />
            <Route path="/widget/topbar" element={<WidgetTopbar />} />
            <Route path="/widget/infopanel/:id" element={<WidgetInfoPanel />} />
            <Route path="/widget/empty" element={<WidgetEmpty />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;