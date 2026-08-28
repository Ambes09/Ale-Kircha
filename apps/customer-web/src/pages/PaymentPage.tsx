import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const [orderRes, methodsRes] = await Promise.all([
        axios.get(`/api/v1/orders/${orderId}`),
        axios.get('/api/v1/payment/methods')
      ]);
      if (orderRes.data.success) setOrder(orderRes.data.data);
      if (methodsRes.data.success) setPaymentMethods(methodsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    setSubmitting(true);
    try {
      // In production, this would redirect to payment gateway
      alert('Payment initiated! Please complete the payment and upload your receipt.');
      navigate(`/orders`);
    } catch (error) {
      alert('Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">Payment</h1>
        
        <div className="card mb-4">
          <h3 className="font-semibold">Order Summary</h3>
          <p className="text-sm text-gray-500">Order: {order.orderNumber}</p>
          <p className="text-2xl font-bold text-red-600">{order.totalAmount} ETB</p>
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Select Payment Method</h3>
          {paymentMethods.map((method) => (
            <label key={method.id} className="flex items-center gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                className="w-4 h-4 text-red-600"
              />
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-gray-500">{method.accountName}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedMethod}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? 'Processing...' : '💳 Pay Now'}
        </button>
      </div>
    </div>
  );
}
