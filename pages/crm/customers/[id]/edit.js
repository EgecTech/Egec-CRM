// pages/crm/customers/[id]/edit.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function EditCustomer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [systemSettings, setSystemSettings] = useState({});
  const [agents, setAgents] = useState([]);
  
  // Cascading dropdown state
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchCustomer();
      fetchSystemSettings();
      fetchAgents();
    }
  }, [status, router, id]);

  // Fetch universities when study destination changes
  useEffect(() => {
    const fetchUniversities = async () => {
      if (!customer?.marketingData?.studyDestination) {
        setUniversities([]);
        setColleges([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/crm/universities?country=${encodeURIComponent(
            customer.marketingData.studyDestination
          )}`
        );
        const data = await response.json();

        if (data.success) {
          setUniversities(data.data);
        } else {
          console.error('Failed to fetch universities:', data.error);
          setUniversities([]);
        }
      } catch (err) {
        console.error('Error fetching universities:', err);
        setUniversities([]);
      }
    };

    if (customer) {
      fetchUniversities();
    }
  }, [customer?.marketingData?.studyDestination]);

  // Fetch colleges when university changes
  useEffect(() => {
    const fetchColleges = async () => {
      if (!customer?.desiredProgram?.desiredUniversityId) {
        setColleges([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/crm/universities/${customer.desiredProgram.desiredUniversityId}/colleges`
        );
        const data = await response.json();

        if (data.success) {
          setColleges(data.data);
        } else {
          console.error('Failed to fetch colleges:', data.error);
          setColleges([]);
        }
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setColleges([]);
      }
    };

    if (customer) {
      fetchColleges();
    }
  }, [customer?.desiredProgram?.desiredUniversityId]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/users');
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
        ['agent', 'egecagent', 'studyagent', 'edugateagent'].includes(user.role) && user.isActive
      );
      setAgents(agentUsers);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setAgents([]);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/crm/system-settings');
      const data = await response.json();
      if (data.success) {
        const settings = {};
        data.data.forEach(setting => {
          settings[setting.settingKey] = setting.settingValue;
        });
        setSystemSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

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
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Clean empty ObjectId fields
      const cleanData = JSON.parse(JSON.stringify(customer));

      if (cleanData.marketingData) {
        if (!cleanData.marketingData.counselorId)
          delete cleanData.marketingData.counselorId;
        if (!cleanData.marketingData.subGuide1Id)
          delete cleanData.marketingData.subGuide1Id;
        if (!cleanData.marketingData.subGuide2Id)
          delete cleanData.marketingData.subGuide2Id;
        if (!cleanData.marketingData.subGuide3Id)
          delete cleanData.marketingData.subGuide3Id;
      }

      if (cleanData.desiredProgram) {
        if (!cleanData.desiredProgram.desiredSpecializationId)
          delete cleanData.desiredProgram.desiredSpecializationId;
        if (!cleanData.desiredProgram.desiredCollegeId)
          delete cleanData.desiredProgram.desiredCollegeId;
        if (!cleanData.desiredProgram.desiredUniversityId)
          delete cleanData.desiredProgram.desiredUniversityId;
      }

      const response = await fetch(`/api/crm/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Customer updated successfully!');
        setTimeout(() => {
          router.push(`/crm/customers/${id}`);
        }, 1500);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(', '));
        } else {
          setError(data.error || data.message || 'Failed to update customer');
        }
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('Failed to update customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setCustomer(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setCustomer(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value
        }
      }
    }));
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
              <p className="font-semibold">Customer not found or access denied</p>
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

  return (
    <LoginLayout>
      <Head>
        <title>Edit {customer.basicData?.customerName} - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/crm/customers/${id}`}>
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
                <FaArrowLeft className="w-4 h-4" />
                <span className="text-sm font-semibold">Back to Profile</span>
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Edit Customer</h1>
            <p className="text-slate-600 mt-2">{customer.customerNumber}</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700">
              {success}
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Degree Type Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <label className="block text-lg font-bold text-slate-900 mb-3">
                  نوع الدرجة العلمية المطلوبة (Degree Type) <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  اختر نوع الدرجة التي يرغب العميل في دراستها
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'bachelor', label: 'بكالوريوس', color: 'blue' },
                    { value: 'master', label: 'ماجستير', color: 'purple' },
                    { value: 'phd', label: 'دكتوراه', color: 'green' }
                  ].map(degree => (
                    <button
                      key={degree.value}
                      type="button"
                      onClick={() => setCustomer({...customer, degreeType: degree.value})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        customer.degreeType === degree.value
                          ? `border-${degree.color}-500 bg-${degree.color}-50 shadow-lg`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`font-bold text-lg ${
                        customer.degreeType === degree.value ? `text-${degree.color}-700` : 'text-slate-700'
                      }`}>
                        {degree.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Marketing Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Marketing Data (بيانات التسويق)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">الوجهة الدراسية (Study Destination)</label>
                  <select
                    value={customer.marketingData?.studyDestination || 'مصر'}
                    onChange={(e) => {
                      handleChange('marketingData', 'studyDestination', e.target.value);
                      // Reset dependent fields
                      setCustomer(prev => ({
                        ...prev,
                        desiredProgram: {
                          ...prev.desiredProgram,
                          desiredUniversity: "",
                          desiredUniversityId: null,
                          desiredCollege: "",
                          desiredCollegeId: null,
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select destination</option>
                    {(systemSettings.study_destinations || ['مصر']).map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Source (المصدر)</label>
                  <select
                    value={customer.marketingData?.source || ''}
                    onChange={(e) => handleChange('marketingData', 'source', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select source</option>
                    {(systemSettings.sources || []).map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company (الشركة)</label>
                  <input
                    type="text"
                    value={customer.marketingData?.company || ''}
                    onChange={(e) => handleChange('marketingData', 'company', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Reassign Agent - Admin/Superadmin only */}
                {(session?.user?.role === 'admin' || session?.user?.role === 'superadmin') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      تعيين للمرشد (Assign to Agent)
                    </label>
                    <select
                      value={customer.assignment?.assignedAgentId || ''}
                      onChange={(e) => {
                        const selectedAgent = agents.find(a => a._id === e.target.value);
                        setCustomer(prev => ({
                          ...prev,
                          assignment: {
                            ...prev.assignment,
                            assignedAgentId: e.target.value,
                            assignedAgentName: selectedAgent?.name || ''
                          }
                        }));
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">لا يوجد / Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} - {agent.email}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Current: {customer.assignment?.assignedAgentName || 'Not assigned'} | 
                      {agents.length} agent(s) available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information (بيانات أساسية)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Customer Name (اسم العميل) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.basicData?.customerName || ''}
                    onChange={(e) => handleChange('basicData', 'customerName', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Customer Phone (رقم العميل) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customer.basicData?.customerPhone || ''}
                    onChange={(e) => handleChange('basicData', 'customerPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customer.basicData?.email || ''}
                    onChange={(e) => handleChange('basicData', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender (الجنس)</label>
                  <select
                    value={customer.basicData?.gender || ''}
                    onChange={(e) => handleChange('basicData', 'gender', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">جنسية العميل</label>
                  <select
                    value={customer.basicData?.nationality || ''}
                    onChange={(e) => handleChange('basicData', 'nationality', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الجنسية</option>
                    {(systemSettings.nationalities || ['سعودي', 'سوداني', 'غير معروف', 'سوري', 'مصري', 'يمني', 'فلسطيني', 'اردني', 'عراقي']).map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">دولة العميل</label>
                  <select
                    value={customer.basicData?.country || ''}
                    onChange={(e) => handleChange('basicData', 'country', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الدولة</option>
                    {(systemSettings.countries || ['السعودية', 'مصر', 'الاردن', 'لبنان']).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City/Region (المدينة)</label>
                  <input
                    type="text"
                    value={customer.basicData?.cityRegion || ''}
                    onChange={(e) => handleChange('basicData', 'cityRegion', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alt. Phone (رقم آخر)</label>
                  <input
                    type="tel"
                    value={customer.basicData?.anotherContactNumber || ''}
                    onChange={(e) => handleChange('basicData', 'anotherContactNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Current Qualification - Part 1/2 to continue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Current Qualification (المؤهل الحالي)</h2>
              
              {/* Degree Type Indicator */}
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-slate-700">
                  Selected Degree Type: {' '}
                  <span className="text-blue-600">
                    {customer.degreeType === 'bachelor' && 'بكالوريوس (Bachelor)'}
                    {customer.degreeType === 'master' && 'ماجستير (Master)'}
                    {customer.degreeType === 'phd' && 'دكتوراه (PhD)'}
                  </span>
                </p>
              </div>

              {/* Common Fields - ONLY for Bachelor (NOT for Master or PhD) */}
              {customer.degreeType === 'bachelor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Grade/GPA (المعدل)</label>
                    <select
                      value={customer.currentQualification?.grade || ''}
                      onChange={(e) => handleChange('currentQualification', 'grade', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select grade</option>
                      {(systemSettings.grades || ['2.5', '%10', '%20', '%30', '%40', '%50', '%60', '%70', '%80', '%90', '%100']).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Overall Rating (التقدير)</label>
                    <select
                      value={customer.currentQualification?.overallRating || ''}
                      onChange={(e) => handleChange('currentQualification', 'overallRating', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select rating</option>
                      {(systemSettings.certificate_ratings || []).map(rating => (
                        <option key={rating} value={rating}>{rating}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Study System (نظام الدراسة)</label>
                    <select
                      value={customer.currentQualification?.studySystem || ''}
                      onChange={(e) => handleChange('currentQualification', 'studySystem', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select system</option>
                      {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(system => (
                        <option key={system} value={system}>{system}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year (سنة التخرج)</label>
                    <input
                      type="number"
                      value={customer.currentQualification?.graduationYear || ''}
                      onChange={(e) => handleChange('currentQualification', 'graduationYear', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="2024"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}

              {/* Bachelor-specific fields */}
              {customer.degreeType === 'bachelor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Certificate Track (المسار)</label>
                    <input
                      type="text"
                      value={customer.currentQualification?.bachelor?.certificateTrack || ''}
                      onChange={(e) => handleNestedChange('currentQualification', 'bachelor', 'certificateTrack', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., علمي، أدبي"
                    />
                  </div>
                </div>
              )}

              {/* Master-seeker fields */}
              {customer.degreeType === 'master' && (
                <>
                  <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                    <p className="text-sm font-semibold text-blue-900">
                      معلومات شهادة البكالوريوس (الحاصل عليها الطالب)
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Bachelor's Degree Information (that the student already holds)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">تخصص البكالوريوس</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.masterSeeker?.bachelorSpecialization || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorSpecialization', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">كلية البكالوريوس</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.masterSeeker?.bachelorCollege || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorCollege', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">جامعة البكالوريوس</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.masterSeeker?.bachelorUniversity || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorUniversity', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">دولة شهادة البكالوريوس</label>
                      <select
                        value={customer.currentQualification?.masterSeeker?.bachelorCountry || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorCountry', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر الدولة</option>
                        {(systemSettings.countries || []).map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">سنة الحصول على البكالوريوس</label>
                      <input
                        type="number"
                        value={customer.currentQualification?.masterSeeker?.bachelorGraduationYear || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorGraduationYear', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2020"
                        min="1950"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">المعدل (GPA)</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.masterSeeker?.bachelorGPA || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'masterSeeker', 'bachelorGPA', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3.5/4.0"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PhD-seeker fields */}
              {customer.degreeType === 'phd' && (
                <>
                  {/* Bachelor's Degree Information */}
                  <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                    <p className="text-sm font-semibold text-blue-900">
                      بيانات الشهادة الحاصل عليها الطالب (بكالوريوس - دبلوم دراسات عليا)
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Bachelor's Degree Information (first qualification)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">تخصص (بكالوريوس) الحاصل عليه الطالب مؤهل</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorSpecialization || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorSpecialization', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">قطاع تخصص البكالوريوس الحاصل عليو الطالب</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorSpecializationSector || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorSpecializationSector', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">كلية مؤهل (بكالوريوس) الحاصل عليه الطالب</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorCollege || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorCollege', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">جامعة المؤهل( البكالوريوس)</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorUniversity || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorUniversity', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">دولة شهادة البكالوريوس</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.bachelorCountry || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorCountry', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر الدولة</option>
                        {(systemSettings.countries || []).map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">سنة الحصول علي شهادة البكالوريوس</label>
                      <input
                        type="number"
                        value={customer.currentQualification?.phdSeeker?.bachelorGraduationYear || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorGraduationYear', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2018"
                        min="1950"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">نظام الدراسه</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.bachelorStudySystem || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorStudySystem', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select system</option>
                        {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(system => (
                          <option key={system} value={system}>{system}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">معدل</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorGPA || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorGPA', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3.5/4.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">تقدير</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.bachelorRating || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorRating', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select rating</option>
                        {(systemSettings.certificate_ratings || []).map(rating => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">فصول دراسية</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.bachelorSemesters || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'bachelorSemesters', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 8"
                      />
                    </div>
                  </div>

                  {/* Master's Degree Information */}
                  <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 mb-2 mt-4">
                    <p className="text-sm font-semibold text-green-900">
                      بيانات الشهادة الحاصل عليها الطالب (ماجستير)
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Master's Degree Information (second qualification)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">تخصص الماجستير الحاصل عليه الطالب</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterSpecialization || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterSpecialization', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">قطاع تخصص الماجستير الحاصل عليه الطالب</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterSpecializationSector || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterSpecializationSector', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">كلية (ماجستير) الحاصل عليه الطالب</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterCollege || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterCollege', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">جامعة المؤهل (الماجستير)</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterUniversity || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterUniversity', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">دولة شهادة (الماجستير)</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.masterCountry || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterCountry', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر الدولة</option>
                        {(systemSettings.countries || []).map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">سنة الحصول على الماجستير</label>
                      <input
                        type="number"
                        value={customer.currentQualification?.phdSeeker?.masterGraduationYear || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterGraduationYear', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2022"
                        min="1950"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">نظام دراسة الماجستير</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.masterStudySystem || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterStudySystem', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select system</option>
                        {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(system => (
                          <option key={system} value={system}>{system}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">نوع الدرجة العلمية</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.masterDegreeType || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterDegreeType', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select degree type</option>
                        <option value="research">بحثي (Research)</option>
                        <option value="coursework">مقررات دراسية (Coursework)</option>
                        <option value="mixed">مختلط (Mixed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">المعدل</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterGPA || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterGPA', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3.8/4.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">التقدير</label>
                      <select
                        value={customer.currentQualification?.phdSeeker?.masterRating || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterRating', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select rating</option>
                        {(systemSettings.certificate_ratings || []).map(rating => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">عنوان رسالة الماجستير</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterThesisTitle || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterThesisTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Master's thesis title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">مدة الدراسة</label>
                      <input
                        type="text"
                        value={customer.currentQualification?.phdSeeker?.masterStudyDuration || ''}
                        onChange={(e) => handleNestedChange('currentQualification', 'phdSeeker', 'masterStudyDuration', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., سنتان"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Counselor Notes - Common for all */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Counselor Notes (ملاحظات المرشد)</label>
                <textarea
                  value={customer.currentQualification?.counselorNotes || ''}
                  onChange={(e) => handleChange('currentQualification', 'counselorNotes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Desired Program with Cascading Dropdowns */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Desired Program (البرنامج المطلوب)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desired University - Cascading dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Desired University (الجامعة المطلوبة)
                  </label>
                  <select
                    value={customer.desiredProgram?.desiredUniversityId || ''}
                    onChange={(e) => {
                      const selectedUni = universities.find(uni => uni.value === e.target.value);
                      setCustomer(prev => ({
                        ...prev,
                        desiredProgram: {
                          ...prev.desiredProgram,
                          desiredUniversityId: e.target.value,
                          desiredUniversity: selectedUni ? selectedUni.label : '',
                          desiredCollege: "",
                          desiredCollegeId: null,
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!customer.marketingData?.studyDestination}
                  >
                    <option value="">
                      {customer.marketingData?.studyDestination ? "Select University" : "Select Study Destination First"}
                    </option>
                    {universities.map((uni) => (
                      <option key={uni.value} value={uni.value}>
                        {uni.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desired College - Cascading dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Desired College (الكلية المطلوبة)
                  </label>
                  <select
                    value={customer.desiredProgram?.desiredCollegeId || ''}
                    onChange={(e) => {
                      const selectedCol = colleges.find(col => col.value === e.target.value);
                      setCustomer(prev => ({
                        ...prev,
                        desiredProgram: {
                          ...prev.desiredProgram,
                          desiredCollegeId: e.target.value,
                          desiredCollege: selectedCol ? selectedCol.label : '',
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!customer.desiredProgram?.desiredUniversityId}
                  >
                    <option value="">
                      {customer.desiredProgram?.desiredUniversityId ? "Select College" : "Select University First"}
                    </option>
                    {colleges.map((col) => (
                      <option key={col.value} value={col.value}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desired Specialization (التخصص)</label>
                  <input
                    type="text"
                    value={customer.desiredProgram?.desiredSpecialization || ''}
                    onChange={(e) => handleChange('desiredProgram', 'desiredSpecialization', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">نوع الجامعة</label>
                  <select
                    value={customer.desiredProgram?.desiredUniversityType || ''}
                    onChange={(e) => handleChange('desiredProgram', 'desiredUniversityType', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر النوع</option>
                    {(systemSettings.university_types || ['حكومية', 'أهلية', 'خاصة']).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Study Time (وقت الدراسة)</label>
                  <select
                    value={customer.desiredProgram?.desiredStudyTime || ''}
                    onChange={(e) => handleChange('desiredProgram', 'desiredStudyTime', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    {(systemSettings.study_times || []).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Evaluation & Status - Admin/Superadmin/Agent only */}
            {session?.user?.role !== 'dataentry' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Status & Evaluation (التقييم والحالة)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">حالة المبيعات</label>
                    <select
                      value={customer.evaluation?.salesStatus || 'prospect'}
                      onChange={(e) => handleChange('evaluation', 'salesStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {(systemSettings.sales_statuses || ['prospect', 'suspect', 'lost', 'forcast', 'potential', 'NOD']).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">مستوى الاهتمام</label>
                    <select
                      value={customer.evaluation?.interestRate || ''}
                      onChange={(e) => handleChange('evaluation', 'interestRate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر المستوى</option>
                      {(systemSettings.interest_rates || ['Hot', 'Warm', 'Cold', 'Unknown']).map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Interest Percentage (نسبة الاهتمام)</label>
                    <select
                      value={customer.evaluation?.interestPercentage || ''}
                      onChange={(e) => handleChange('evaluation', 'interestPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select percentage</option>
                      {(systemSettings.interest_percentages || ['%10', '%20', '%30', '%40', '%50', '%60', '%70', '%80', '%90', '%100']).map((pct) => (
                        <option key={pct} value={pct}>
                          {pct}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">حالة المرشد</label>
                    <select
                      value={customer.evaluation?.counselorStatus || ''}
                      onChange={(e) => handleChange('evaluation', 'counselorStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر الحالة</option>
                      {(systemSettings.counselor_statuses || []).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">حالة العميل</label>
                    <select
                      value={customer.evaluation?.customerStatus || ''}
                      onChange={(e) => handleChange('evaluation', 'customerStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      {(systemSettings.customer_statuses || ['interest', 'Un Qualified', 'INprogres', 'Open Deal', 'Done Deal', 'lost', 'BadTiming']).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Next Follow-up (تاريخ المتابعة)</label>
                    <input
                      type="date"
                      value={customer.evaluation?.nextFollowupDate ? new Date(customer.evaluation.nextFollowupDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('evaluation', 'nextFollowupDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Best Time to Contact (أفضل وقت)</label>
                    <input
                      type="text"
                      value={customer.evaluation?.bestTimeToContact || ''}
                      onChange={(e) => handleChange('evaluation', 'bestTimeToContact', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Technical Opinion (الرأي الفني)</label>
                  <textarea
                    value={customer.evaluation?.technicalOpinion || ''}
                    onChange={(e) => handleChange('evaluation', 'technicalOpinion', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (ملاحظات إضافية)</label>
                  <textarea
                    value={customer.evaluation?.additionalNotes || ''}
                    onChange={(e) => handleChange('evaluation', 'additionalNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes..."
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
              <Link href={`/crm/customers/${id}`} className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loading />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LoginLayout>
  );
}
