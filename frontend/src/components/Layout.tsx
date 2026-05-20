import { Link, Outlet, useLocation } from 'react-router-dom';
import { Pizza, ClipboardList, Settings, BarChart2, Printer } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar / Bottom Nav */}
      <aside className="w-full md:w-64 bg-white border-t md:border-t-0 md:border-r flex flex-col order-last md:order-first z-20 no-print sticky bottom-0 md:static">
        <div className="hidden md:flex p-4 border-b items-center gap-2">
          <Pizza className="w-8 h-8 text-red-600" />
          <h1 className="text-xl font-bold">PizzaOrder</h1>
        </div>

        <nav className="flex md:flex-col flex-row flex-1 md:p-4 space-x-0 md:space-y-2 overflow-x-auto overflow-y-hidden justify-between md:justify-start">
          <Link
            to="/ordini/nuovo"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini/nuovo') ? 'text-red-700 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Pizza className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Nuovo</span>
          </Link>

          <Link
            to="/ordini"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini') ? 'text-red-700 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Ordini</span>
          </Link>

          <Link
            to="/menu-admin"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/menu-admin') ? 'text-red-700 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Admin</span>
          </Link>

          <Link
            to="/statistiche"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/statistiche') ? 'text-red-700 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BarChart2 className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Storico</span>
          </Link>

          <Link
            to="/test-stampante"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/test-stampante') ? 'text-red-700 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Printer className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Test</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col print:overflow-visible print:h-auto pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex p-4 border-b bg-white items-center gap-2 sticky top-0 z-10 shadow-sm">
          <Pizza className="w-6 h-6 text-red-600" />
          <h1 className="text-lg font-bold">PizzaOrder</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
