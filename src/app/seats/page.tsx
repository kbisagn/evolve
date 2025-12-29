'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import SubscriptionManagement from '../../components/SubscriptionManagement';

interface Seat {
  _id: string;
  seatNumber: number;
  status: string;
  assignedMember?: { name: string };
  subscription?: { endDate: string; status: string };
}

export default function SeatsPage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);

  const fetchSeats = async () => {
    try {
      let res = await fetch('/api/seats');
      if (res.ok) {
        let data = await res.json();
        if (data.length === 0) {
          await fetch('/api/init', { method: 'POST' });
          res = await fetch('/api/seats');
          if (res.ok) {
            data = await res.json();
          }
        }
        setSeats(data);
      } else {
        console.error('Failed to fetch seats');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const fetchWaiting = async () => {
    try {
      const res = await fetch('/api/waiting');
      if (res.ok) {
        const data = await res.json();
        setWaitingCount(data.length);
      } else {
        console.error('Failed to fetch waiting list');
      }
    } catch (error) {
      console.error('Error fetching waiting list:', error);
    }
  };

  useEffect(() => {
    fetchSeats();
    fetchWaiting();
  }, []);

  const vacant = seats.filter(s => s.status === 'vacant').length;
  const occupied = seats.filter(s => s.status === 'occupied').length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle="Facility Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-green-100 p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Vacant Seats</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{vacant}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-red-100 p-3">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Occupied Seats</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{occupied}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-md bg-yellow-100 p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Waiting List</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{waitingCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seating Map */}
          <div className="bg-white shadow rounded-lg mb-8 border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Live Seating Map</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {seats.map(seat => (
                  <div 
                    key={seat.seatNumber} 
                    className={`relative p-4 border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 ${
                      seat.status === 'vacant' 
                        ? 'bg-green-50 border-green-200 hover:shadow-md hover:border-green-300' 
                        : 'bg-white border-red-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className={`text-2xl font-bold mb-1 ${seat.status === 'vacant' ? 'text-green-600' : 'text-gray-800'}`}>
                      {seat.seatNumber}
                    </div>
                    {seat.status === 'vacant' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <div className="w-full">
                        <div className="text-sm font-medium text-gray-900 truncate w-full" title={seat.assignedMember?.name}>
                          {seat.assignedMember?.name || 'Occupied'}
                        </div>
                        {seat.subscription && (
                          <div className="text-xs text-gray-500 mt-1">
                            Exp: {new Date(seat.subscription.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </div>
                        )}
                      </div>
                    )}
                    {seat.status === 'occupied' && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Management Section */}
          <div className="mt-8">
            <SubscriptionManagement />
          </div>
        </main>
      </div>
    </div>
  );
}