import { Link, Outlet, useLocation } from 'react-router-dom';
import { Pizza, ClipboardList, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar / Bottom Nav */}
      <aside className="md:w-64 bg-white border-b md:border-b-0 md:border-r flex md:flex-col order-last md:order-first no-print">
        <div className="hidden md:flex p-4 border-b items-center gap-2">
          <Pizza className="w-8 h-8 text-red-600" />
          <h1 className="text-xl font-bold">PizzaOrder</h1>
        </div>

        <nav className="flex md:flex-col flex-1 md:p-4 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto justify-around">
          <Link
            to="/ordini/nuovo"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini/nuovo') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <Pizza className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-xs md:text-base font-medium text-center">Nuovo</span>
          </Link>

          <Link
            to="/ordini"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini') && !isActive('/ordini/nuovo') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-xs md:text-base font-medium text-center">Ordini</span>
          </Link>

          <Link
            to="/menu-admin"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/menu-admin') ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
            }`}
          >
            <Settings className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-xs md:text-base font-medium text-center">Admin</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col print:overflow-visible print:h-auto pb-16 md:pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex p-4 border-b bg-white items-center gap-2 sticky top-0 z-10">
          <Pizza className="w-6 h-6 text-red-600" />
          <h1 className="text-lg font-bold">PizzaOrder</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
