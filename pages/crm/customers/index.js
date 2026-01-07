// pages/crm/customers/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { 
  FaSearch, 
  FaFilter, 
  FaUserPlus, 
  FaEye,
  FaUserCheck,
  FaDownload
} from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';

export default function CustomerList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    salesStatus: '',
    interestRate: '',
    country: '',
    assignedAgent: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchCustomers();
    }
  }, [status, router, pagination.page, searchQuery, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.salesStatus) params.append('salesStatus', filters.salesStatus);
      if (filters.interestRate) params.append('interestRate', filters.interestRate);
      if (filters.country) params.append('country', filters.country);
      if (filters.assignedAgent) params.append('assignedAgent', filters.assignedAgent);
      
      const response = await fetch(`/api/crm/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      salesStatus: '',
      interestRate: '',
      country: '',
      assignedAgent: ''
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      'prospect': 'bg-blue-100 text-blue-700 border-blue-200',
      'suspect': 'bg-amber-100 text-amber-700 border-amber-200',
      'lost': 'bg-red-100 text-red-700 border-red-200',
      'forcast': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'potential': 'bg-violet-100 text-violet-700 border-violet-200',
      'NOD': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[status] || colors['prospect'];
  };

  const getInterestBadge = (interest) => {
    const badges = {
      'Hot': { emoji: '🔥', color: 'bg-red-100 text-red-700 border-red-200' },
      'Warm': { emoji: '⚠️', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'Cold': { emoji: '❄️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'Unknown': { emoji: '❓', color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    return badges[interest] || badges['Unknown'];
  };

  if (status === 'loading') {
    return (
      <LoginLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </LoginLayout>
    );
  }

  const role = session?.user?.role;
  const isAdmin = role === 'superadmin' || role === 'admin';

  return (
    <LoginLayout>
      <Head>
        <title>Customers - EduGate CRM</title>
        <meta name="description" content="Manage customer records" />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isAdmin ? 'All Customers' : 'My Customers'}
                </h1>
                <p className="text-slate-400 mt-2">
                  Manage and track customer records
                </p>
              </div>
              {(role === 'superadmin' || role === 'admin' || role === 'dataentry') && (
                <Link href="/crm/customers/create">
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg">
                    <FaUserPlus className="w-5 h-5" />
                    New Customer
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-slate-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or customer number..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder-slate-400 text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                  showFilters
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <FaFilter className="w-4 h-4" />
                Filters
                {Object.values(filters).some(Boolean) && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    showFilters ? 'bg-white/20' : 'bg-blue-500 text-white'
                  }`}>
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200">
                  <FaDownload className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Sales Status
                    </label>
                    <select
                      value={filters.salesStatus}
                      onChange={(e) => handleFilterChange('salesStatus', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="prospect">prospect</option>
                      <option value="suspect">suspect</option>
                      <option value="lost">lost</option>
                      <option value="forcast">forcast</option>
                      <option value="potential">potential</option>
                      <option value="NOD">NOD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Interest Level
                    </label>
                    <select
                      value={filters.interestRate}
                      onChange={(e) => handleFilterChange('interestRate', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="Hot">🔥 Hot</option>
                      <option value="Warm">⚠️ Warm</option>
                      <option value="Cold">❄️ Cold</option>
                      <option value="Unknown">❓ Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Countries</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Jordan">Jordan</option>
                      <option value="UAE">UAE</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Active Filters */}
                {Object.values(filters).some(Boolean) && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500">Active:</span>
                    {Object.entries(filters).map(([key, value]) =>
                      value && (
                        <span
                          key={key}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {value}
                          <button
                            onClick={() => handleFilterChange(key, '')}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <RiCloseLine className="w-4 h-4" />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-slate-600">
              Showing <span className="font-bold text-blue-600">{customers.length}</span> of{' '}
              <span className="font-bold">{pagination.total}</span> customers
            </p>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Customer #</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">حالة المرشد</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Interest</th>
                    {isAdmin && (
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Agent</th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase">Next Follow-up</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="text-center py-12">
                        <Loading />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-blue-600 font-semibold">
                            {customer.customerNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {customer.basicData?.customerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {customer.basicData?.email || 'No email'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {customer.basicData?.customerPhone}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {customer.evaluation?.counselorStatus || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(customer.evaluation?.salesStatus)}`}>
                            {customer.evaluation?.salesStatus || 'prospect'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {customer.evaluation?.interestRate && (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getInterestBadge(customer.evaluation.interestRate).color}`}>
                              <span>{getInterestBadge(customer.evaluation.interestRate).emoji}</span>
                              {customer.evaluation.interestRate}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            {customer.assignment?.assignedAgentName ? (
                              <span className="text-sm text-slate-700">
                                {customer.assignment.assignedAgentName}
                              </span>
                            ) : (
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                                Assign
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          {customer.evaluation?.nextFollowupDate ? (
                            <span className="text-sm text-slate-700">
                              {new Date(customer.evaluation.nextFollowupDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/crm/customers/${customer._id}`}>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                              <FaEye className="w-4 h-4" />
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {pagination.page > 1 && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium border border-slate-200"
                >
                  ← Previous
                </button>
              )}

              {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {pagination.page < pagination.pages && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium border border-slate-200"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </LoginLayout>
  );
}
