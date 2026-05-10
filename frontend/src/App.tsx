import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Pizza, Receipt, Clock } from 'lucide-react';
import Menu from './pages/Menu';
import Ordini from './pages/Ordini';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-red-600 text-white p-4 shadow-md print:hidden">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              <Pizza /> PizzaOrder
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="flex items-center gap-1 hover:text-red-200">
                <Receipt size={20} /> Nuovo Ordine
              </Link>
              <Link to="/ordini" className="flex items-center gap-1 hover:text-red-200">
                <Clock size={20} /> Ordini Attivi
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/ordini" element={<Ordini />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
