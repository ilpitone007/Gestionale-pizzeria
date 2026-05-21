import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NuovoOrdine from './pages/NuovoOrdine';
import OrdiniAttivi from './pages/OrdiniAttivi';
import MenuAdmin from './pages/MenuAdmin';
import Statistiche from './pages/Statistiche';
import TestStampante from './pages/TestStampante';
import Login from './pages/Auth/Login';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { token, utente } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && utente?.ruolo !== 'admin') {
    return <Navigate to="/" replace />; // O a una pagina di errore 403
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/ordini/nuovo" replace />} />
          <Route path="ordini/nuovo" element={<NuovoOrdine />} />
          <Route path="ordini" element={<OrdiniAttivi />} />

          <Route path="menu-admin" element={<ProtectedRoute requireAdmin><MenuAdmin /></ProtectedRoute>} />
          <Route path="statistiche" element={<ProtectedRoute requireAdmin><Statistiche /></ProtectedRoute>} />

          <Route path="test-stampante" element={<TestStampante />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
