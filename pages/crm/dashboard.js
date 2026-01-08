// pages/crm/dashboard.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { 
  FaUsers, 
  FaUserPlus, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock,
  FaCalendarWeek,
  FaChartLine,
  FaPhoneAlt,
  FaWhatsapp
} from 'react-icons/fa';

export default function CRMDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardStats();
    }
  }, [status, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <LoginLayout>
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Error loading dashboard</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchDashboardStats}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </LoginLayout>
    );
  }

  const role = session?.user?.role;
  const userName = session?.user?.name;

  // Role-based dashboard rendering
  const isAdmin = role === 'superadmin' || role === 'admin' || role === 'superagent';
  const isAgent = role === 'agent' || role === 'egecagent' || role === 'studyagent' || role === 'edugateagent';
  const isDataEntry = role === 'dataentry';

  return (
    <LoginLayout>
      <Head>
        <title>Dashboard - EduGate CRM</title>
        <meta name="description" content="CRM Dashboard for managing student leads" />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isAdmin && 'CRM Dashboard'}
                  {isAgent && `Welcome back, ${userName}`}
                  {isDataEntry && 'Data Entry Dashboard'}
                </h1>
                <p className="text-slate-400 mt-2">
                  {isAdmin && 'Overview of all customers and team performance'}
                  {isAgent && 'Your customers and follow-up tasks'}
                  {isDataEntry && 'Your customer entry statistics'}
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Customers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {isAdmin ? 'Total Customers' : isAgent ? 'My Customers' : 'My Entries'}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stats?.customers?.total || 0}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    +{stats?.customers?.newThisMonth || 0} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* New Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">New Leads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stats?.customers?.byStatus?.New || 0}
                  </p>
                  {isAdmin && (
                    <p className="text-sm text-slate-500 mt-1">
                      {stats?.customers?.unassigned || 0} unassigned
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FaUserPlus className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Qualified Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Qualified</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stats?.customers?.byStatus?.Qualified || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Ready for proposal
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Converted */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Converted</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stats?.customers?.byStatus?.Converted || 0}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    {stats?.performance?.conversionRate || 0}% rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Cards - Only for Agents and Admins */}
          {(isAgent || isAdmin) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Overdue */}
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.followups?.overdue || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/crm/followups?filter=overdue">
                  <button className="w-full py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    View Overdue
                  </button>
                </Link>
              </div>

              {/* Today */}
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaClock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Today</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {stats?.followups?.today || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/crm/followups?filter=today">
                  <button className="w-full py-2 text-sm font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                    View Today's Tasks
                  </button>
                </Link>
              </div>

              {/* This Week */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarWeek className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">This Week</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats?.followups?.thisWeek || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/crm/followups?filter=thisWeek">
                  <button className="w-full py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    View Week's Tasks
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Sales Pipeline - Admin Only */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Sales Pipeline</h2>
              <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
                {[
                  { status: 'New', count: stats?.customers?.byStatus?.New || 0, color: 'slate' },
                  { status: 'Contacted', count: stats?.customers?.byStatus?.Contacted || 0, color: 'blue' },
                  { status: 'Qualified', count: stats?.customers?.byStatus?.Qualified || 0, color: 'emerald' },
                  { status: 'Proposal Sent', count: stats?.customers?.byStatus?.['Proposal Sent'] || 0, color: 'amber' },
                  { status: 'Negotiation', count: stats?.customers?.byStatus?.Negotiation || 0, color: 'orange' },
                  { status: 'Converted', count: stats?.customers?.byStatus?.Converted || 0, color: 'violet' }
                ].map((stage, idx) => (
                  <React.Fragment key={stage.status}>
                    <div className="flex-1 min-w-[120px]">
                      <div className={`bg-${stage.color}-50 border border-${stage.color}-200 rounded-lg p-4 text-center`}>
                        <p className={`text-2xl font-bold text-${stage.color}-600`}>{stage.count}</p>
                        <p className="text-sm text-slate-600 mt-1">{stage.status}</p>
                      </div>
                    </div>
                    {idx < 5 && (
                      <div className="text-slate-400 text-2xl">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Customers / My Customers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {isAdmin ? 'Recent Customers' : isAgent ? 'My Recent Customers' : 'My Recent Entries'}
                </h3>
                <Link href="/crm/customers">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    View All →
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-slate-500 text-center py-8">
                  Loading customers...
                </p>
              </div>
            </div>

            {/* Interest Levels */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Interest Levels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="font-semibold text-slate-800">Hot</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    {stats?.customers?.byInterest?.Hot || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-semibold text-slate-800">Warm</span>
                  </div>
                  <span className="text-xl font-bold text-amber-600">
                    {stats?.customers?.byInterest?.Warm || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❄️</span>
                    <span className="font-semibold text-slate-800">Cold</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {stats?.customers?.byInterest?.Cold || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/crm/customers">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">View Customers</p>
                    <p className="text-xs text-slate-500">Manage all customer records</p>
                  </div>
                </div>
              </div>
            </Link>

            {(isAgent || isAdmin) && (
              <Link href="/crm/followups">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaClock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Follow-ups</p>
                      <p className="text-xs text-slate-500">Manage your tasks</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {isAdmin && (
              <Link href="/crm/reports">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <FaChartLine className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Reports</p>
                      <p className="text-xs text-slate-500">View analytics</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </LoginLayout>
  );
}
