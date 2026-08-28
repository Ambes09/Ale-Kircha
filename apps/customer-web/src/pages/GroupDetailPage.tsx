import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface GroupDetail {
  id: string;
  nameEn: string;
  nameAm: string;
  groupCode: string;
  status: string;
  totalCapacity: number;
  reservedQuantity: number;
  soldQuantity: number;
  unitPrice: number;
  halfPrice: number;
  quarterPrice: number;
  deliveryFee: number;
  descriptionEn: string;
  kirchaType: { nameEn: string; icon: string };
  deliveryDate: string;
  deliveryTimeStart: string;
  deliveryTimeEnd: string;
  slaughterDate: string;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`/api/v1/kircha/groups/${id}`);
      if (response.data.success) {
        setGroup(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const response = await axios.post(`/api/v1/kircha/groups/${id}/join`, {
        quantity: 1,
        portionType: 'FULL',
      }, {
        headers: { 'x-telegram-id': window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123456789' }
      });
      if (response.data.success) {
        alert('Successfully joined!');
        navigate('/orders');
      }
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!group) return <div className="text-center py-8">Group not found</div>;

  const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
  const percentage = ((group.reservedQuantity + group.soldQuantity) / group.totalCapacity * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-white text-lg">←</button>
          <h1 className="text-lg font-bold">{group.nameEn}</h1>
          <span className="w-8"></span>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        <div className="card">
          <div className="text-center mb-4">
            <span className="text-6xl block">{group.kirchaType?.icon || '🥩'}</span>
            <h2 className="text-2xl font-bold mt-2">{group.nameEn}</h2>
            <p className="text-gray-500">{group.nameAm}</p>
            <p className="text-sm text-gray-400">Code: {group.groupCode}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold">{group.status}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Available</span>
                <span className="font-semibold">{available} / {group.totalCapacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Full Medeb</span>
                <span className="font-semibold">{group.unitPrice} ETB</span>
              </div>
              {group.halfPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Half Medeb</span>
                  <span className="font-semibold">{group.halfPrice} ETB</span>
                </div>
              )}
              {group.quarterPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quarter Medeb</span>
                  <span className="font-semibold">{group.quarterPrice} ETB</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="font-semibold">{group.deliveryFee} ETB</span>
              </div>
            </div>

            {group.deliveryDate && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Date</span>
                  <span className="font-semibold">{new Date(group.deliveryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-semibold">{group.deliveryTimeStart} - {group.deliveryTimeEnd}</span>
                </div>
              </div>
            )}

            {group.slaughterDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Slaughter Date</span>
                <span className="font-semibold">{new Date(group.slaughterDate).toLocaleDateString()}</span>
              </div>
            )}

            {group.descriptionEn && (
              <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
                {group.descriptionEn}
              </div>
            )}
          </div>
        </div>

        {available > 0 && group.status === 'OPEN' && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {joining ? 'Joining...' : '✅ Join Kircha'}
          </button>
        )}
        {available <= 0 && (
          <button disabled className="btn-primary w-full mt-4 opacity-50 cursor-not-allowed">
            📌 Group Full
          </button>
        )}
      </main>
    </div>
  );
}
