import { Link, Outlet, useLocation } from 'react-router-dom';
import { Pizza, ClipboardList, Settings, User } from 'lucide-react';
import { useOperatoreStore } from '../store/operatoreStore';
import { useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const { operatore, loadFromSession, logout } = useOperatoreStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    loadFromSession();
  }, [loadFromSession]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row pb-[56px] md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-3 flex justify-between items-center no-print shrink-0">
        <div className="flex items-center gap-2">
          <Pizza className="w-6 h-6 text-red-600" />
          <h1 className="text-lg font-bold">PizzaOrder</h1>
        </div>
        {operatore && (
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            <User className="w-4 h-4" />
            {operatore.nome}
          </button>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col no-print">
        <div className="p-4 border-b flex items-center gap-2">
          <Pizza className="w-8 h-8 text-red-600" />
          <h1 className="text-xl font-bold">PizzaOrder</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/ordini/nuovo" icon={<Pizza className="w-5 h-5" />} label="Nuovo Ordine" active={isActive('/ordini/nuovo')} />
          <NavLink to="/ordini" icon={<ClipboardList className="w-5 h-5" />} label="Ordini Attivi" active={isActive('/ordini') && !isActive('/ordini/nuovo')} />
          <NavLink to="/menu-admin" icon={<Settings className="w-5 h-5" />} label="Menu Admin" active={isActive('/menu-admin')} />
          {operatore?.ruolo === 'admin' && (
            <NavLink to="/operatori" icon={<User className="w-5 h-5" />} label="Operatori" active={isActive('/operatori')} />
          )}
        </nav>

        {operatore && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {operatore.nome[0]}
                </div>
                <span className="font-medium">{operatore.nome}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors p-2">
                Esci
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col print:overflow-visible print:h-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-white border-t flex justify-around items-center z-50 no-print pb-[env(safe-area-inset-bottom)]">
        <MobileNavLink to="/ordini/nuovo" icon={<Pizza className="w-6 h-6" />} label="Nuovo" active={isActive('/ordini/nuovo')} />
        <MobileNavLink to="/ordini" icon={<ClipboardList className="w-6 h-6" />} label="Ordini" active={isActive('/ordini') && !isActive('/ordini/nuovo')} />
        <MobileNavLink to="/menu-admin" icon={<Settings className="w-6 h-6" />} label="Admin" active={isActive('/menu-admin')} />
        {operatore?.ruolo === 'admin' && (
          <MobileNavLink to="/operatori" icon={<User className="w-6 h-6" />} label="Op" active={isActive('/operatori')} />
        )}
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-red-600' : 'text-gray-500'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
