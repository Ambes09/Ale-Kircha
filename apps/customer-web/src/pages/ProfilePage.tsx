import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/v1/customers/me', {
        headers: { 'x-telegram-id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123456789' }
      });
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Please register first</p>
          <Link to="/register" className="btn-primary inline-block mt-4">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-white">← Back</Link>
          <h1 className="text-lg font-bold">Profile</h1>
          <button onClick={fetchProfile} className="text-white">🔄</button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <div className="card text-center mb-4">
          <div className="text-6xl mb-2">👤</div>
          <h2 className="text-xl font-bold">{profile.fullName}</h2>
          <p className="text-gray-500">{profile.user?.phone || 'No phone'}</p>
          <p className="text-sm text-gray-400">Status: {profile.status}</p>
        </div>

        <div className="card space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Language</span>
            <span>{profile.preferredLanguage === 'en' ? 'English' : 'አማርኛ'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Registered</span>
            <span>{new Date(profile.registrationDate).toLocaleDateString()}</span>
          </div>
          {profile.additionalPhone && (
            <div className="flex justify-between">
              <span className="text-gray-500">Additional Phone</span>
              <span>{profile.additionalPhone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <button className="btn-secondary w-full">📝 Edit Profile</button>
          <button className="btn-secondary w-full">📱 Change Phone</button>
          <button className="btn-secondary w-full">🌐 Change Language</button>
        </div>
      </main>
    </div>
  );
}
