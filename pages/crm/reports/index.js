// pages/crm/reports/index.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { FaChartLine, FaDownload } from 'react-icons/fa';

export default function Reports() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role !== 'admin' && role !== 'superadmin' && role !== 'superagent') {
        router.push('/crm/dashboard');
        return;
      }
      fetchStats();
    }
  }, [status, router, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
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

  return (
    <LoginLayout>
      <Head>
        <title>Reports - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                <p className="text-slate-400 mt-2">Performance insights and statistics</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
                <FaDownload className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Available Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Counselor Status Report */}
            <div 
              onClick={() => router.push('/crm/reports/counselor-status')}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="text-white">
                <FaChartLine className="text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">تقرير حالة المرشد</h3>
                <p className="text-blue-100 text-sm mb-4">
                  تقارير مفصلة لحالة كل مرشد مع العملاء حسب نوع الدرجة العلمية
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>عرض التقرير</span>
                  <span>←</span>
                </div>
              </div>
            </div>
            
            {/* Sales Pipeline Report (Coming Soon) */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 opacity-50">
              <div className="text-white">
                <FaChartLine className="text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Sales Pipeline</h3>
                <p className="text-green-100 text-sm mb-4">
                  Track customers through each stage of the sales process
                </p>
                <div className="text-sm font-semibold">Coming Soon</div>
              </div>
            </div>
            
            {/* Agent Performance Report (Coming Soon) */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 opacity-50">
              <div className="text-white">
                <FaChartLine className="text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Agent Performance</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Individual agent metrics and performance indicators
                </p>
                <div className="text-sm font-semibold">Coming Soon</div>
              </div>
            </div>
          </div>
          
          {/* Sales Pipeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Sales Pipeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats?.customers?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-600 mt-1">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interest Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Interest Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats?.customers?.byInterest || {}).map(([interest, count]) => (
                <div key={interest} className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {interest === 'Hot' && '🔥'} 
                    {interest === 'Warm' && '⚠️'} 
                    {interest === 'Cold' && '❄️'} 
                    {interest === 'Unknown' && '❓'} 
                    {' '}{interest}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-3xl font-bold text-emerald-600">
                  {stats?.performance?.conversionRate || 0}%
                </p>
                <p className="text-sm text-slate-600 mt-2">Conversion Rate</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.followups?.completedThisMonth || 0}
                </p>
                <p className="text-sm text-slate-600 mt-2">Follow-ups This Month</p>
              </div>
              <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-3xl font-bold text-amber-600">
                  {stats?.customers?.newThisMonth || 0}
                </p>
                <p className="text-sm text-slate-600 mt-2">New Customers This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoginLayout>
  );
}
