// pages/crm/customers/[id].js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { 
  FaArrowLeft, 
  FaPhone, 
  FaWhatsapp, 
  FaEnvelope,
  FaEdit,
  FaUserCheck,
  FaCalendarPlus,
  FaFileAlt
} from 'react-icons/fa';

export default function CustomerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [customer, setCustomer] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupForm, setFollowupForm] = useState({
    followupType: 'Call',
    followupDate: '',
    nextFollowupDate: '',
    notes: '',
    outcome: ''
  });
  const [savingFollowup, setSavingFollowup] = useState(false);

  // Permission checks
  const role = session?.user?.role;
  const isAgent = role === 'agent';
  const isSuperAgent = role === 'superagent';
  const canSeeMarketing = !isAgent && !isSuperAgent; // Only Superadmin and Admin can see marketing data
  const canViewReassignmentHistory = role === 'admin' || role === 'superadmin' || role === 'superagent'; // Only Admin, Superadmin, and Superagent can see reassignment history

  // Dynamic tabs based on role
  const TABS = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    ...(canSeeMarketing ? [{ id: 'marketing', label: 'Marketing Data', icon: '📊' }] : []),
    { id: 'qualification', label: 'Qualification', icon: '🎓' },
    { id: 'desired', label: 'Desired Program', icon: '🎯' },
    { id: 'evaluation', label: 'Evaluation', icon: '⭐' },
    { id: 'followups', label: 'Follow-ups', icon: '📞' },
    { id: 'timeline', label: 'Activity', icon: '📋' }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchCustomer();
      fetchFollowups();
    }
  }, [status, router, id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/customers/${id}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this customer
  const canEdit = () => {
    if (!customer || !session?.user) return false;

    const userId = session.user.id;

    // Superadmin, Admin, and Superagent can edit all customers
    if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
      return true;
    }

    // Data Entry can edit their own customers within 15 minutes
    if (role === 'dataentry') {
      const createdBy = customer.createdBy?.toString() || customer.createdBy;
      if (createdBy !== userId) return false;

      const createdAt = new Date(customer.createdAt);
      const now = new Date();
      const minutesSinceCreation = (now - createdAt) / 1000 / 60;

      return minutesSinceCreation <= 15;
    }

    // Agents can edit their assigned customers
    if (role === 'agent') {
      const assignedAgentId = customer.assignment?.assignedAgentId?.toString() || customer.assignment?.assignedAgentId;
      return assignedAgentId === userId;
    }

    return false;
  };

  const fetchFollowups = async () => {
    try {
      const response = await fetch(`/api/crm/followups?customerId=${id}`);
      const data = await response.json();

      if (data.success) {
        setFollowups(data.data);
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    setSavingFollowup(true);

    try {
      const response = await fetch('/api/crm/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: id,
          ...followupForm
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowFollowupModal(false);
        setFollowupForm({
          followupType: 'Call',
          followupDate: '',
          nextFollowupDate: '',
          notes: '',
          outcome: ''
        });
        fetchFollowups();
        fetchCustomer(); // Refresh customer data
      } else {
        alert(data.error || 'Failed to create follow-up');
      }
    } catch (err) {
      console.error('Error creating followup:', err);
      alert('Failed to create follow-up');
    } finally {
      setSavingFollowup(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'New': 'bg-slate-100 text-slate-700',
      'Contacted': 'bg-blue-100 text-blue-700',
      'Qualified': 'bg-emerald-100 text-emerald-700',
      'Converted': 'bg-violet-100 text-violet-700',
      'Lost': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors['New'];
  };

  const getInterestBadge = (interest) => {
    const badges = {
      'Hot': { emoji: '🔥', color: 'bg-red-100 text-red-700' },
      'Warm': { emoji: '⚠️', color: 'bg-amber-100 text-amber-700' },
      'Cold': { emoji: '❄️', color: 'bg-blue-100 text-blue-700' },
      'Unknown': { emoji: '❓', color: 'bg-gray-100 text-gray-700' }
    };
    return badges[interest] || badges['Unknown'];
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

  if (!customer) {
    return (
      <LoginLayout>
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Customer not found</p>
              <Link href="/crm/customers">
                <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  Back to Customers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </LoginLayout>
    );
  }

  const isAdmin = role === 'superadmin' || role === 'admin';
  const interestBadge = getInterestBadge(customer.evaluation?.interestRate);

  return (
    <LoginLayout>
      <Head>
        <title>{customer.basicData?.customerName} - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button
              onClick={() => router.push('/crm/customers')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back to Customers</span>
            </button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {customer.basicData?.customerName}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(customer.evaluation?.salesStatus)}`}>
                    {customer.evaluation?.salesStatus}
                  </span>
                  {customer.evaluation?.interestRate && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${interestBadge.color}`}>
                      <span>{interestBadge.emoji}</span>
                      {customer.evaluation.interestRate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-mono font-semibold text-blue-600">
                    {customer.customerNumber}
                  </span>
                  <span>📱 {customer.basicData?.customerPhone}</span>
                  {customer.basicData?.email && (
                    <span>📧 {customer.basicData.email}</span>
                  )}
                </div>

                {/* Show all assigned agents */}
                {(customer.assignment?.assignedAgents?.length > 0 || customer.assignment?.assignedAgentName) && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-600">
                      Assigned Agents: 
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.assignment?.assignedAgents?.filter(a => a.isActive).map((agent, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                          👤 {agent.agentName}
                        </span>
                      )) ||
                      (customer.assignment?.assignedAgentName && (
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                          👤 {customer.assignment.assignedAgentName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reassignment Notice - Only visible to Admin, Superadmin, and Superagent */}
                {canViewReassignmentHistory && customer.assignment?.reassignmentHistory && customer.assignment.reassignmentHistory.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔄</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-yellow-900 mb-1">
                          Customer Reassignment Notice
                        </h4>
                        <p className="text-sm text-yellow-800">
                          This customer was reassigned to{' '}
                          <strong>{customer.assignment.assignedAgentName}</strong>
                          {' '}from{' '}
                          <strong>{customer.assignment.reassignmentHistory[customer.assignment.reassignmentHistory.length - 1].fromAgentName}</strong>
                          {' '}on{' '}
                          {new Date(customer.assignment.reassignmentHistory[customer.assignment.reassignmentHistory.length - 1].reassignedAt).toLocaleDateString()}
                        </p>
                        {customer.assignment.reassignmentHistory[customer.assignment.reassignmentHistory.length - 1].previousCounselorStatus && (
                          <p className="text-sm text-yellow-800 mt-1">
                            Previous Counselor Status: <strong>{customer.assignment.reassignmentHistory[customer.assignment.reassignmentHistory.length - 1].previousCounselorStatus}</strong>{' '}
                            <span className="text-orange-600 font-semibold">(was reset upon reassignment)</span>
                          </p>
                        )}
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className="text-sm text-yellow-700 hover:text-yellow-900 font-semibold underline mt-2"
                        >
                          View Full Reassignment History →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {customer.evaluation?.nextFollowupDate && (
                  <p className="text-sm text-slate-600 mt-1">
                    Next Follow-up: <span className="font-semibold">
                      {new Date(customer.evaluation.nextFollowupDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>

              {/* Data Entry Edit Window Warning */}
              {session?.user?.role === 'dataentry' && customer.createdBy?.toString() === session.user.id && (
                <>
                  {(() => {
                    const createdAt = new Date(customer.createdAt);
                    const now = new Date();
                    const minutesSinceCreation = (now - createdAt) / 1000 / 60;
                    const remainingMinutes = Math.max(0, 15 - minutesSinceCreation);

                    if (remainingMinutes > 0) {
                      return (
                        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
                          ⏱️ You can edit this customer for the next <strong>{Math.floor(remainingMinutes)} minutes</strong>
                        </div>
                      );
                    } else {
                      return (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                          🔒 Your 15-minute edit window has expired. Contact your supervisor to edit this customer.
                        </div>
                      );
                    }
                  })()}
                </>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <a href={`tel:${customer.basicData?.customerPhone}`}>
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <FaPhone className="w-5 h-5" />
                  </button>
                </a>
                <a href={`https://wa.me/${customer.basicData?.customerPhone?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <button className="p-3 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                    <FaWhatsapp className="w-5 h-5" />
                  </button>
                </a>
                {customer.basicData?.email && (
                  <a href={`mailto:${customer.basicData.email}`}>
                    <button className="p-3 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition-colors">
                      <FaEnvelope className="w-5 h-5" />
                    </button>
                  </a>
                )}
                {canEdit() && (
                  <Link href={`/crm/customers/${id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                      <FaEdit className="w-4 h-4" />
                      Edit
                    </button>
                  </Link>
                )}
                <button 
                  onClick={() => setShowFollowupModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600"
                >
                  <FaCalendarPlus className="w-4 h-4" />
                  Add Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Name" value={customer.basicData?.customerName} />
                <InfoField label="Phone" value={customer.basicData?.customerPhone} />
                <InfoField label="Email" value={customer.basicData?.email || 'Not provided'} />
                <InfoField label="Gender" value={customer.basicData?.gender || 'Not specified'} />
                <InfoField label="Nationality" value={customer.basicData?.nationality || 'Not specified'} />
                <InfoField label="Country" value={customer.basicData?.country || 'Not specified'} />
                <InfoField label="City/Region" value={customer.basicData?.cityRegion || 'Not specified'} />
                <InfoField label="Alt. Phone" value={customer.basicData?.anotherContactNumber || 'Not provided'} />
              </div>
            </div>
          )}

          {/* Marketing Data Tab - Only for Superadmin and Admin */}
          {activeTab === 'marketing' && canSeeMarketing && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Marketing Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Source" value={customer.marketingData?.source || 'Not specified'} />
                <InfoField label="Company" value={customer.marketingData?.company || 'Not specified'} />
                <InfoField label="Counselor" value={customer.marketingData?.counselorName || 'Not assigned'} />
                <InfoField label="Inquiry Date" value={customer.marketingData?.inquiryDate ? new Date(customer.marketingData.inquiryDate).toLocaleDateString() : 'Not set'} />
              </div>
              {customer.marketingData?.articleInquiry && (
                <div className="mt-6">
                  <InfoField label="Inquiry Details" value={customer.marketingData.articleInquiry} multiline />
                </div>
              )}
            </div>
          )}

          {/* Qualification Tab */}
          {activeTab === 'qualification' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Current Qualification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Certificate Name" value={customer.currentQualification?.certificateName || 'Not specified'} />
                <InfoField label="Grade/GPA" value={customer.currentQualification?.grade || 'Not specified'} />
                <InfoField label="Overall Rating" value={customer.currentQualification?.overallRating || 'Not specified'} />
                <InfoField label="Graduation Year" value={customer.currentQualification?.graduationYear || 'Not specified'} />
              </div>
              {customer.currentQualification?.counselorNotes && (
                <div className="mt-6">
                  <InfoField label="Counselor Notes" value={customer.currentQualification.counselorNotes} multiline />
                </div>
              )}
            </div>
          )}

          {/* Desired Program Tab */}
          {activeTab === 'desired' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Desired Program</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Study Destination (الوجهة الدراسية)" value={customer.desiredProgram?.studyDestination || 'Not specified'} />
                <InfoField label="Desired University" value={customer.desiredProgram?.desiredUniversity || 'Not specified'} />
                <InfoField label="Desired College" value={customer.desiredProgram?.desiredCollege || 'Not specified'} />
                <InfoField label="Desired Specialization" value={customer.desiredProgram?.desiredSpecialization || 'Not specified'} />
                <InfoField label="University Type" value={customer.desiredProgram?.desiredUniversityType || 'Not specified'} />
                <InfoField label="Study Time" value={customer.desiredProgram?.desiredStudyTime || 'Not specified'} />
                <InfoField label="Sector" value={customer.desiredProgram?.desiredSector || 'Not specified'} />
              </div>
            </div>
          )}

          {/* Evaluation Tab */}
          {activeTab === 'evaluation' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Evaluation & Status (التقييم والحالة)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="حالة المبيعات (Sales Status)" value={customer.evaluation?.salesStatus || 'prospect'} />
                <InfoField label="مستوى الاهتمام (Interest Rate)" value={customer.evaluation?.interestRate || 'Not set'} />
                <InfoField label="نسبة الاهتمام (Interest %)" value={customer.evaluation?.interestPercentage || 'Not set'} />
                <InfoField label="حالة المرشد (Counselor Status)" value={customer.evaluation?.counselorStatus || 'Not set'} />
                <InfoField label="حالة العميل (Customer Status)" value={customer.evaluation?.customerStatus || 'Not set'} />
                <InfoField label="Next Follow-up" value={customer.evaluation?.nextFollowupDate ? new Date(customer.evaluation.nextFollowupDate).toLocaleDateString() : 'Not scheduled'} />
                <InfoField label="Best Time to Contact" value={customer.evaluation?.bestTimeToContact || 'Not specified'} />
                <InfoField label="Agent Evaluation" value={customer.evaluation?.agentEvaluation || 'Not set'} />
              </div>
              {customer.evaluation?.technicalOpinion && (
                <div className="mt-6">
                  <InfoField label="Technical Opinion (الرأي الفني)" value={customer.evaluation.technicalOpinion} multiline />
                </div>
              )}
              {customer.evaluation?.additionalNotes && (
                <div className="mt-6">
                  <InfoField label="Additional Notes (ملاحظات إضافية)" value={customer.evaluation.additionalNotes} multiline />
                </div>
              )}
            </div>
          )}

          {/* Follow-ups Tab */}
          {activeTab === 'followups' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Follow-ups</h2>
                  <button
                    onClick={() => setShowFollowupModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    <FaCalendarPlus className="w-4 h-4" />
                    Add Follow-up
                  </button>
                </div>

                {followups.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No follow-ups yet</p>
                ) : (
                  <div className="space-y-4">
                    {followups.map(followup => (
                      <div key={followup._id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-slate-900">{followup.followupType}</span>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                followup.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                followup.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {followup.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{followup.notes}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>📅 {new Date(followup.followupDate).toLocaleString()}</span>
                              {followup.outcome && <span>✅ {followup.outcome}</span>}
                              {followup.durationMinutes && <span>⏱️ {followup.durationMinutes} min</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Activity Timeline</h2>
              
              {/* Reassignment History Section - Only visible to Admin, Superadmin, and Superagent */}
              {canViewReassignmentHistory && customer.assignment?.reassignmentHistory && customer.assignment.reassignmentHistory.length > 0 && (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
                    🔄 Reassignment History
                  </h3>
                  <div className="space-y-3">
                    {customer.assignment.reassignmentHistory
                      .sort((a, b) => new Date(b.reassignedAt) - new Date(a.reassignedAt))
                      .map((history, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-yellow-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">
                                {new Date(history.reassignedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-sm text-slate-700 mt-1">
                                Reassigned from <strong className="text-blue-600">{history.fromAgentName}</strong> to <strong className="text-green-600">{history.toAgentName}</strong>
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                By: {history.reassignedByName}
                              </p>
                              {history.previousCounselorStatus && (
                                <p className="text-sm text-orange-600 mt-1">
                                  Previous Counselor Status: <strong>{history.previousCounselorStatus}</strong> (was reset)
                                </p>
                              )}
                              {history.reason && (
                                <p className="text-sm text-slate-600 mt-1">
                                  Reason: <em>{history.reason}</em>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <TimelineItem
                  icon="✅"
                  title="Customer Created"
                  description={`Created by ${customer.createdByName || 'System'}`}
                  date={customer.createdAt}
                />
                {customer.assignment?.assignedAt && (
                  <TimelineItem
                    icon="👤"
                    title="Assigned to Agent"
                    description={`Assigned to ${customer.assignment.assignedAgentName} by ${customer.assignment.assignedByName}`}
                    date={customer.assignment.assignedAt}
                  />
                )}
                {followups.filter(f => f.status === 'Completed').map(followup => (
                  <TimelineItem
                    key={followup._id}
                    icon="📞"
                    title={`${followup.followupType} Completed`}
                    description={followup.notes}
                    date={followup.completedAt}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Follow-up Modal */}
        {showFollowupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <h3 className="text-2xl font-bold">Add Follow-up</h3>
                <p className="text-amber-100 mt-1">Schedule activity for {customer.basicData?.customerName}</p>
              </div>

              <form onSubmit={handleCreateFollowup} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Follow-up Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={followupForm.followupType}
                    onChange={(e) => setFollowupForm({...followupForm, followupType: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="Call">📞 Call</option>
                    <option value="WhatsApp">💬 WhatsApp</option>
                    <option value="Meeting">👥 Meeting</option>
                    <option value="Email">📧 Email</option>
                    <option value="SMS">📱 SMS</option>
                    <option value="Note">📝 Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Follow-up Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={followupForm.followupDate}
                    onChange={(e) => setFollowupForm({...followupForm, followupDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followupForm.nextFollowupDate}
                    onChange={(e) => setFollowupForm({...followupForm, nextFollowupDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={followupForm.notes}
                    onChange={(e) => setFollowupForm({...followupForm, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Add notes about this follow-up..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Outcome
                  </label>
                  <input
                    type="text"
                    value={followupForm.outcome}
                    onChange={(e) => setFollowupForm({...followupForm, outcome: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Interested, Need more info"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFollowupModal(false);
                      setFollowupForm({
                        followupType: 'Call',
                        followupDate: '',
                        nextFollowupDate: '',
                        notes: '',
                        outcome: ''
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFollowup}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    {savingFollowup ? 'Saving...' : 'Add Follow-up'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </LoginLayout>
  );
}

// Helper Components
function InfoField({ label, value, multiline = false }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
      {multiline ? (
        <p className="text-slate-900 whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-slate-900">{value}</p>
      )}
    </div>
  );
}

function TimelineItem({ icon, title, description, date }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="text-xs text-slate-500 mt-1">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
