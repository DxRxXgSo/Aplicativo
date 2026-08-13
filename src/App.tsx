import { Link, Outlet, useLocation } from 'react-router-dom';
import { useBasketStore } from './store/basketStore';

const USERS = Array.from({ length: 10 }, (_, i) => `comprador${i + 1}`);

export default function App() {
  const location = useLocation();
  const totalItems = useBasketStore((state) => state.totalItems);
  const userName = useBasketStore((state) => state.userName);
  const setUserName = useBasketStore((state) => state.setUserName);

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-primary font-semibold'
      : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary';

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-custom flex items-center justify-between h-16 gap-4">
          <Link to="/products" className="text-xl font-bold text-primary">
            E-Shop
          </Link>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              Usuario
              <select
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-36 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                title="Cada usuario tiene su propio carrito guardado"
              >
                {USERS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </label>
            <Link to="/products" className={`${isActive('/products')} transition-colors`}>
              Productos
            </Link>
            <Link to="/basket" className={`${isActive('/basket')} transition-colors relative`}>
              Carrito
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
        <div className="container-custom text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} E-Shop. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
