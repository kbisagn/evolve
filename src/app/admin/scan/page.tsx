'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Search, CheckCircle, XCircle, AlertCircle, User, Calendar, Clock, IdCard, Mail, Phone, Hash } from 'lucide-react';

interface SearchHint {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  displayText: string;
}

interface VerificationResult {
  valid: boolean;
  member: {
    _id: string;
    memberId: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  subscription: {
    status: string;
    startDate: string;
    endDate: string;
    location: { name: string; address: string };
    seat: { seatNumber: number };
    duration: string;
    totalAmount: number;
  } | null;
  message: string;
}

type SearchType = 'memberId' | 'email' | 'phone' | 'name';

const searchTypeConfig: Record<SearchType, { label: string; placeholder: string; icon: React.ReactNode }> = {
  memberId: { label: 'Member ID', placeholder: 'Enter Member ID', icon: <Hash className="w-4 h-4" /> },
  email: { label: 'Email', placeholder: 'Enter Email Address', icon: <Mail className="w-4 h-4" /> },
  phone: { label: 'Phone', placeholder: 'Enter Phone Number', icon: <Phone className="w-4 h-4" /> },
  name: { label: 'Name', placeholder: 'Enter Member Name', icon: <User className="w-4 h-4" /> },
};

export default function QRScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('memberId');
  const [searchInput, setSearchInput] = useState('');
  const [hints, setHints] = useState<SearchHint[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [selectedHint, setSelectedHint] = useState<SearchHint | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else if (session.user.role === 'Member') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hintsRef.current && !hintsRef.current.contains(event.target as Node)) {
        setShowHints(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHints = async () => {
      if (searchInput.trim().length < 2) {
        setHints([]);
        return;
      }

      try {
        const response = await fetch('/api/verify/search?q=' + encodeURIComponent(searchInput.trim()));
        const data = await response.json();
        if (response.ok) {
          setHints(data.hints || []);
        }
      } catch (err) {
        console.error('Error fetching hints:', err);
      }
    };

    const debounceTimer = setTimeout(fetchHints, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const verifyMember = async (value: string, forceMemberId: boolean = false) => {
    if (!value.trim()) {
      const typeLabel = searchType === 'memberId' ? 'Member ID' : searchType === 'email' ? 'Email' : searchType === 'phone' ? 'Phone Number' : 'Name';
      setError('Please enter a ' + typeLabel);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setShowHints(false);

    try {
      const queryParams = new URLSearchParams();
      
      // When forceMemberId is true (from hint click), always use memberId
      if (forceMemberId) {
        queryParams.set('memberId', value.trim());
      } else if (searchType === 'memberId') {
        queryParams.set('memberId', value.trim());
      } else if (searchType === 'email') {
        queryParams.set('email', value.trim());
      } else if (searchType === 'phone') {
        queryParams.set('phone', value.trim());
      } else if (searchType === 'name') {
        queryParams.set('name', value.trim());
      }

      const response = await fetch('/api/verify?' + queryParams.toString());
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to verify member');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHint) {
      verifyMember(selectedHint.memberId, true);
    } else {
      verifyMember(searchInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedHint) {
        verifyMember(selectedHint.memberId, true);
      } else {
        verifyMember(searchInput);
      }
    }
  };

  const handleHintSelect = (hint: SearchHint) => {
    let fillValue = hint.displayText;
    if (searchType === 'memberId') {
      fillValue = hint.memberId;
    } else if (searchType === 'email') {
      fillValue = hint.email;
    } else if (searchType === 'phone') {
      fillValue = hint.phone;
    } else if (searchType === 'name') {
      fillValue = hint.name;
    }
    
    setSelectedHint(hint);
    setSearchInput(fillValue);
    setShowHints(false);
    // Always verify by memberId when selecting from hints
    verifyMember(hint.memberId, true);
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setSearchInput('');
    setSelectedHint(null);
    setHints([]);
    setResult(null);
    setError('');
    inputRef.current?.focus();
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (session.user.role === 'Member') {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle="Verify Member" />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F2F2F7] via-[#E8E8ED] to-[#F2F2F7] p-4">
          <div className="max-w-2xl mx-auto">
            
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Verify Member</h1>
                  <p className="text-xs text-gray-500">Search by ID, Email, Phone, or Name</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
                {(Object.keys(searchTypeConfig) as SearchType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSearchTypeChange(type)}
                    className={'flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ' +
                      (searchType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                  >
                    {searchTypeConfig[type].icon}
                    <span className="hidden sm:inline">{searchTypeConfig[type].label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchInput}
                      onChange={(e) => { setSearchInput(e.target.value); setSelectedHint(null); setShowHints(true); }}
                      onFocus={() => setShowHints(true)}
                      onKeyDown={handleKeyDown}
                      placeholder={searchTypeConfig[searchType].placeholder}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      autoFocus
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  >
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Search className="w-4 h-4" />}
                    <span>Verify</span>
                  </button>
                </div>

                {showHints && hints.length > 0 && (
                  <div ref={hintsRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {hints.map((hint, index) => (
                      <button key={index} type="button" onClick={() => handleHintSelect(hint)} className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{hint.name}</p>
                            <p className="text-xs text-gray-500">ID: {hint.memberId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">{hint.phone}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">{hint.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>Searching by:</span>
                <span className="font-medium text-blue-600">{searchTypeConfig[searchType].label}</span>
              </div>

              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
            </div>

            {result && (
              <div className={'rounded-xl shadow-md border-2 p-4 ' + (result.valid ? 'bg-white border-green-200' : 'bg-white border-red-200')}>
                <div className="flex items-center gap-3 mb-3">
                  {result.valid ? (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <h2 className={'text-base font-bold ' + (result.valid ? 'text-green-700' : 'text-red-700')}>
                    {result.valid ? '✓ Valid Subscription' : '✗ ' + result.message}
                  </h2>
                </div>

                {result.member && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Name</p>
                          <p className="text-sm font-semibold text-gray-900">{result.member.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Member ID</p>
                          <p className="text-sm font-mono font-semibold text-gray-900">{result.member.memberId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                          <p className="text-xs text-gray-900">{result.member.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Email</p>
                          <p className="text-xs text-gray-900 truncate">{result.member.email}</p>
                        </div>
                      </div>
                    </div>

                    {result.subscription && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white p-2 rounded">
                            <p className="text-[10px] text-gray-500">Status</p>
                            <p className={'text-xs font-semibold ' + (result.subscription.status === 'active' ? 'text-green-600' : 'text-red-600')}>
                              {result.subscription.status.charAt(0).toUpperCase() + result.subscription.status.slice(1)}
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <p className="text-[10px] text-gray-500">Location</p>
                            <p className="text-xs font-medium text-gray-900 truncate">{result.subscription.location?.name || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <p className="text-[10px] text-gray-500">Seat</p>
                            <p className="text-xs font-medium text-gray-900">Seat {result.subscription.seat?.seatNumber || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <p className="text-[10px] text-gray-500">Duration</p>
                            <p className="text-xs font-medium text-gray-900">{result.subscription.duration}</p>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <p className="text-[10px] text-gray-500">Amount</p>
                            <p className="text-xs font-bold text-gray-900">₹{result.subscription.totalAmount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <p className="text-[10px] text-gray-500">End:</p>
                            <p className={'text-xs font-medium ' + (result.valid ? 'text-green-600' : 'text-red-600')}>
                              {new Date(result.subscription.endDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setSearchInput(''); setSelectedHint(null); setHints([]); inputRef.current?.focus(); }}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 text-xs font-medium"
                >
                  Verify Another
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
