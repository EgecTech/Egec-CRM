// pages/crm/audit-logs/index.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { FaSearch, FaDownload, FaEye, FaTimes } from 'react-icons/fa';

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
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      'assigned': 'bg-violet-100 text-violet-700',
      'CUSTOMER_AGENT_ADDED': 'bg-purple-100 text-purple-700',
      'AGENT_ADDED': 'bg-indigo-100 text-indigo-700',
      'UPDATE_SYSTEM_SETTING': 'bg-amber-100 text-amber-700',
      'DELETE_SYSTEM_SETTING': 'bg-rose-100 text-rose-700',
      'UPDATE_USER': 'bg-cyan-100 text-cyan-700',
      'DELETE_USER': 'bg-red-100 text-red-700',
      'UPDATE_PROFILE': 'bg-teal-100 text-teal-700',
      'LOGIN': 'bg-green-100 text-green-700',
      'LOGOUT': 'bg-slate-100 text-slate-700',
      'LOGIN_FAILED': 'bg-red-100 text-red-700'
    };
    return colors[action] || 'bg-slate-100 text-slate-700';
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedLog(null);
    setShowDetailModal(false);
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
                <p className="text-slate-400 mt-2">Complete system activity trail - {pagination.total} total logs</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
                <FaDownload className="w-4 h-4" />
                Export Logs
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <p className="text-slate-400 text-sm">Total Logs</p>
                <p className="text-white text-2xl font-bold mt-1">{pagination.total}</p>
              </div>
              <div className="bg-emerald-700/50 rounded-lg p-4 border border-emerald-600">
                <p className="text-emerald-200 text-sm">Showing</p>
                <p className="text-white text-2xl font-bold mt-1">{logs.length}</p>
              </div>
              <div className="bg-blue-700/50 rounded-lg p-4 border border-blue-600">
                <p className="text-blue-200 text-sm">Current Page</p>
                <p className="text-white text-2xl font-bold mt-1">{pagination.page} / {pagination.pages || 1}</p>
              </div>
              <div className="bg-violet-700/50 rounded-lg p-4 border border-violet-600">
                <p className="text-violet-200 text-sm">Per Page</p>
                <p className="text-white text-2xl font-bold mt-1">{pagination.limit}</p>
              </div>
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
                <option value="assigned">assigned (lowercase)</option>
                <option value="CUSTOMER_AGENT_ADDED">Customer Agent Added</option>
                <option value="AGENT_ADDED">Agent Added</option>
                <option value="UPDATE_SYSTEM_SETTING">Update System Setting</option>
                <option value="DELETE_SYSTEM_SETTING">Delete System Setting</option>
                <option value="UPDATE_USER">Update User (Admin)</option>
                <option value="DELETE_USER">Delete User</option>
                <option value="UPDATE_PROFILE">Update Profile (Self)</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="LOGIN_FAILED">Login Failed</option>
              </select>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Entities</option>
                <option value="customer">customer (lowercase)</option>
                <option value="Customer">Customer (uppercase)</option>
                <option value="followup">followup</option>
                <option value="profile">profile (User Management)</option>
                <option value="system_setting">system_setting</option>
                <option value="auth">auth (Authentication)</option>
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
                        <div className="space-y-1">
                          {log.changes?.length > 0 && (
                            <div className="text-xs text-slate-600">
                              📝 {log.changes.length} field(s) changed
                            </div>
                          )}
                          {log.description && (
                            <div className="text-xs text-slate-500 italic">
                              {log.description}
                            </div>
                          )}
                          {log.details?.totalAgents && (
                            <div className="text-xs text-blue-600">
                              👥 Total agents: {log.details.totalAgents}
                            </div>
                          )}
                          {!log.changes?.length && !log.description && !log.details?.totalAgents && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openDetailModal(log)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
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

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Audit Log Details</h3>
              <button
                onClick={closeDetailModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Action</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getActionBadge(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Entity Type</label>
                    <p className="mt-1 text-slate-900 font-medium">{selectedLog.entityType || '-'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Entity Name</label>
                    <p className="mt-1 text-slate-900 font-medium">{selectedLog.entityName || '-'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Entity ID</label>
                    <p className="mt-1 text-slate-700 text-sm font-mono bg-slate-50 px-2 py-1 rounded">
                      {selectedLog.entityId || '-'}
                    </p>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Performed By</label>
                    <p className="mt-1 text-slate-900 font-medium">{selectedLog.userName || 'System'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">User Email</label>
                    <p className="mt-1 text-slate-700">{selectedLog.userEmail || '-'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">User Role</label>
                    <p className="mt-1 text-slate-900 font-medium capitalize">{selectedLog.userRole || '-'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Timestamp</label>
                    <p className="mt-1 text-slate-700">
                      {new Date(selectedLog.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedLog.description && (
                <div className="mt-6">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                  <p className="mt-2 text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedLog.description}</p>
                </div>
              )}

              {/* Changes */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div className="mt-6">
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-3 block">
                    Field Changes ({selectedLog.changes.length})
                  </label>
                  <div className="space-y-3">
                    {selectedLog.changes.map((change, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="font-semibold text-slate-900 mb-2">{change.field}</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs font-semibold text-red-600 uppercase">Old Value</span>
                            <p className="mt-1 text-slate-700 bg-red-50 px-3 py-2 rounded border border-red-200 whitespace-pre-wrap break-words">
                              {change.oldValue 
                                ? (typeof change.oldValue === 'object' 
                                    ? JSON.stringify(change.oldValue, null, 2) 
                                    : String(change.oldValue))
                                : <span className="text-slate-400 italic">empty</span>}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-green-600 uppercase">New Value</span>
                            <p className="mt-1 text-slate-700 bg-green-50 px-3 py-2 rounded border border-green-200 whitespace-pre-wrap break-words">
                              {change.newValue 
                                ? (typeof change.newValue === 'object' 
                                    ? JSON.stringify(change.newValue, null, 2) 
                                    : String(change.newValue))
                                : <span className="text-slate-400 italic">empty</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="mt-6 border-t border-slate-200 pt-6">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-3 block">Technical Details</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">IP Address:</span>
                    <span className="ml-2 text-slate-900 font-mono">{selectedLog.ipAddress || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Request Method:</span>
                    <span className="ml-2 text-slate-900 font-semibold">{selectedLog.requestMethod || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Request Path:</span>
                    <span className="ml-2 text-slate-700 font-mono text-xs">{selectedLog.requestPath || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Status Code:</span>
                    <span className={`ml-2 font-semibold ${
                      selectedLog.statusCode >= 200 && selectedLog.statusCode < 300 
                        ? 'text-green-600' 
                        : selectedLog.statusCode >= 400 
                        ? 'text-red-600' 
                        : 'text-slate-900'
                    }`}>
                      {selectedLog.statusCode || '-'}
                    </span>
                  </div>
                </div>

                {selectedLog.userAgent && (
                  <div className="mt-3">
                    <span className="text-slate-500 text-sm">User Agent:</span>
                    <p className="mt-1 text-slate-700 text-xs font-mono bg-slate-100 px-3 py-2 rounded break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {selectedLog.errorMessage && (
                  <div className="mt-3">
                    <span className="text-red-600 text-sm font-semibold">Error Message:</span>
                    <p className="mt-1 text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </LoginLayout>
  );
}
