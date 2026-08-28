import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface KirchaGroup {
  id: string;
  nameEn: string;
  nameAm: string;
  groupCode: string;
  unitPrice: number;
  totalCapacity: number;
  reservedQuantity: number;
  soldQuantity: number;
  status: string;
  deliveryDate?: string;
  kirchaType: { nameEn: string; icon?: string };
}

export default function KirchaPage() {
  const [groups, setGroups] = useState<KirchaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchGroups();
  }, [selectedType]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = selectedType === 'all' 
        ? '/api/v1/kircha/groups/available'
        : `/api/v1/kircha/groups?kirchaTypeId=${selectedType}`;
      const response = await axios.get(url);
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-white">← Back</Link>
          <h1 className="text-lg font-bold">Available Kircha</h1>
          <span className="w-12"></span>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-md">
        {/* Type Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'all' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('ox')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'ox' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            🐂 Ox
          </button>
          <button
            onClick={() => setSelectedType('sheep')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'sheep' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            🐑 Sheep
          </button>
          <button
            onClick={() => setSelectedType('goat')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'goat' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            🐐 Goat
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No groups available</div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const available = group.totalCapacity - group.reservedQuantity - group.soldQuantity;
              return (
                <Link
                  key={group.id}
                  to={`/kircha/${group.id}`}
                  className="card block"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{group.kirchaType?.icon || '🥩'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.nameEn}</h3>
                      <p className="text-sm text-gray-500">{group.nameAm}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {available} / {group.totalCapacity} left
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {group.unitPrice} ETB
                        </span>
                        {group.deliveryDate && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            📅 {new Date(group.deliveryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-red-600 font-medium">Join →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
