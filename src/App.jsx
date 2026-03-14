import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, PortfolioProvider } from './context/AppContext';
import ToastContainer from './components/Toast';
import Portfolio  from './pages/Portfolio';
import Login      from './pages/admin/Login';
import Setup      from './pages/admin/Setup';
import Dashboard  from './pages/admin/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PortfolioProvider>
          <ToastContainer />
          <Routes>
            <Route path="/"                  element={<Portfolio />} />
            <Route path="/admin/login"       element={<Login />} />
            <Route path="/admin/setup"       element={<Setup />} />
            <Route path="/admin/dashboard"   element={<Dashboard />} />
            <Route path="*"                  element={<Navigate to="/" replace />} />
          </Routes>
        </PortfolioProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
