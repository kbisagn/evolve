'use client';

import Header from './Header';
import Sidebar from './Sidebar';
import { DollarSign, Users, TrendingUp, BarChart3, Eye, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {

  // Mock data for the dashboard
  const revenueData = [
    { month: 'Jan', revenue: 0, expenses: 2000 },
    { month: 'Feb', revenue: 4000, expenses: 3000 },
    { month: 'Mar', revenue: 8000, expenses: 4000 },
    { month: 'Apr', revenue: 12000, expenses: 5000 },
    { month: 'May', revenue: 16000, expenses: 6000 },
    { month: 'Jun', revenue: 14000, expenses: 5500 },
  ];

  const transactions = [
    { name: 'Rahul Feb Fee', date: '2024-02-01', amount: '+₹3500' },
    { name: 'Jan Bill', date: '2024-02-05', amount: '-₹1200' },
    { name: 'Priya Feb Fee', date: '2024-02-01', amount: '+₹3500' },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header pageTitle="Dashboard" />
        <div className="flex-1 p-6 overflow-auto bg-gray-50">

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-semibold">₹7,000</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-semibold">6.3%</p>
                <p className="text-xs text-gray-500">3/48 Desks</p>
                <p className="text-xs text-green-600">+3 this week</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-semibold">11</p>
                <p className="text-xs text-red-600">-₹500 vs last m</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-semibold">₹5,800</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Revenue & Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-light mb-4">Revenue & Expenses</h2>
          <p className="text-sm text-gray-600 mb-4">Last 6 Months</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Student Exam Focus */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-light mb-4">Student Exam Focus</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>UPSC</span>
                <span className="text-sm text-gray-500">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span>JEE</span>
                <span className="text-sm text-gray-500">40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light">Recent Transactions</h2>
              <button className="text-blue-600 hover:text-blue-800 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </button>
            </div>
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tx.name}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                  <span className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupancy Heatmap */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-light mb-4">Occupancy Heatmap</h2>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 48 }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded ${i % 2 === 0 ? 'bg-green-200' : 'bg-red-200'}`}
                  title={i % 2 === 0 ? 'Vacant' : 'Occupied'}
                ></div>
              ))}
            </div>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
                <span className="text-sm">Vac</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
                <span className="text-sm">Occ</span>
              </div>
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-light mb-4">Peak Hours Analysis</h2>
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-gray-700">Your facility is busiest between 10 AM - 4 PM.</span>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-12 text-sm">{i}:00</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.max(20, Math.sin((i - 6) / 24 * 2 * Math.PI) * 50 + 50)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}