import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import ProductsPage from './pages/ProductsPage';
import BasketPage from './pages/BasketPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AllOrdersPage from './pages/AllOrdersPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/basket" element={<BasketPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/all" element={<AllOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}