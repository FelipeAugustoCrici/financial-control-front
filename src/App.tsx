import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Dashboard } from '@/pages/dashboard';
import { Registration } from './pages/records/registration/Registration';
import { ListRecords } from './pages/ListRecords';
import { Families } from './pages/families/Families';
import { Categories } from './pages/categories/Categories';
import { Details } from './pages/Details';
import { ForgotPassword, NewPassword, Login } from '@/pages/auth';
import { Register } from '@/pages/auth/Register';
import { ConfirmSignUp } from '@/pages/auth/ConfirmSignUp';
import { ToastProvider } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/Toaster';
import { Planning } from '@/pages/Planning';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/nova-senha" element={<NewPassword />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/cadastro-usuario" element={<Register />} />
            <Route path="/confirmar-cadastro" element={<ConfirmSignUp />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="cadastro" element={<Registration />} />
              <Route path="listagem" element={<ListRecords />} />
              <Route path="familias" element={<Families />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="detalhes" element={<Details />} />
              <Route path="planejamento" element={<Planning />} />
            </Route>

            <Route path="*" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>

      <Toaster />
    </ToastProvider>
  );
}

export default App;
