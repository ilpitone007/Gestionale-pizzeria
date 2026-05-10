import { Link, Outlet, useLocation } from 'react-router-dom';
import { Pizza, ClipboardList, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col no-print">
        <div className="p-4 border-b flex items-center gap-2">
          <Pizza className="w-8 h-8 text-red-600" />
          <h1 className="text-xl font-bold">PizzaOrder</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/ordini/nuovo"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/ordini/nuovo') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <Pizza className="w-5 h-5" />
            <span className="font-medium">Nuovo Ordine</span>
          </Link>

          <Link
            to="/ordini"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/ordini') && !isActive('/ordini/nuovo') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">Ordini Attivi</span>
          </Link>

          <Link
            to="/menu-admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/menu-admin') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Menu Admin</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col print:overflow-visible print:h-auto">
        <Outlet />
      </main>
    </div>
  );
}
