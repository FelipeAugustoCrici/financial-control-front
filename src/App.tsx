import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Registration } from './pages/Registration';
import { ListRecords } from './pages/ListRecords';
import { Families } from './pages/Families';
import { Categories } from './pages/Categories';
import { Details } from './pages/Details';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cadastro" element={<Registration />} />
            <Route path="/listagem" element={<ListRecords />} />
            <Route path="/familias" element={<Families />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/detalhes" element={<Details />} />
            {/* Fallback para Dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
