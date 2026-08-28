import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">🍖 Ale Kircha</h1>
          <p className="text-sm opacity-90">Your Kircha, In Your Phone</p>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        {/* Kircha Types */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Kircha Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {['🐂 Ox', '🐑 Sheep', '🐐 Goat'].map((type) => (
              <Link
                key={type}
                to="/kircha"
                className="card flex flex-col items-center justify-center p-4 text-center hover:border-red-500 border-2 border-transparent"
              >
                <span className="text-3xl mb-1">{type.split(' ')[0]}</span>
                <span className="text-sm font-medium">{type.split(' ')[1]}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/orders" className="card text-center p-4">
            <span className="text-2xl block">📦</span>
            <span className="text-sm font-medium">My Orders</span>
          </Link>
          <Link to="/profile" className="card text-center p-4">
            <span className="text-2xl block">👤</span>
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <Link to="/help" className="card text-center p-4">
            <span className="text-2xl block">❓</span>
            <span className="text-sm font-medium">Help</span>
          </Link>
          <Link to="/kircha" className="card text-center p-4 bg-red-50 border-2 border-red-200">
            <span className="text-2xl block">🛒</span>
            <span className="text-sm font-medium text-red-600">Order Now</span>
          </Link>
        </section>

        {/* Active Groups Preview */}
        <section className="card">
          <h3 className="font-semibold text-gray-800 mb-2">Active Kircha Groups</h3>
          <p className="text-sm text-gray-500">Loading groups...</p>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 max-w-md mx-auto">
        <Link to="/" className="flex flex-col items-center text-red-600">
          <span className="text-xl">🏠</span>
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/kircha" className="flex flex-col items-center text-gray-500">
          <span className="text-xl">🛒</span>
          <span className="text-xs">Kircha</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center text-gray-500">
          <span className="text-xl">📦</span>
          <span className="text-xs">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-gray-500">
          <span className="text-xl">👤</span>
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
