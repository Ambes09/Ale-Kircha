import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    additionalPhone: '',
    address: '',
    city: '',
    subCity: '',
    woreda: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/v1/customers/register', {
        telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123456789',
        firstName: form.fullName.split(' ')[0] || 'User',
        lastName: form.fullName.split(' ').slice(1).join(' ') || '',
        phone: form.phone,
        fullName: form.fullName,
        preferredLanguage: 'en',
      });
      if (response.data.success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                className="input-field"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Phone</label>
              <input
                type="tel"
                className="input-field"
                value={form.additionalPhone}
                onChange={(e) => setForm({ ...form, additionalPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <input
                type="text"
                className="input-field"
                placeholder="House number, street"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-City</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.subCity}
                  onChange={(e) => setForm({ ...form, subCity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                  className="w-4 h-4 text-red-600"
                />
                I agree to the Terms & Conditions
              </label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
