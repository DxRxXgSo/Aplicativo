import { useEffect, useMemo, useState } from 'react';
import { getAllOrders, type Order } from '../api/orders';
import OrderCard from '../components/OrderCard';

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getAllOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar las compras. Intenta nuevamente.');
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const confirmed = orders.filter((o) => o.status === 'Confirmed').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    return { totalOrders, totalRevenue, pending, confirmed, cancelled };
  }, [orders]);

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Todas las Compras</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Órdenes registradas por todos los clientes del sistema
      </p>

      {!isLoading && !error && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-primary">{summary.totalOrders}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Órdenes</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-primary">${summary.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ventas totales</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-warning">{summary.pending}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-success">{summary.confirmed}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confirmadas</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse h-48" />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse h-48" />
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aún no hay compras registradas.</p>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} showCustomer />
        ))}
      </div>
    </div>
  );
}
