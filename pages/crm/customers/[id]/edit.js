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

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      // Handle different response formats
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
      const response = await fetch(`/api/crm/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Customer updated successfully!');
        setTimeout(() => {
          router.push(`/crm/customers/${id}`);
        }, 1500);
      } else {
        setError(data.error || data.message || 'Failed to update customer');
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
            {/* Marketing Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Marketing Data (بيانات التسويق)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">الوجهة الدراسية (Study Destination)</label>
                  <select
                    value={customer.marketingData?.studyDestination || 'مصر'}
                    onChange={(e) => handleChange('marketingData', 'studyDestination', e.target.value)}
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
                    <option value="سعودي">سعودي</option>
                    <option value="سوداني">سوداني</option>
                    <option value="غير معروف">غير معروف</option>
                    <option value="سوري">سوري</option>
                    <option value="مصري">مصري</option>
                    <option value="يمني">يمني</option>
                    <option value="فلسطيني">فلسطيني</option>
                    <option value="اردني">اردني</option>
                    <option value="عراقي">عراقي</option>
                    <option value="ليبي">ليبي</option>
                    <option value="عماني">عماني</option>
                    <option value="كويتي">كويتي</option>
                    <option value="اماراتي">اماراتي</option>
                    <option value="جزائري">جزائري</option>
                    <option value="مغربي">مغربي</option>
                    <option value="بحريني">بحريني</option>
                    <option value="لبناني">لبناني</option>
                    <option value="تشادي">تشادي</option>
                    <option value="صومالي">صومالي</option>
                    <option value="نيجيري">نيجيري</option>
                    <option value="تونسي">تونسي</option>
                    <option value="موريتاني">موريتاني</option>
                    <option value="باكستاني">باكستاني</option>
                    <option value="قطري">قطري</option>
                    <option value="جنسيه اخري">جنسيه اخري</option>
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
                    <option value="السعودية">السعودية</option>
                    <option value="الكويت">الكويت</option>
                    <option value="الإمارات">الإمارات</option>
                    <option value="السودان">السودان</option>
                    <option value="العراق">العراق</option>
                    <option value="ليبيا">ليبيا</option>
                    <option value="اليمن">اليمن</option>
                    <option value="الاردن">الاردن</option>
                    <option value="عمان">عمان</option>
                    <option value="قطر">قطر</option>
                    <option value="سوريا">سوريا</option>
                    <option value="فلسطين">فلسطين</option>
                    <option value="مصر">مصر</option>
                    <option value="باكستان">باكستان</option>
                    <option value="البحرين">البحرين</option>
                    <option value="لبنان">لبنان</option>
                    <option value="تركيا">تركيا</option>
                    <option value="امريكا">امريكا</option>
                    <option value="بريطانيا">بريطانيا</option>
                    <option value="المانيا">المانيا</option>
                    <option value="أخري">أخري</option>
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

            {/* Current Qualification */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Current Qualification (المؤهل الحالي)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Certificate Name (نوع الشهادة)</label>
                  <input
                    type="text"
                    value={customer.currentQualification?.certificateName || ''}
                    onChange={(e) => handleChange('currentQualification', 'certificateName', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Grade (المعدل)</label>
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
                  <input
                    type="text"
                    value={customer.currentQualification?.overallRating || ''}
                    onChange={(e) => handleChange('currentQualification', 'overallRating', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year (سنة التخرج)</label>
                  <input
                    type="number"
                    value={customer.currentQualification?.graduationYear || ''}
                    onChange={(e) => handleChange('currentQualification', 'graduationYear', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

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

            {/* Desired Program */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Desired Program (البرنامج المطلوب)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desired University (الجامعة)</label>
                  <input
                    type="text"
                    value={customer.desiredProgram?.desiredUniversity || ''}
                    onChange={(e) => handleChange('desiredProgram', 'desiredUniversity', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desired College (الكلية)</label>
                  <input
                    type="text"
                    value={customer.desiredProgram?.desiredCollege || ''}
                    onChange={(e) => handleChange('desiredProgram', 'desiredCollege', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                    {(systemSettings.customer_statuses || []).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Status (حالة العميل)</label>
                  <select
                    value={customer.evaluation?.customerStatus || ''}
                    onChange={(e) => handleChange('evaluation', 'customerStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="interest">interest</option>
                    <option value="Un Qualified">Un Qualified</option>
                    <option value="INprogres">INprogres</option>
                    <option value="Open Deal">Open Deal</option>
                    <option value="Done Deal">Done Deal</option>
                    <option value="lost">lost</option>
                    <option value="badtim">badtim</option>
                    <option value="BadTiming">BadTiming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Interest Percentage (نسبة الاهتمام)</label>
                  <input
                    type="text"
                    value={customer.evaluation?.interestPercentage || ''}
                    onChange={(e) => handleChange('evaluation', 'interestPercentage', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="%10, %20, %30..."
                  />
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
