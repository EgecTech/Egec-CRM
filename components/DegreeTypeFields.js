// components/DegreeTypeFields.js
// Conditional form fields based on degree type

import React from 'react';

// Helper function to handle nested field changes
export const handleNestedInputChange = (formData, setFormData, section, subsection, field, value) => {
  setFormData({
    ...formData,
    [section]: {
      ...formData[section],
      [subsection]: {
        ...formData[section][subsection],
        [field]: value
      }
    }
  });
};

// Current Qualification Fields for Bachelor Seekers
export function BachelorQualificationFields({ formData, handleInputChange, systemSettings }) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Certificate Track (المسار) <span className="text-slate-500">(علمي/أدبي)</span>
        </label>
        <input
          type="text"
          value={formData.currentQualification.bachelor?.certificateTrack || ''}
          onChange={(e) => handleNestedInputChange(formData, handleInputChange, 'currentQualification', 'bachelor', 'certificateTrack', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., علمي، أدبي"
        />
      </div>
    </>
  );
}

// Current Qualification Fields for Master Seekers (they hold Bachelor)
export function MasterSeekerQualificationFields({ formData, setFormData, systemSettings }) {
  const handleChange = (field, value) => {
    handleNestedInputChange(formData, setFormData, 'currentQualification', 'masterSeeker', field, value);
  };

  return (
    <>
      <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-blue-900">
          📚 معلومات شهادة البكالوريوس (الحاصل عليها الطالب)
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Bachelor's Degree Information (that the student already holds)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          تخصص البكالوريوس <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.currentQualification.masterSeeker?.bachelorSpecialization || ''}
          onChange={(e) => handleChange('bachelorSpecialization', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Computer Science"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          كلية البكالوريوس
        </label>
        <input
          type="text"
          value={formData.currentQualification.masterSeeker?.bachelorCollege || ''}
          onChange={(e) => handleChange('bachelorCollege', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., College of Engineering"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          جامعة البكالوريوس
        </label>
        <input
          type="text"
          value={formData.currentQualification.masterSeeker?.bachelorUniversity || ''}
          onChange={(e) => handleChange('bachelorUniversity', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Cairo University"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          دولة شهادة البكالوريوس
        </label>
        <select
          value={formData.currentQualification.masterSeeker?.bachelorCountry || ''}
          onChange={(e) => handleChange('bachelorCountry', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر الدولة</option>
          {(systemSettings.countries || []).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          سنة الحصول على البكالوريوس
        </label>
        <input
          type="number"
          value={formData.currentQualification.masterSeeker?.bachelorGraduationYear || ''}
          onChange={(e) => handleChange('bachelorGraduationYear', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="2020"
          min="1950"
          max={new Date().getFullYear()}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          نظام الدراسة
        </label>
        <select
          value={formData.currentQualification.masterSeeker?.bachelorStudySystem || ''}
          onChange={(e) => handleChange('bachelorStudySystem', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر نظام الدراسة</option>
          {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(system => (
            <option key={system} value={system}>{system}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          التقدير
        </label>
        <select
          value={formData.currentQualification.masterSeeker?.bachelorRating || ''}
          onChange={(e) => handleChange('bachelorRating', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر التقدير</option>
          {(systemSettings.certificate_ratings || ['Excellent', 'Very Good', 'Good', 'Acceptable']).map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          المعدل (GPA)
        </label>
        <input
          type="text"
          value={formData.currentQualification.masterSeeker?.bachelorGPA || ''}
          onChange={(e) => handleChange('bachelorGPA', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 3.5/4.0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          عدد الساعات المعتمدة
        </label>
        <input
          type="number"
          value={formData.currentQualification.masterSeeker?.creditHours || ''}
          onChange={(e) => handleChange('creditHours', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 120"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          مدة الدراسة
        </label>
        <input
          type="text"
          value={formData.currentQualification.masterSeeker?.studyDuration || ''}
          onChange={(e) => handleChange('studyDuration', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 4 years"
        />
      </div>
    </>
  );
}

// Current Qualification Fields for PhD Seekers (they hold Master)
export function PhDSeekerQualificationFields({ formData, setFormData, systemSettings }) {
  const handleChange = (field, value) => {
    handleNestedInputChange(formData, setFormData, 'currentQualification', 'phdSeeker', field, value);
  };

  return (
    <>
      <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-green-900">
          🔬 معلومات شهادة الماجستير (الحاصل عليها الطالب)
        </p>
        <p className="text-xs text-green-700 mt-1">
          Master's Degree Information (that the student already holds)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          تخصص الماجستير <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.masterSpecialization || ''}
          onChange={(e) => handleChange('masterSpecialization', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Computer Science"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          كلية الماجستير
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.masterCollege || ''}
          onChange={(e) => handleChange('masterCollege', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., College of Engineering"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          جامعة الماجستير
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.masterUniversity || ''}
          onChange={(e) => handleChange('masterUniversity', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Cairo University"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          دولة شهادة الماجستير
        </label>
        <select
          value={formData.currentQualification.phdSeeker?.masterCountry || ''}
          onChange={(e) => handleChange('masterCountry', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر الدولة</option>
          {(systemSettings.countries || []).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          سنة الحصول على الماجستير
        </label>
        <input
          type="number"
          value={formData.currentQualification.phdSeeker?.masterGraduationYear || ''}
          onChange={(e) => handleChange('masterGraduationYear', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="2022"
          min="1950"
          max={new Date().getFullYear()}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          نظام الدراسة
        </label>
        <select
          value={formData.currentQualification.phdSeeker?.masterStudySystem || ''}
          onChange={(e) => handleChange('masterStudySystem', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر نظام الدراسة</option>
          {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(system => (
            <option key={system} value={system}>{system}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          التقدير
        </label>
        <select
          value={formData.currentQualification.phdSeeker?.masterRating || ''}
          onChange={(e) => handleChange('masterRating', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر التقدير</option>
          {(systemSettings.certificate_ratings || ['Excellent', 'Very Good', 'Good', 'Acceptable']).map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          المعدل (GPA)
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.masterGPA || ''}
          onChange={(e) => handleChange('masterGPA', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 3.8/4.0"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          عنوان رسالة الماجستير
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.masterThesisTitle || ''}
          onChange={(e) => handleChange('masterThesisTitle', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Master's thesis title"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          مدة الدراسة
        </label>
        <input
          type="text"
          value={formData.currentQualification.phdSeeker?.studyDuration || ''}
          onChange={(e) => handleChange('studyDuration', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 2 years"
        />
      </div>
    </>
  );
}

// Desired Program Fields for Master
export function MasterDesiredProgramFields({ formData, setFormData, systemSettings }) {
  const handleChange = (field, value) => {
    handleNestedInputChange(formData, setFormData, 'desiredProgram', 'master', field, value);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          التخصص الدقيق المطلوب
        </label>
        <input
          type="text"
          value={formData.desiredProgram.master?.specificSpecialization || ''}
          onChange={(e) => handleChange('specificSpecialization', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Specific specialization"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          طريقة الدراسة المطلوب
        </label>
        <select
          value={formData.desiredProgram.master?.studyMethod || ''}
          onChange={(e) => handleChange('studyMethod', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر طريقة الدراسة</option>
          {(systemSettings.study_methods || ['حضوري', 'عن بعد', 'مختلط', 'تنفيذي']).map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          نوع الماجستير المطلوب
        </label>
        <select
          value={formData.desiredProgram.master?.masterType || ''}
          onChange={(e) => handleChange('masterType', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر نوع الماجستير</option>
          {(systemSettings.master_types || ['ماجستير بحثي', 'ماجستير مهني', 'ماجستير مختلط']).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </>
  );
}

// Desired Program Fields for PhD
export function PhDDesiredProgramFields({ formData, setFormData, systemSettings }) {
  const handleChange = (field, value) => {
    handleNestedInputChange(formData, setFormData, 'desiredProgram', 'phd', field, value);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          التخصص الدقيق المطلوب
        </label>
        <input
          type="text"
          value={formData.desiredProgram.phd?.specificSpecialization || ''}
          onChange={(e) => handleChange('specificSpecialization', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Specific specialization"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          طريقة الدراسة المطلوب
        </label>
        <select
          value={formData.desiredProgram.phd?.studyMethod || ''}
          onChange={(e) => handleChange('studyMethod', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر طريقة الدراسة</option>
          {(systemSettings.study_methods || ['حضوري', 'عن بعد', 'مختلط']).map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          مجال البحث المطلوب
        </label>
        <select
          value={formData.desiredProgram.phd?.researchField || ''}
          onChange={(e) => handleChange('researchField', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر مجال البحث</option>
          {(systemSettings.research_fields || ['علوم إنسانية', 'علوم طبيعية', 'هندسة', 'طب']).map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>
      </div>
    </>
  );
}
