'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInitialize = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/init', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Database initialized successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to initialize database' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while initializing the database' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Database Setup</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Initialize Database</h2>
          <p className="text-gray-600 mb-6">
            This will set up your database with initial data:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>46 seats (numbered 1-46, all vacant)</li>
            <li>Admin user (email: admin@example.com, password: admin123)</li>
          </ul>

          {message && (
            <div
              className={`p-4 rounded-md mb-6 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleInitialize}
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Initializing...' : 'Initialize Database'}
          </button>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Note</h3>
          <p className="text-yellow-700 text-sm mt-1">
            This action is only needed once when setting up a new database. 
            Running it again is safe but won't duplicate existing data.
          </p>
        </div>
      </div>
    </div>
  );
}
