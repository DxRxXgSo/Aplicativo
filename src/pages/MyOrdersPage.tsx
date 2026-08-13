import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBasketStore } from '../store/basketStore';
import { getOrdersByCustomer, type Order } from '../api/orders';
import OrderCard from '../components/OrderCard';

export default function MyOrdersPage() {
  const userName = useBasketStore((state) => state.userName);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getOrdersByCustomer(userName)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar tus pedidos. Intenta nuevamente.');
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userName]);

  return (
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Mis Pedidos</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Compras realizadas por <span className="font-medium text-gray-700 dark:text-gray-200">{userName}</span>
      </p>

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
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Aún no has realizado ninguna compra.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg transition-colors"
          >
            Ver productos
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
