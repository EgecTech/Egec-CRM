// pages/crm/system-control.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LoginLayout from '@/components/LoginLayout';
import Loading from '@/components/Loading';
import { 
  FaList, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaSave,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaToggleOn,
  FaToggleOff,
  FaSearch
} from 'react-icons/fa';

export default function SystemControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetting, setNewSetting] = useState({
    settingKey: '',
    settingType: 'dropdown_options',
    description: '',
    settingValue: []
  });
  const [editingValues, setEditingValues] = useState([]);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      // Only superadmin can access
      if (role !== 'superadmin') {
        router.push('/crm/dashboard');
        return;
      }
      fetchSettings();
    }
  }, [status, router, session]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/system-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      alert('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingItem(setting._id);
    setEditingValues([...setting.settingValue]);
  };

  const handleSave = async (settingId) => {
    try {
      const response = await fetch(`/api/crm/system-settings/${settingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingValue: editingValues })
      });

      if (response.ok) {
        await fetchSettings();
        setEditingItem(null);
        setEditingValues([]);
        alert('Setting updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update setting');
      }
    } catch (err) {
      console.error('Error updating setting:', err);
      alert('Failed to update setting');
    }
  };

  const handleDelete = async (settingId, settingKey) => {
    if (!confirm(`Are you sure you want to delete "${settingKey}"?`)) return;

    try {
      const response = await fetch(`/api/crm/system-settings/${settingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSettings();
        alert('Setting deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete setting');
      }
    } catch (err) {
      console.error('Error deleting setting:', err);
      alert('Failed to delete setting');
    }
  };

  const handleToggleActive = async (settingId, currentActive) => {
    try {
      const response = await fetch(`/api/crm/system-settings/${settingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });

      if (response.ok) {
        await fetchSettings();
      } else {
        alert('Failed to toggle setting');
      }
    } catch (err) {
      console.error('Error toggling setting:', err);
      alert('Failed to toggle setting');
    }
  };

  const handleAddValue = () => {
    if (newValue.trim()) {
      setEditingValues([...editingValues, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (index) => {
    setEditingValues(editingValues.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newValues = [...editingValues];
    [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];
    setEditingValues(newValues);
  };

  const handleMoveDown = (index) => {
    if (index === editingValues.length - 1) return;
    const newValues = [...editingValues];
    [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
    setEditingValues(newValues);
  };

  const handleCreateSetting = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/crm/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSetting)
      });

      if (response.ok) {
        await fetchSettings();
        setShowAddModal(false);
        setNewSetting({
          settingKey: '',
          settingType: 'dropdown_options',
          description: '',
          settingValue: []
        });
        alert('Setting created successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create setting');
      }
    } catch (err) {
      console.error('Error creating setting:', err);
      alert('Failed to create setting');
    }
  };

  const filteredSettings = settings.filter(setting =>
    setting.settingKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  return (
    <LoginLayout>
      <Head>
        <title>System Control Panel | CRM</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎛️ System Control Panel
            </h1>
            <p className="text-gray-600">
              Manage all dropdown lists and system settings
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Total Settings</div>
              <div className="text-3xl font-bold text-gray-800">{settings.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-green-600">
                {settings.filter(s => s.isActive).length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <div className="text-sm text-gray-600 mb-1">Inactive</div>
              <div className="text-3xl font-bold text-red-600">
                {settings.filter(s => !s.isActive).length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Dropdown Options</div>
              <div className="text-3xl font-bold text-purple-600">
                {settings.filter(s => s.settingType === 'dropdown_options').length}
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
            >
              <FaPlus /> Add New Setting
            </button>
          </div>

          {/* Settings List */}
          <div className="space-y-4">
            {filteredSettings.map((setting) => (
              <div
                key={setting._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                  !setting.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FaList className="text-blue-500" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {setting.settingKey}
                          </h3>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        setting.settingType === 'dropdown_options'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {setting.settingType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Array.isArray(setting.settingValue) ? setting.settingValue.length : 0} items
                      </span>
                      <button
                        onClick={() => handleToggleActive(setting._id, setting.isActive)}
                        className={`p-2 rounded-lg transition-all ${
                          setting.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={setting.isActive ? 'Active' : 'Inactive'}
                      >
                        {setting.isActive ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                      </button>
                      {editingItem === setting._id ? (
                        <>
                          <button
                            onClick={() => handleSave(setting._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Save"
                          >
                            <FaSave size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditingValues([]);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                            title="Cancel"
                          >
                            <FaTimes size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(setting)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(setting._id, setting.settingKey)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {editingItem === setting._id ? (
                    <div className="space-y-4">
                      {/* Add New Value */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                          placeholder="Add new value..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleAddValue}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      {/* Values List */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {editingValues.map((value, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-all"
                          >
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1 rounded ${
                                  index === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                <FaArrowUp size={14} />
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === editingValues.length - 1}
                                className={`p-1 rounded ${
                                  index === editingValues.length - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                <FaArrowDown size={14} />
                              </button>
                            </div>
                            <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                const newValues = [...editingValues];
                                newValues[index] = e.target.value;
                                setEditingValues(newValues);
                              }}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleRemoveValue(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {Array.isArray(setting.settingValue) && setting.settingValue.map((value, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200"
                        >
                          <span className="text-gray-400 mr-2">{index + 1}.</span>
                          {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredSettings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Settings Found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Setting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Add New Setting</h2>
            </div>
            <form onSubmit={handleCreateSetting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Setting Key *
                </label>
                <input
                  type="text"
                  value={newSetting.settingKey}
                  onChange={(e) => setNewSetting({ ...newSetting, settingKey: e.target.value })}
                  placeholder="e.g., new_dropdown_list"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  placeholder="Brief description of this setting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newSetting.settingType}
                  onChange={(e) => setNewSetting({ ...newSetting, settingType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dropdown_options">Dropdown Options</option>
                  <option value="system_config">System Config</option>
                  <option value="feature_flag">Feature Flag</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Values (comma-separated)
                </label>
                <textarea
                  value={newSetting.settingValue.join(', ')}
                  onChange={(e) =>
                    setNewSetting({
                      ...newSetting,
                      settingValue: e.target.value.split(',').map((v) => v.trim()).filter((v) => v)
                    })
                  }
                  placeholder="Value 1, Value 2, Value 3"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
                >
                  Create Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LoginLayout>
  );
}
