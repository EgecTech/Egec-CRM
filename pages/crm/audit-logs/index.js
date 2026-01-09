// pages/crm/audit-logs/index.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { FaSearch, FaDownload, FaEye } from 'react-icons/fa';

export default function AuditLogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role !== 'superadmin') {
        router.push('/crm/dashboard');
        return;
      }
      fetchAuditLogs();
    }
  }, [status, router, session, pagination.page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/crm/audit-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            pages: data.pagination.pages
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      'CREATE': 'bg-emerald-100 text-emerald-700',
      'UPDATE': 'bg-blue-100 text-blue-700',
      'DELETE': 'bg-red-100 text-red-700',
      'ASSIGN': 'bg-violet-100 text-violet-700',
      'LOGIN': 'bg-slate-100 text-slate-700'
    };
    return colors[action] || 'bg-slate-100 text-slate-700';
  };

  if (status === 'loading' || loading) {
    return (
      <LoginLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout>
      <Head>
        <title>Audit Logs - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                <p className="text-slate-400 mt-2">Complete system activity trail</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
                <FaDownload className="w-4 h-4" />
                Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="ASSIGN">Assign</option>
              </select>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Entities</option>
                <option value="customer">Customer</option>
                <option value="followup">Follow-up</option>
                <option value="user">User</option>
              </select>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Entity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Details</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-700">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{log.userName}</p>
                        <p className="text-xs text-slate-500">{log.userEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{log.entityType}</p>
                        <p className="text-xs text-slate-500">{log.entityName}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {log.changes?.length > 0 && (
                          <span className="text-xs">
                            {log.changes.length} field(s) changed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <FaEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <div className="text-sm text-slate-600 mr-4">
                Showing <span className="font-bold text-blue-600">{logs.length}</span> of{' '}
                <span className="font-bold">{pagination.total}</span> logs
              </div>
              
              {pagination.page > 1 && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium border border-slate-200 shadow-sm hover:shadow transition-all"
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
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {pagination.page < pagination.pages && (
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium border border-slate-200 shadow-sm hover:shadow transition-all"
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
