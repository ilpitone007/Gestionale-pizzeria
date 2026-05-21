import { Link, Outlet, useLocation } from 'react-router-dom';
import { Pizza, ClipboardList, Settings, BarChart2, Printer, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const location = useLocation();
  const { utente, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Sidebar / Bottom Nav */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-t dark:border-t-gray-700 md:border-t-0 md:border-r dark:border-r-gray-700 flex flex-col order-last md:order-first z-20 no-print sticky bottom-0 md:static transition-colors">
        <div className="hidden md:flex p-4 border-b dark:border-b-gray-700 items-center gap-2">
          <Pizza className="w-8 h-8 text-red-600 dark:text-red-500" />
          <h1 className="text-xl font-bold dark:text-white">PizzaOrder</h1>
        </div>

        <nav className="flex md:flex-col flex-row flex-1 md:p-4 space-x-0 md:space-y-2 overflow-x-auto overflow-y-hidden justify-between md:justify-start relative">
          <Link
            to="/ordini/nuovo"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini/nuovo') ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Pizza className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Nuovo</span>
          </Link>

          <Link
            to="/ordini"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/ordini') ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <ClipboardList className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Ordini</span>
          </Link>

          <Link
            to="/menu-admin"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/menu-admin') ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Settings className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Admin</span>
          </Link>

          <Link
            to="/statistiche"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/statistiche') ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <BarChart2 className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Storico</span>
          </Link>

          <Link
            to="/test-stampante"
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-none md:rounded-lg transition-colors flex-1 md:flex-none justify-center ${
              isActive('/test-stampante') ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <Printer className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Test</span>
          </Link>

          <div className="hidden md:flex mt-auto pt-4 flex-col gap-2">
            {utente && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Loggato come: <span className="text-gray-900 dark:text-white capitalize">{utente.username}</span>
              </div>
            )}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-sm font-medium">{isDarkMode ? 'Tema Chiaro' : 'Tema Scuro'}</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>

        {/* Mobile Theme Toggle & Logout */}
        <div className="md:hidden absolute top-[-50px] right-4 flex gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-gray-500 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-full bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-red-600"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col print:overflow-visible print:h-auto pb-0">
        {/* Mobile Header */}
        <div className="md:hidden flex p-4 border-b dark:border-b-gray-700 bg-white dark:bg-gray-800 items-center gap-2 sticky top-0 z-10 shadow-sm transition-colors">
          <Pizza className="w-6 h-6 text-red-600 dark:text-red-500" />
          <h1 className="text-lg font-bold dark:text-white">PizzaOrder</h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
