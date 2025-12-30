'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface Log {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  performedBy?: string;
  createdAt: string;
}

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'Admin') {
      router.push('/');
      return;
    }
    fetchLogs();
  }, [session, status, router]);

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
  };

  const downloadLogs = () => {
    const csvContent = [
      ['Action', 'Entity', 'Entity ID', 'Details', 'Performed By', 'Created At'],
      ...logs.map(log => [
        log.action,
        log.entity,
        log.entityId || '',
        log.details || '',
        log.performedBy || '',
        new Date(log.createdAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'Admin') {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header pageTitle="System Logs" />
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4">
            <button
              onClick={downloadLogs}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.entity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.entityId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.performedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}