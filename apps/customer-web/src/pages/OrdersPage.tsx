import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  group: { nameEn: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/v1/orders/my', {
        headers: { 'x-telegram-id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123456789' }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    'DRAFT': 'bg-gray-200 text-gray-700',
    'PENDING_PAYMENT': 'bg-yellow-200 text-yellow-700',
    'PAYMENT_REVIEW': 'bg-blue-200 text-blue-700',
    'PAYMENT_CONFIRMED': 'bg-green-200 text-green-700',
    'PROCESSING': 'bg-purple-200 text-purple-700',
    'READY_FOR_DELIVERY': 'bg-indigo-200 text-indigo-700',
    'OUT_FOR_DELIVERY': 'bg-orange-200 text-orange-700',
    'DELIVERED': 'bg-green-200 text-green-700',
    'COMPLETED': 'bg-green-300 text-green-800',
    'CANCELLED': 'bg-red-200 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-white">← Back</Link>
          <h1 className="text-lg font-bold">My Orders</h1>
          <button onClick={fetchOrders} className="text-white">🔄</button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders yet</p>
            <Link to="/kircha" className="btn-primary inline-block mt-4">Order Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="card block">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.group?.nameEn || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-200'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold">{order.totalAmount} ETB</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
