import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CylindersPage } from './pages/CylindersPage';
import { FlowPage } from './pages/FlowPage';
import { InspectionPage } from './pages/InspectionPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { WarningsPage } from './pages/WarningsPage';
import { TracePage } from './pages/TracePage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cylinders" element={<CylindersPage />} />
          <Route path="/flow" element={<FlowPage />} />
          <Route path="/inspections" element={<InspectionPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/warnings" element={<WarningsPage />} />
          <Route path="/trace" element={<TracePage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Router>
);

export default App;

