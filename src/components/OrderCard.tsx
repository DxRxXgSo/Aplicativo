import type { Order, OrderStatus } from '../api/orders';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/30',
  Confirmed: 'bg-success/10 text-success border-success/30',
  Cancelled: 'bg-danger/10 text-danger border-danger/30',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderCard({ order, showCustomer = false }: { order: Order; showCustomer?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-sm text-gray-500 dark:text-gray-400">Orden: {order.id}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
          {showCustomer && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: {order.customerId}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Productos ({order.items.length})</p>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.productName}{' '}
                <span className="text-gray-500 dark:text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Impuestos (16%)</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
