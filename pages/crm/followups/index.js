// pages/crm/followups/index.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { 
  FaClock, 
  FaExclamationTriangle, 
  FaCalendarWeek,
  FaCheck,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaUsers
} from 'react-icons/fa';

export default function FollowupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { filter } = router.query;
  
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(filter || 'all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchFollowups();
    }
  }, [status, router, activeFilter]);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (activeFilter === 'overdue') params.append('overdue', 'true');
      if (activeFilter === 'today') params.append('today', 'true');
      if (activeFilter === 'thisWeek') params.append('thisWeek', 'true');
      if (activeFilter === 'pending') params.append('status', 'Pending');
      if (activeFilter === 'completed') params.append('status', 'Completed');
      
      const response = await fetch(`/api/crm/followups?${params}`);
      const data = await response.json();

      if (data.success) {
        setFollowups(data.data);
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (followupId) => {
    try {
      const response = await fetch(`/api/crm/followups/${followupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          completedAt: new Date()
        })
      });

      if (response.ok) {
        fetchFollowups();
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  const getFollowupIcon = (type) => {
    const icons = {
      'Call': <FaPhone className="w-4 h-4" />,
      'WhatsApp': <FaWhatsapp className="w-4 h-4" />,
      'Meeting': <FaUsers className="w-4 h-4" />,
      'Email': <FaEnvelope className="w-4 h-4" />,
      'SMS': <FaPhone className="w-4 h-4" />,
      'Note': <FaEnvelope className="w-4 h-4" />
    };
    return icons[type] || icons['Note'];
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
        <title>Follow-ups - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Follow-up Management</h1>
            <p className="text-slate-400 mt-2">Track and manage your customer follow-ups</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All Follow-ups', icon: FaClock },
                { id: 'overdue', label: 'Overdue', icon: FaExclamationTriangle, color: 'red' },
                { id: 'today', label: 'Today', icon: FaClock, color: 'amber' },
                { id: 'thisWeek', label: 'This Week', icon: FaCalendarWeek, color: 'blue' },
                { id: 'pending', label: 'Pending', icon: FaClock, color: 'slate' },
                { id: 'completed', label: 'Completed', icon: FaCheck, color: 'emerald' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeFilter === tab.id
                      ? `border-${tab.color || 'blue'}-500 text-${tab.color || 'blue'}-600`
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {followups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-500">No follow-ups found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {followups.map(followup => {
                const isOverdue = followup.status === 'Pending' && new Date(followup.followupDate) < new Date();
                const isToday = followup.status === 'Pending' && 
                  new Date(followup.followupDate).toDateString() === new Date().toDateString();

                return (
                  <div
                    key={followup._id}
                    className={`bg-white rounded-xl shadow-sm border p-6 ${
                      isOverdue ? 'border-red-300 bg-red-50/30' :
                      isToday ? 'border-amber-300 bg-amber-50/30' :
                      'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isOverdue ? 'bg-red-100 text-red-600' :
                            isToday ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {getFollowupIcon(followup.followupType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900">{followup.followupType}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                followup.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                followup.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {followup.status}
                              </span>
                              {isOverdue && (
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              Customer: <Link href={`/crm/customers/${followup.customerId?._id || followup.customerId}`}>
                                <span className="text-blue-600 hover:underline font-semibold">
                                  {followup.customerName}
                                </span>
                              </Link>
                            </p>
                          </div>
                        </div>

                        <p className="text-slate-700 mb-3">{followup.notes}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>📅 {new Date(followup.followupDate).toLocaleString()}</span>
                          {followup.outcome && <span>✅ {followup.outcome}</span>}
                          {followup.durationMinutes && <span>⏱️ {followup.durationMinutes} min</span>}
                        </div>

                        {followup.nextFollowupDate && (
                          <p className="text-sm text-blue-600 mt-2">
                            Next follow-up: {new Date(followup.nextFollowupDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {followup.status === 'Pending' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => markComplete(followup._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                          >
                            <FaCheck className="w-4 h-4" />
                            Complete
                          </button>
                          <Link href={`/crm/customers/${followup.customerId?._id || followup.customerId}`}>
                            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 w-full">
                              View Customer
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LoginLayout>
  );
}
