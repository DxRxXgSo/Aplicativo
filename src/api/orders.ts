import { ordersClient } from './client';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  idempotencyKey: string | null;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface CreateOrderResult {
  order: Order;
  created: boolean;
}

export const createOrder = async (
  customerId: string,
  basketId: string,
  idempotencyKey: string
): Promise<CreateOrderResult> => {
  const { data, status } = await ordersClient.post(
    '/orders',
    { customerId, basketId },
    { headers: { 'Idempotency-Key': idempotencyKey } }
  );
  return { order: data as Order, created: status === 201 };
};

export const getOrder = async (id: string): Promise<Order> => {
  const { data } = await ordersClient.get(`/orders/${encodeURIComponent(id)}`);
  return data;
};

export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  const { data } = await ordersClient.get(`/orders/customer/${encodeURIComponent(customerId)}`);
  return data;
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const { data } = await ordersClient.patch(`/orders/${encodeURIComponent(id)}/status`, { status });
  return data;
};