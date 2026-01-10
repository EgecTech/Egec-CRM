// pages/crm/reports/counselor-status.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaDownload, FaFilter, FaChartBar, FaUser } from 'react-icons/fa';

export default function CounselorStatusReport() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'primary', 'assigned', 'all'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch agents for filter
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAgents();
    }
  }, [status]);
  
  // Fetch report on load and filter change
  useEffect(() => {
    if (status === 'authenticated') {
      fetchReport();
    }
  }, [status, selectedAgent, filterType, startDate, endDate]);
  
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        const agentUsers = data.users.filter(u => 
          ['agent', 'superagent'].includes(u.role) && u.isActive
        );
        setAgents(agentUsers);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };
  
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedAgent !== 'all') params.append('agentId', selectedAgent);
      if (filterType) params.append('filterType', filterType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await fetch(`/api/crm/reports/counselor-status?${params}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch report');
      }
      
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const exportToCSV = () => {
    if (!reportData) return;
    
    const data = selectedAgent !== 'all' 
      ? reportData.agentReport 
      : reportData.systemTotals;
    
    if (!data) return;
    
    const statusBreakdown = data.statusBreakdown || {};
    const sortedStatuses = data.sortedStatuses || reportData.systemTotals?.sortedStatuses || [];
    
    // Build CSV
    let csv = 'حالة المرشد,الإجمالي,بكالوريوس,ماجستير,دكتوراه\n';
    
    // Total row with safety checks
    const totalRow = Object.values(statusBreakdown).reduce((acc, counts) => ({
      total: acc.total + (counts?.total || 0),
      بكالوريوس: acc.بكالوريوس + (counts?.بكالوريوس || 0),
      ماجستير: acc.ماجستير + (counts?.ماجستير || 0),
      دكتوراه: acc.دكتوراه + (counts?.دكتوراه || 0)
    }), { total: 0, بكالوريوس: 0, ماجستير: 0, دكتوراه: 0 });
    
    csv += `الإجمالي,${totalRow.total},${totalRow.بكالوريوس},${totalRow.ماجستير},${totalRow.دكتوراه}\n`;
    
    // Status rows with safety checks
    sortedStatuses.forEach(status => {
      const counts = statusBreakdown[status] || {
        total: 0,
        بكالوريوس: 0,
        ماجستير: 0,
        دكتوراه: 0
      };
      // Skip statuses with 0 count
      if (counts.total === 0) return;
      csv += `${status},${counts.total},${counts.بكالوريوس},${counts.ماجستير},${counts.دكتوراه}\n`;
    });
    
    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `counselor-status-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  const renderReportTable = (data, title = null) => {
    if (!data) return null;
    
    const statusBreakdown = data.statusBreakdown || {};
    const sortedStatuses = data.sortedStatuses || reportData?.systemTotals?.sortedStatuses || [];
    
    // Calculate totals with safety checks
    const totalRow = Object.values(statusBreakdown).reduce((acc, counts) => ({
      total: acc.total + (counts?.total || 0),
      بكالوريوس: acc.بكالوريوس + (counts?.بكالوريوس || 0),
      ماجستير: acc.ماجستير + (counts?.ماجستير || 0),
      دكتوراه: acc.دكتوراه + (counts?.دكتوراه || 0)
    }), { total: 0, بكالوريوس: 0, ماجستير: 0, دكتوراه: 0 });
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {title && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUser />
              {title}
            </h3>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <tr>
                <th className="px-4 py-3 text-right font-bold">حالة المرشد</th>
                <th className="px-4 py-3 text-center font-bold">الإجمالي</th>
                <th className="px-4 py-3 text-center font-bold">بكالوريوس</th>
                <th className="px-4 py-3 text-center font-bold">ماجستير</th>
                <th className="px-4 py-3 text-center font-bold">دكتوراه</th>
              </tr>
            </thead>
            <tbody>
              {/* Total Row */}
              <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-4 border-green-600 font-bold">
                <td className="px-4 py-3 text-right text-green-900">الإجمالي</td>
                <td className="px-4 py-3 text-center text-green-900 text-lg">{totalRow.total}</td>
                <td className="px-4 py-3 text-center text-green-900">{totalRow.بكالوريوس}</td>
                <td className="px-4 py-3 text-center text-green-900">{totalRow.ماجستير}</td>
                <td className="px-4 py-3 text-center text-green-900">{totalRow.دكتوراه}</td>
              </tr>
              
              {/* Status Rows */}
              {sortedStatuses.map((status, index) => {
                const counts = statusBreakdown[status] || {
                  total: 0,
                  بكالوريوس: 0,
                  ماجستير: 0,
                  دكتوراه: 0
                };
                const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                
                // Skip statuses with 0 count for individual agent reports
                if (counts.total === 0 && data.agentId) {
                  return null;
                }
                
                return (
                  <tr key={status} className={`${bgColor} hover:bg-blue-50 border-b`}>
                    <td className="px-4 py-2 text-right font-semibold text-slate-700">
                      {status}
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-blue-600">
                      {counts.total}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {counts.بكالوريوس}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {counts.ماجستير}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {counts.دكتوراه}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }
  
  return (
    <>
      <div className="mycontainer" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaChartBar className="text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-800">
                تقرير حالة المرشد
              </h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <FaFilter />
                تصفية
              </button>
              
              <button
                onClick={exportToCSV}
                disabled={!reportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload />
                تصدير CSV
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Filter Type Selection */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-bold text-blue-900 mb-3">
                  نوع التقرير (Report Type)
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filterType"
                      value="all"
                      checked={filterType === 'all'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm font-semibold text-slate-700">
                      الكل (All) - Primary + Assigned
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filterType"
                      value="primary"
                      checked={filterType === 'primary'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="mr-2 text-sm font-semibold text-slate-700">
                      المرشد الأساسي فقط (Primary Agent Only)
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="filterType"
                      value="assigned"
                      checked={filterType === 'assigned'}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="mr-2 text-sm font-semibold text-slate-700">
                      المرشدين الإضافيين فقط (Additional Agents Only - NOT Primary)
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Agent Filter */}
                {['admin', 'superadmin', 'superagent'].includes(session?.user?.role) && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      المرشد
                    </label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">جميع المرشدين</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <LoadingSpinner />
              <p className="mt-4 text-slate-600">جاري تحميل التقرير...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}
          
          {/* Report Data */}
          {!loading && !error && reportData && (
            <>
              {/* Report Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-600 rounded-lg p-4 mb-6">
                {/* Filter Type Badge */}
                <div className="mb-3 flex justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    filterType === 'primary' ? 'bg-green-100 text-green-800 border border-green-300' :
                    filterType === 'assigned' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                    'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {filterType === 'primary' ? '📊 تقرير المرشد الأساسي (Primary Agent Only)' :
                     filterType === 'assigned' ? '📊 تقرير المرشدين الإضافيين (Additional Agents - NOT Primary)' :
                     '📊 تقرير شامل (Complete - Primary + Additional)'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">إجمالي العملاء</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedAgent !== 'all' 
                        ? reportData.agentReport?.totalCustomers || 0
                        : reportData.systemTotals.totalCustomers}
                    </p>
                  </div>
                  {selectedAgent === 'all' && (
                    <div>
                      <p className="text-sm text-slate-600 font-semibold">عدد المرشدين</p>
                      <p className="text-3xl font-bold text-green-600">
                        {reportData.systemTotals.totalAgents}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">تاريخ التقرير</p>
                    <p className="text-lg font-semibold text-slate-700">
                      {new Date(reportData.generatedAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Single Agent Report */}
              {selectedAgent !== 'all' && reportData.agentReport && (
                <>
                  {renderReportTable(
                    reportData.agentReport,
                    `تقرير المرشد: ${reportData.agentReport.agentName}`
                  )}
                </>
              )}
              
              {/* All Agents - System Totals */}
              {selectedAgent === 'all' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FaChartBar className="text-blue-600" />
                      إجمالي النظام (جميع المرشدين)
                    </h2>
                    {renderReportTable(reportData.systemTotals)}
                  </div>
                  
                  {/* Per-Agent Reports */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      تقارير تفصيلية لكل مرشد
                    </h2>
                    {reportData.agentReports.map(agentReport => (
                      <div key={agentReport.agentId}>
                        {renderReportTable(
                          agentReport,
                          `${agentReport.agentName} - (${agentReport.totalCustomers} عميل)`
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
