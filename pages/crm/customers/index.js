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
  FaEdit,
  FaUserCheck,
  FaDownload,
  FaTrash,
  FaExchangeAlt
} from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';

export default function CustomerList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDegreeTab, setActiveDegreeTab] = useState('all'); // all, bachelor, master, phd
  const [filters, setFilters] = useState({
    counselorStatus: '',
    primaryAgent: '',
    assignedAgent: '',
    createdFrom: '',
    createdTo: ''
  });
  const [degreeStats, setDegreeStats] = useState({
    all: 0,
    bachelor: 0,
    master: 0,
    phd: 0
  });
  const [systemSettings, setSystemSettings] = useState({});
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [reassignModal, setReassignModal] = useState({
    show: false,
    customer: null,
    selectedAgentId: '',
    reason: ''
  });

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/crm/system-settings');
      if (!response.ok) {
        console.error('System settings API error:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      if (data.success) {
        const settings = {};
        data.data.forEach(setting => {
          settings[setting.settingKey] = setting.settingValue;
        });
        setSystemSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        console.error('Admin users API error:', response.status, response.statusText);
        setAgents([]);
        return;
      }
      const data = await response.json();
      let usersList = [];
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }
      const agentUsers = usersList.filter(user => 
        user.role === 'agent' && user.isActive
      );
      setAgents(agentUsers);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setAgents([]);
    }
  };

  const fetchDegreeStats = async () => {
    try {
      const response = await fetch('/api/crm/customers/stats');
      if (!response.ok) {
        console.error('Degree stats API error:', response.status, response.statusText);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setDegreeStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching degree stats:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.counselorStatus) params.append('counselorStatus', filters.counselorStatus);
      if (filters.primaryAgent) params.append('primaryAgent', filters.primaryAgent);
      if (filters.assignedAgent) params.append('assignedAgent', filters.assignedAgent);
      if (filters.createdFrom) params.append('createdFrom', filters.createdFrom);
      if (filters.createdTo) params.append('createdTo', filters.createdTo);
      
      // Add degree type filter
      if (activeDegreeTab !== 'all') {
        params.append('degreeType', activeDegreeTab);
      }
      
      const response = await fetch(`/api/crm/customers?${params}`);
      if (!response.ok) {
        console.error('Customers API error:', response.status, response.statusText);
        setCustomers([]);
        setLoading(false);
        return;
      }
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

  const handleDelete = async (customerId, customerName) => {
    if (!confirm(`Are you sure you want to delete customer: ${customerName}?\n\nThis action will soft-delete the customer (can be recovered by superadmin).`)) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to delete customer: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Customer deleted successfully!');
        // Refresh customer list
        fetchCustomers();
        // Refresh stats
        fetchDegreeStats();
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer. Please try again.');
    }
  };

  const openReassignModal = (customer) => {
    setReassignModal({
      show: true,
      customer: customer,
      selectedAgentId: '',
      reason: ''
    });
  };

  const closeReassignModal = () => {
    setReassignModal({
      show: false,
      customer: null,
      selectedAgentId: '',
      reason: ''
    });
  };

  const handleReassign = async () => {
    if (!reassignModal.selectedAgentId) {
      alert('Please select an agent');
      return;
    }

    try {
      const response = await fetch(
        `/api/crm/customers/${reassignModal.customer._id}/add-agent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: reassignModal.selectedAgentId,
            reason: reassignModal.reason
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✓ ${data.message}\n\nAgent added successfully! Both agents can now work on this customer independently.`);
        closeReassignModal();
        fetchCustomers(); // Refresh customer list
      } else {
        alert(`Error: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error adding agent to customer:', error);
      alert('Failed to add agent');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      const isAdminUser = role === 'superadmin' || role === 'admin' || role === 'superagent';
      const isAgentUser = role === 'agent';
      const isDataEntryUser = role === 'dataentry';
      
      fetchCustomers();
      
      // Fetch system settings for all users (needed for filters)
      fetchSystemSettings();
      
      // Fetch agents only for admin users
      if (isAdminUser) {
        fetchAgents();
      }
      
      // Fetch degree stats for admin, agent, and data entry users
      if (isAdminUser || isAgentUser || isDataEntryUser) {
        fetchDegreeStats();
      }
    }
  }, [status, router, pagination.page, searchQuery, filters, session, activeDegreeTab]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleDegreeTabChange = (tab) => {
    setActiveDegreeTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = useCallback(() => {
    setFilters({
      counselorStatus: '',
      primaryAgent: '',
      assignedAgent: '',
      createdFrom: '',
      createdTo: ''
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);


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
  const userId = session?.user?.id;
  const isAdmin = role === 'superadmin' || role === 'admin' || role === 'superagent';
  const isAgent = role === 'agent';
  const isDataEntry = role === 'dataentry';
  const canAccessCustomers = isAdmin || isAgent || isDataEntry;

  // Helper function to get counselorStatus to display in table
  const getCounselorStatusForDisplay = (customer) => {
    if (!customer?.assignment?.assignedAgents || customer.assignment.assignedAgents.length === 0) {
      return '-';
    }
    
    // For ADMINS: Show primary agent's counselorStatus (or first active agent)
    if (isAdmin) {
      const primaryAgentId = customer.assignment?.assignedAgentId?.toString();
      
      // Try to find primary agent
      if (primaryAgentId) {
        const primaryAgent = customer.assignment.assignedAgents.find(
          agent => agent.agentId?.toString() === primaryAgentId && agent.isActive
        );
        if (primaryAgent) {
          return primaryAgent.counselorStatus || '-';
        }
      }
      
      // Fallback: Get first active agent's status
      const firstActiveAgent = customer.assignment.assignedAgents.find(agent => agent.isActive);
      return firstActiveAgent?.counselorStatus || '-';
    }
    
    // For AGENTS: Show their own counselorStatus for this customer
    if (!userId) {
      return '-';
    }
    
    const currentAgentEntry = customer.assignment.assignedAgents.find(
      agent => agent.agentId?.toString() === userId.toString() && agent.isActive
    );
    
    return currentAgentEntry?.counselorStatus || '-';
  };

  // Redirect if no access
  if (status === 'authenticated' && !canAccessCustomers) {
    router.push('/crm/dashboard');
    return null;
  }

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
                  {isAdmin ? 'All Customers' : isAgent ? 'My Assigned Customers' : 'My Customers'}
                </h1>
                <p className="text-slate-400 mt-2">
                  {isAdmin ? 'Manage and track all customer records' : isAgent ? 'Manage your assigned customer records' : 'View and manage your created customers'}
                </p>
              </div>
              {(role === 'superadmin' || role === 'admin' || role === 'superagent' || role === 'dataentry') && (
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
          {/* Degree Type Tabs - For all users (Admin, Super Agent, Agent, Data Entry) */}
          {(isAdmin || isAgent || isDataEntry) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => handleDegreeTabChange('all')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                  activeDegreeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📊 All Customers</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                    activeDegreeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {degreeStats.all.toLocaleString()}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleDegreeTabChange('bachelor')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                  activeDegreeTab === 'bachelor'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Bachelor (بكالوريوس)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                    activeDegreeTab === 'bachelor' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {degreeStats.bachelor.toLocaleString()}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleDegreeTabChange('master')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                  activeDegreeTab === 'master'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Master (ماجستير)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                    activeDegreeTab === 'master' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {degreeStats.master.toLocaleString()}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleDegreeTabChange('phd')}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                  activeDegreeTab === 'phd'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>PhD (دكتوراه)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                    activeDegreeTab === 'phd' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {degreeStats.phd.toLocaleString()}
                  </span>
                </div>
              </button>
            </div>
          </div>
          )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Counselor Status - Available for all roles */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      حالة المرشد (Counselor Status)
                    </label>
                    <select
                      value={filters.counselorStatus}
                      onChange={(e) => handleFilterChange('counselorStatus', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Statuses</option>
                      {(systemSettings.counselor_statuses || []).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Agent Filter - Only for Admin roles */}
                  {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Primary Agent (المرشد الأساسي)
                    </label>
                    <select
                      value={filters.primaryAgent}
                      onChange={(e) => handleFilterChange('primaryAgent', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Customers</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  )}
                  
                  {/* Assigned Agents Filter - Only for Admin roles */}
                  {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Assigned Agents (جميع المرشدين)
                    </label>
                    <select
                      value={filters.assignedAgent}
                      onChange={(e) => handleFilterChange('assignedAgent', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">All Customers</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      📅 Created From (من تاريخ)
                    </label>
                    <input
                      type="date"
                      value={filters.createdFrom}
                      onChange={(e) => handleFilterChange('createdFrom', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      📅 Created To (إلى تاريخ)
                    </label>
                    <input
                      type="date"
                      value={filters.createdTo}
                      onChange={(e) => handleFilterChange('createdTo', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                    />
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
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Customer #</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Name</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase hidden sm:table-cell">Phone</th>
                    {isAgent && (
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Status</th>
                    )}
                    {isAdmin && (
                      <>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase hidden lg:table-cell">Primary</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Agents</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Status</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase">Latest Update</th>
                      </>
                    )}
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold uppercase hidden md:table-cell">Specialization</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : isAgent ? 6 : 5} className="text-center py-12">
                        <Loading />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : isAgent ? 6 : 5} className="text-center py-12 text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className="font-mono text-[10px] sm:text-xs text-blue-600 font-semibold">
                            {customer.customerNumber}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div>
                            <p className="font-semibold text-[11px] sm:text-sm text-slate-900">
                              {customer.basicData?.customerName}
                            </p>
                            <p className="text-[9px] sm:text-xs text-slate-500 sm:hidden">
                              {customer.basicData?.customerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                          <span className="text-xs sm:text-sm text-slate-700">
                            {customer.basicData?.customerPhone}
                          </span>
                        </td>
                        {isAgent && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className={`text-[10px] sm:text-xs font-medium ${
                              getCounselorStatusForDisplay(customer) !== '-' 
                                ? 'text-blue-700' 
                                : 'text-slate-400'
                            }`}>
                              {getCounselorStatusForDisplay(customer)}
                            </span>
                          </td>
                        )}
                        {isAdmin && (
                          <>
                            {/* Primary Agent Column */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                              {customer.assignment?.assignedAgentName ? (
                                <span className="text-xs sm:text-sm font-semibold text-blue-700">
                                  {customer.assignment.assignedAgentName}
                                </span>
                              ) : (
                                <span className="text-[10px] sm:text-xs text-slate-400">Not assigned</span>
                              )}
                            </td>
                            
                            {/* Assigned Agents Column (All agents) */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {customer.assignment?.assignedAgents && customer.assignment.assignedAgents.length > 0 ? (
                                <div className="flex flex-wrap gap-0.5 sm:gap-1">
                                  {customer.assignment.assignedAgents
                                    .filter(agent => agent.isActive)
                                    .map((agent, idx) => (
                                      <span 
                                        key={idx}
                                        className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-[9px] sm:text-xs font-medium rounded-full"
                                      >
                                        {agent.agentName}
                                      </span>
                                    ))}
                                  {customer.assignment.assignedAgents.filter(a => a.isActive).length === 0 && (
                                    <span className="text-[10px] sm:text-xs text-slate-400">No active agents</span>
                                  )}
                                </div>
                              ) : (
                                // Fallback to show primary agent if assignedAgents array doesn't exist
                                customer.assignment?.assignedAgentName ? (
                                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-[9px] sm:text-xs font-medium rounded-full">
                                    {customer.assignment.assignedAgentName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] sm:text-xs text-slate-400">Not assigned</span>
                                )
                              )}
                            </td>

                            {/* Counselor Status for Each Agent (Statuses Only - Aligned with Agents Above) */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {customer.assignment?.assignedAgents && customer.assignment.assignedAgents.length > 0 ? (
                                <div className="flex flex-wrap gap-0.5 sm:gap-1">
                                  {customer.assignment.assignedAgents
                                    .filter(agent => agent.isActive)
                                    .map((agent, idx) => (
                                      <span 
                                        key={idx}
                                        className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
                                          agent.counselorStatus 
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                                        }`}
                                      >
                                        {agent.counselorStatus || '-'}
                                      </span>
                                    ))}
                                  {customer.assignment.assignedAgents.filter(a => a.isActive).length === 0 && (
                                    <span className="text-[10px] sm:text-xs text-slate-400">No active agents</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] sm:text-xs text-slate-400">Not assigned</span>
                              )}
                            </td>

                            {/* 🎯 Latest Status Update (Main Status - from any agent) */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {customer.assignment?.latestCounselorStatus?.status ? (
                                <div>
                                  <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 text-[9px] sm:text-xs font-bold rounded-full">
                                    {customer.assignment.latestCounselorStatus.status}
                                  </span>
                                  <div className="mt-1 text-[8px] sm:text-[10px] text-slate-500">
                                    by {customer.assignment.latestCounselorStatus.agentName}
                                    {customer.assignment.latestCounselorStatus.updatedAt && (
                                      <span className="block">
                                        {new Date(customer.assignment.latestCounselorStatus.updatedAt).toLocaleDateString('en-GB', { 
                                          day: '2-digit', 
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] sm:text-xs text-slate-400">No updates yet</span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                          <span className="text-xs sm:text-sm text-slate-700">
                            {customer.desiredProgram?.desiredSpecialization || '-'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                            <Link href={`/crm/customers/${customer._id}`}>
                              <button 
                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="View Profile"
                              >
                                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </Link>
                            <Link href={`/crm/customers/${customer._id}/edit`}>
                              <button 
                                className="p-1.5 sm:p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                title="Edit Customer"
                              >
                                <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </Link>
                            {(session?.user?.role === 'admin' || session?.user?.role === 'superadmin' || session?.user?.role === 'superagent') && (
                              <button 
                                onClick={() => openReassignModal(customer)}
                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="Add Another Agent"
                              >
                                <FaExchangeAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                            {session?.user?.role === 'superadmin' && (
                              <button 
                                onClick={() => handleDelete(customer._id, customer.basicData?.customerName)}
                                className="p-1.5 sm:p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                title="Delete Customer"
                              >
                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
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

      {/* Reassignment Modal */}
      {reassignModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Add Agent to Customer
                </h3>
                <button
                  onClick={closeReassignModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Customer Details:
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Name:</strong> {reassignModal.customer?.basicData?.customerName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Customer #:</strong> {reassignModal.customer?.customerNumber}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Assigned Agents:</strong>{' '}
                  {reassignModal.customer?.assignment?.assignedAgents?.filter(a => a.isActive).map(a => a.agentName).join(', ') || 
                   reassignModal.customer?.assignment?.assignedAgentName || 'None'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reassign to Agent: <span className="text-red-500">*</span>
                </label>
                <select
                  value={reassignModal.selectedAgentId}
                  onChange={(e) => setReassignModal(prev => ({
                    ...prev,
                    selectedAgentId: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Select Agent...</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} - {agent.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reason (Optional):
                </label>
                <textarea
                  value={reassignModal.reason}
                  onChange={(e) => setReassignModal(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  rows="3"
                  placeholder="Why are you reassigning this customer?"
                />
              </div>

              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-bold text-yellow-900 mb-2">
                  ⚠️ Important Notice:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                  <li>All customer data will be transferred to the new agent</li>
                  <li><strong>Counselor Status (حالة المرشد) will be RESET</strong></li>
                  <li>New agent can set their own counselor status</li>
                  <li>Follow-up history will be preserved</li>
                  <li>Reassignment will be logged in history</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeReassignModal}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!reassignModal.selectedAgentId}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    reassignModal.selectedAgentId
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoginLayout>
  );
}
