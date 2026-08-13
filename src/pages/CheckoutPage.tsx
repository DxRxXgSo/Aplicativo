import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBasketStore } from '../store/basketStore';
import { createOrder } from '../api/orders';
import type { Order } from '../api/orders';
import { useToast } from '../components/Toast';

const TAX_RATE = 0.16;
const IDEMPOTENCY_KEY_STORAGE = 'ordering-idempotency-key';

function getOrCreateIdempotencyKey(): string {
  let key = localStorage.getItem(IDEMPOTENCY_KEY_STORAGE);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(IDEMPOTENCY_KEY_STORAGE, key);
  }
  return key;
}

function clearIdempotencyKey() {
  localStorage.removeItem(IDEMPOTENCY_KEY_STORAGE);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CheckoutPage() {
  const {
    userName,
    items,
    totalItems,
    totalPrice,
    isLoading,
    fetchBasket,
    clearBasket,
  } = useBasketStore();
  const { showError } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBasket();
  }, [fetchBasket]);

  const subtotal = totalPrice;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleConfirmPurchase = useCallback(async () => {
    if (items.length === 0) {
      setError('Tu carrito está vacío. Agrega productos antes de realizar la compra.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = getOrCreateIdempotencyKey();
      const result = await createOrder(userName, userName, idempotencyKey);

      setOrder(result.order);
      if (!result.created) {
        showError('La solicitud ya había sido registrada: se devolvió la orden existente (idempotencia).');
      }
      clearIdempotencyKey();
      await clearBasket();
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string; title?: string } } })?.response?.data?.detail
        ?? (err as { response?: { data?: { title?: string } } })?.response?.data?.title
        ?? 'No se pudo generar la orden de compra. Intente nuevamente.';
      setError(message);
      showError('No se pudo completar la compra');
    } finally {
      setIsSubmitting(false);
    }
  }, [items.length, userName, showError, clearBasket]);

  if (isLoading && items.length === 0) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse h-64" />
      </div>
    );
  }

  if (order) {
    return (
      <div className="container-custom py-8 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Compra confirmada!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tu orden fue registrada correctamente y se guardó en MongoDB Atlas.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Número de orden</span>
              <span className="font-mono text-sm">{order.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Cliente</span>
              <span className="font-medium">{order.customerId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Fecha</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Estado</span>
              <span className="font-medium text-warning">{order.status}</span>
            </div>
          </div>

          <div className="text-left mb-6">
            <h2 className="font-semibold mb-3">Productos ({order.items.length})</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-2">
                  <span>
                    {item.productName}{' '}
                    <span className="text-gray-500 dark:text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-left border-t border-gray-200 dark:border-gray-700 pt-4 mb-6 space-y-1 text-sm">
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

          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Seguir comprando
            </Link>
            <Link
              to="/basket"
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2.5 rounded-lg transition-colors"
            >
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Finalizar Compra</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Tu carrito está vacío. Agrega productos antes de realizar la compra.
        </p>
        <Link
          to="/products"
          className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Finalizar Compra</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-semibold mb-4">Productos ({totalItems})</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.productName}{' '}
                <span className="text-gray-500 dark:text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium">
                ${((item.price ?? item.unitPrice ?? 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-semibold mb-4">Resumen</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Impuestos (16%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleConfirmPurchase}
          disabled={isSubmitting}
          className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg transition-colors font-medium"
        >
          {isSubmitting ? 'Generando orden...' : 'Confirmar compra'}
        </button>
        <Link
          to="/basket"
          className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}