// pages/crm/users/index.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { FaUserPlus, FaEdit, FaLock, FaUnlock } from 'react-icons/fa';

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    phone: ''
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      // Only admin and superadmin can access user management (NOT superagent)
      if (role !== 'admin' && role !== 'superadmin') {
        router.push('/crm/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [status, router, session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      // Handle both response formats
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error('Unexpected response format:', data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.error || data.message || 'Failed to create user');
        setCreating(false);
        return;
      }

      // Success - close modal and refresh list
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'agent', phone: '' });
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError('Failed to create user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this user?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        fetchUsers(); // Refresh list
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'superadmin': 'bg-rose-100 text-rose-700',
      'admin': 'bg-violet-100 text-violet-700',
      'superagent': 'bg-amber-100 text-amber-700',
      'agent': 'bg-blue-100 text-blue-700',
      'dataentry': 'bg-emerald-100 text-emerald-700'
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'superagent': 'Super Agent',
      'agent': 'Agent',
      'dataentry': 'Data Entry',
      'egecagent': 'EGEC Agent',
      'studyagent': 'Study Agent',
      'edugateagent': 'EduGate Agent'
    };
    return labels[role] || role;
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
        <title>User Management - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <p className="text-slate-400 mt-2">Manage system users and roles</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600"
              >
                <FaUserPlus className="w-5 h-5" />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Last Login</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500">
                      No users found. Create your first user!
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit user"
                          disabled={session?.user?.role === 'admin' && user.role === 'superadmin'}
                          style={{ 
                            opacity: session?.user?.role === 'admin' && user.role === 'superadmin' ? 0.3 : 1,
                            cursor: session?.user?.role === 'admin' && user.role === 'superadmin' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                          title={user.isActive ? 'Disable user' : 'Enable user'}
                          disabled={session?.user?.role === 'admin' && user.role === 'superadmin'}
                          style={{ 
                            opacity: session?.user?.role === 'admin' && user.role === 'superadmin' ? 0.3 : 1,
                            cursor: session?.user?.role === 'admin' && user.role === 'superadmin' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {user.isActive ? <FaLock className="w-4 h-4" /> : <FaUnlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                <h3 className="text-2xl font-bold">Create New User</h3>
                <p className="text-blue-100 mt-1">Add a new user to the system</p>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+966501234567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {session?.user?.role === 'superadmin' && (
                      <>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                      </>
                    )}
                    {session?.user?.role === 'admin' && (
                      <option value="admin">Admin</option>
                    )}
                    <option value="superagent">Super Agent</option>
                    <option value="agent">Agent</option>
                    <option value="dataentry">Data Entry</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {session?.user?.role === 'admin' ? 'Admins cannot create superadmin users' : 'Select user role'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                      setCreateForm({ name: '', email: '', password: '', role: 'agent', phone: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
                <h3 className="text-2xl font-bold">Edit User</h3>
                <p className="text-violet-100 mt-1">Update user information</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.userPhone || ''}
                    onChange={(e) => setEditingUser({...editingUser, userPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                    disabled={session?.user?.role !== 'superadmin'}
                  >
                    {session?.user?.role === 'superadmin' && (
                      <>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                      </>
                    )}
                    <option value="superagent">Super Agent</option>
                    <option value="agent">Agent</option>
                    <option value="dataentry">Data Entry</option>
                  </select>
                  {session?.user?.role !== 'superadmin' && (
                    <p className="text-xs text-slate-500 mt-1">Only superadmin can change roles</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (optional)</label>
                  <input
                    type="password"
                    placeholder="Leave empty to keep current password"
                    onChange={(e) => setEditingUser({...editingUser, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/users/${editingUser._id}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: editingUser.email,
                            role: editingUser.role,
                            newPassword: editingUser.newPassword
                          })
                        });

                        if (response.ok) {
                          setShowEditModal(false);
                          setEditingUser(null);
                          fetchUsers();
                        } else {
                          const data = await response.json();
                          alert(data.error || 'Failed to update user');
                        }
                      } catch (err) {
                        console.error('Error updating user:', err);
                        alert('Failed to update user');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-purple-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoginLayout>
  );
}
