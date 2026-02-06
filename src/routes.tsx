import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@/pages/auth';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
