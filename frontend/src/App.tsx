import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NuovoOrdine from './pages/NuovoOrdine';
import OrdiniAttivi from './pages/OrdiniAttivi';
import MenuAdmin from './pages/MenuAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ordini/nuovo" replace />} />
          <Route path="ordini/nuovo" element={<NuovoOrdine />} />
          <Route path="ordini" element={<OrdiniAttivi />} />
          <Route path="menu-admin" element={<MenuAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
