'use client';

import { useState, useEffect } from 'react';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Subscription {
  _id: string;
  member: { name: string; email: string; memberId: string };
  seat: { seatNumber: number };
  startDate: string;
  endDate: string;
  duration: string;
  totalAmount: number;
  status: string;
  payments: any[];
}

interface Waiting {
  _id: string;
  member: { name: string; email: string; memberId: string };
  requestedDate: string;
  startDate: string;
  duration: string;
  amount: number;
}

export default function SubscriptionManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [waitingList, setWaitingList] = useState<Waiting[]>([]);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [changingSeatId, setChangingSeatId] = useState<string | null>(null);
  const [newSeat, setNewSeat] = useState<string>('');
  const [form, setForm] = useState({
    memberId: '',
    seatNumber: '',
    startDate: '',
    duration: '',
    amount: '',
    paymentMethod: 'cash',
    upiCode: '',
    dateTime: '',
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch members');
      }
    } catch (error) {
      setError('Network error fetching members');
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await fetch('/api/seats');
      if (res.ok) {
        const data = await res.json();
        setSeats(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch seats');
      }
    } catch (error) {
      setError('Network error fetching seats');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch subscriptions');
      }
    } catch (error) {
      setError('Network error fetching subscriptions');
    }
  };

  const fetchWaitingList = async () => {
    try {
      const res = await fetch('/api/waiting');
      if (res.ok) {
        const data = await res.json();
        setWaitingList(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch waiting list');
      }
    } catch (error) {
      setError('Network error fetching waiting list');
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchSeats();
    fetchSubscriptions();
    fetchWaitingList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(form.startDate) < today) {
      setError('Start date cannot be in the past');
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setError('');
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        seatNumber: parseInt(form.seatNumber),
        amount: parseFloat(form.amount),
      }),
    });
    const result = await res.json();
    if (res.ok) {
      alert(result.message || 'Subscription created');
      setForm({
        memberId: '',
        seatNumber: '',
        startDate: '',
        duration: '',
        amount: '',
        paymentMethod: 'cash',
        upiCode: '',
        dateTime: '',
      });
    } else {
      setError(result.error || 'Failed to create subscription');
    }
    fetchSubscriptions();
    fetchSeats();
    fetchWaitingList();
  };

  const endSubscription = async (id: string) => {
    if (confirm("Are you sure you want to end this subscription?")) {
      if (confirm("This action cannot be undone. Are you really sure?")) {
        await fetch(`/api/subscriptions/${id}`, { method: 'PUT' });
        fetchSubscriptions();
        fetchSeats();
        fetchWaitingList();
      }
    }
  };

  const changeSeat = async (id: string, newSeatNumber: string) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatNumber: parseInt(newSeatNumber) }),
    });
    if (res.ok) {
      setChangingSeatId(null);
      setNewSeat('');
      fetchSubscriptions();
      fetchSeats();
    } else {
      alert('Failed to change seat');
    }
  };

  const removeFromWaiting = async (id: string) => {
    await fetch(`/api/waiting/${id}`, { method: 'DELETE' });
    fetchWaitingList();
  };

  const calculatePreviewEndDate = () => {
    if (!form.startDate || !form.duration) return null;
    const start = new Date(form.startDate);
    const duration = form.duration;
    if (duration.includes('month')) {
      const months = parseInt(duration.split(' ')[0]);
      start.setMonth(start.getMonth() + months);
    } else {
      const days = parseInt(duration.split(' ')[0]) || 0;
      start.setDate(start.getDate() + days);
    }
    return start.toLocaleDateString();
  };

  const vacantSeats = seats.filter(s => s.status === 'vacant');

  return (
    <>
      {/* Header & Actions */}
      <div className="flex justify-end mb-6">
          <div className="flex gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              />
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${showForm ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {showForm ? 'Cancel' : 'New Subscription'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white shadow-lg sm:rounded-xl mb-8 overflow-hidden border border-gray-100">
            <div className="px-6 py-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Subscription</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                
                <div className="sm:col-span-3">
                  <label htmlFor="member-select" className="block text-sm font-semibold text-gray-700 mb-1">Member</label>
                  <select
                    id="member-select"
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    required
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="">Select Member</option>
                    {members.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="seat-select" className="block text-sm font-semibold text-gray-700 mb-1">Seat</label>
                  <select
                    id="seat-select"
                    value={form.seatNumber}
                    onChange={(e) => setForm({ ...form, seatNumber: e.target.value })}
                    required
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="">Select Seat</option>
                    {vacantSeats.map(seat => (
                      <option key={seat._id} value={seat.seatNumber}>{seat.seatNumber}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <input
                    id="duration"
                    type="text"
                    placeholder="e.g., 30 days"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    required
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border bg-gray-50 focus:bg-white transition-colors"
                  />
                  {calculatePreviewEndDate() && (
                    <p className="mt-1 text-xs text-blue-600">Ends: {calculatePreviewEndDate()}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      className="block w-full pl-7 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="payment-method" className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    id="payment-method"
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                {form.paymentMethod === 'UPI' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="upi-code" className="block text-sm font-semibold text-gray-700 mb-1">UPI Transaction ID</label>
                    <input
                      id="upi-code"
                      type="text"
                      value={form.upiCode}
                      onChange={(e) => setForm({ ...form, upiCode: e.target.value })}
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="payment-datetime" className="block text-sm font-semibold text-gray-700 mb-1">Payment Date & Time</label>
                  <input
                    id="payment-datetime"
                    type="datetime-local"
                    value={form.dateTime}
                    onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    required
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-6 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                  >
                    Create Subscription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Active Subscriptions */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Active Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Member ID', 'Member', 'Seat', 'Start Date', 'End Date', 'Duration', 'Amount', 'Actions'].map(header => (
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.filter(s => s.status === 'active').filter(sub =>
                    (sub.member.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.seat.seatNumber.toString().includes(searchTerm)
                  ).map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.member.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Seat {sub.seat.seatNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{sub.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {changingSeatId === sub._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newSeat}
                              onChange={(e) => setNewSeat(e.target.value)}
                              className="block w-24 pl-2 pr-1 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md border"
                            >
                              <option value="">Select</option>
                              {vacantSeats.map(seat => (
                                <option key={seat._id} value={seat.seatNumber}>{seat.seatNumber}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => changeSeat(sub._id, newSeat)}
                              className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                              title="Confirm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setChangingSeatId(null); setNewSeat(''); }}
                              className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                              title="Cancel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setChangingSeatId(sub._id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors text-xs uppercase font-semibold tracking-wide"
                            >
                              Change Seat
                            </button>
                            <button onClick={() => endSubscription(sub._id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors text-xs uppercase font-semibold tracking-wide">
                              End
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {subscriptions.filter(s => s.status === 'active').length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No active subscriptions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expired Subscriptions */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Expired Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Member ID', 'Member', 'Seat', 'Start Date', 'End Date', 'Duration', 'Amount'].map(header => (
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.filter(s => s.status === 'expired').filter(sub =>
                    (sub.member.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.seat.seatNumber.toString().includes(searchTerm)
                  ).map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.member.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Seat {sub.seat.seatNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{sub.totalAmount}</td>
                    </tr>
                  ))}
                   {subscriptions.filter(s => s.status === 'expired').length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No expired subscriptions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Waiting List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Waiting List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Member ID', 'Member', 'Requested Date', 'Duration', 'Amount', 'Actions'].map(header => (
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {waitingList.filter(wait =>
                    (wait.member.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    wait.member.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(wait => (
                    <tr key={wait._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wait.member.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wait.member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wait.requestedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wait.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{wait.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => removeFromWaiting(wait._id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors text-xs uppercase font-semibold tracking-wide">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                   {waitingList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No members in waiting list</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

    </>
  );
}