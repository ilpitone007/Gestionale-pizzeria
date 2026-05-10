import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NuovoOrdine from './pages/NuovoOrdine';
import OrdiniAttivi from './pages/OrdiniAttivi';
import MenuAdmin from './pages/MenuAdmin';
import OperatorSelectionModal from './components/OperatorSelectionModal';
import OperatoriAdmin from './pages/OperatoriAdmin';

function App() {
  return (
    <BrowserRouter>
      <OperatorSelectionModal />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ordini/nuovo" replace />} />
          <Route path="ordini/nuovo" element={<NuovoOrdine />} />
          <Route path="ordini" element={<OrdiniAttivi />} />
          <Route path="menu-admin" element={<MenuAdmin />} />
          <Route path="operatori" element={<OperatoriAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
