# Degree Types Implementation Guide
## Step-by-Step Integration Instructions

**Date:** January 8, 2026  
**Status:** Implementation Phase

---

## ✅ Completed Tasks

1. ✅ **Customer Model Updated** (`models/Customer.js`)
   - Added `degreeType` field (bachelor/master/phd/diploma)
   - Restructured `currentQualification` with nested objects for each degree type
   - Restructured `desiredProgram` with nested objects for each degree type

2. ✅ **System Settings Updated** (`scripts/seedSystemSettings.js`)
   - Added `degree_types` dropdown
   - Added `master_types` dropdown
   - Added `study_methods` dropdown
   - Added `research_fields` dropdown
   - Added `study_systems` dropdown
   - Added `academic_sectors` dropdown

3. ✅ **Migration Script Created** (`scripts/migrateDegreeTypes.js`)
   - Migrates existing customers to `degreeType: 'bachelor'`
   - Preserves existing data
   - Adds nested structure support

4. ✅ **API Endpoints Updated**
   - `pages/api/crm/customers/index.js` - Added degreeType filter and default
   - `pages/api/crm/customers/[id].js` - Supports new structure

5. ✅ **Helper Component Created** (`components/DegreeTypeFields.js`)
   - Conditional field components for each degree type
   - Reusable across create/edit forms

---

## 🔄 Remaining Tasks

### Task 1: Update Customer Create Form

**File:** `pages/crm/customers/create.js`

#### Step 1.1: Import Helper Component
Add at the top of the file:

```javascript
import {
  BachelorQualificationFields,
  MasterSeekerQualificationFields,
  PhDSeekerQualificationFields,
  MasterDesiredProgramFields,
  PhDDesiredProgramFields,
  handleNestedInputChange
} from '@/components/DegreeTypeFields';
```

#### Step 1.2: Degree Type Selector (Already Added)
✅ The degree type selector has been added to Step 1 (Marketing Data)

#### Step 1.3: Update Step 3 (Current Qualification)
Replace the current Step 3 content with:

```javascript
{/* Step 3: Current Qualification */}
{currentStep === 3 && (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-slate-900 mb-6">
      Current Qualification (المؤهل الحالي)
    </h2>

    {/* Degree Type Indicator */}
    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
      <p className="text-sm font-semibold text-slate-700">
        Selected Degree Type: {' '}
        <span className="text-blue-600">
          {formData.degreeType === 'bachelor' && '🎓 بكالوريوس (Bachelor)'}
          {formData.degreeType === 'master' && '📚 ماجستير (Master)'}
          {formData.degreeType === 'phd' && '🔬 دكتوراه (PhD)'}
          {formData.degreeType === 'diploma' && '📜 دبلوم (Diploma)'}
        </span>
      </p>
    </div>

    {/* Common Fields for All Degree Types */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Grade/GPA (المعدل)
        </label>
        <select
          value={formData.currentQualification.grade}
          onChange={(e) => handleInputChange('currentQualification', 'grade', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select grade</option>
          {(systemSettings.grades || []).map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Overall Rating (التقدير)
        </label>
        <select
          value={formData.currentQualification.overallRating}
          onChange={(e) => handleInputChange('currentQualification', 'overallRating', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select rating</option>
          {(systemSettings.certificate_ratings || []).map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Study System (نظام الدراسة)
        </label>
        <select
          value={formData.currentQualification.studySystem}
          onChange={(e) => handleInputChange('currentQualification', 'studySystem', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select system</option>
          {(systemSettings.study_systems || []).map(system => (
            <option key={system} value={system}>{system}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Graduation Year (سنة التخرج)
        </label>
        <input
          type="number"
          value={formData.currentQualification.graduationYear}
          onChange={(e) => handleInputChange('currentQualification', 'graduationYear', e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="2024"
          min="1950"
          max={new Date().getFullYear()}
        />
      </div>

      {/* Conditional Fields Based on Degree Type */}
      {formData.degreeType === 'bachelor' && (
        <BachelorQualificationFields 
          formData={formData}
          handleInputChange={(section, subsection, field, value) => 
            handleNestedInputChange(formData, setFormData, section, subsection, field, value)
          }
          systemSettings={systemSettings}
        />
      )}

      {formData.degreeType === 'master' && (
        <MasterSeekerQualificationFields 
          formData={formData}
          setFormData={setFormData}
          systemSettings={systemSettings}
        />
      )}

      {formData.degreeType === 'phd' && (
        <PhDSeekerQualificationFields 
          formData={formData}
          setFormData={setFormData}
          systemSettings={systemSettings}
        />
      )}
    </div>

    {/* Counselor Notes - Common for all */}
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Counselor Notes (ملاحظات المرشد)
      </label>
      <textarea
        value={formData.currentQualification.counselorNotes}
        onChange={(e) => handleInputChange('currentQualification', 'counselorNotes', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Add any notes about the qualification"
      />
    </div>
  </div>
)}
```

#### Step 1.4: Update Step 4 (Desired Program)
Add conditional fields after the common fields:

```javascript
{/* After the common desired program fields, add: */}

{/* Master-specific fields */}
{formData.degreeType === 'master' && (
  <MasterDesiredProgramFields 
    formData={formData}
    setFormData={setFormData}
    systemSettings={systemSettings}
  />
)}

{/* PhD-specific fields */}
{formData.degreeType === 'phd' && (
  <PhDDesiredProgramFields 
    formData={formData}
    setFormData={setFormData}
    systemSettings={systemSettings}
  />
)}
```

---

### Task 2: Update Customer Edit Form

**File:** `pages/crm/customers/[id]/edit.js`

Apply the same changes as the create form:
1. Import helper components
2. Add degree type display (non-editable or with warning)
3. Update currentQualification section with conditional fields
4. Update desiredProgram section with conditional fields

---

### Task 3: Update Customer Detail View

**File:** `pages/crm/customers/[id].js`

#### Step 3.1: Add Degree Type Badge to Header
In the header section, after the customer number:

```javascript
<div className="flex items-center gap-2 mb-2">
  <span className="font-mono font-semibold text-blue-600">
    {customer.customerNumber}
  </span>
  {/* Degree Type Badge */}
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
    customer.degreeType === 'bachelor' ? 'bg-blue-100 text-blue-700' :
    customer.degreeType === 'master' ? 'bg-purple-100 text-purple-700' :
    customer.degreeType === 'phd' ? 'bg-green-100 text-green-700' :
    'bg-orange-100 text-orange-700'
  }`}>
    {customer.degreeType === 'bachelor' && '🎓 بكالوريوس'}
    {customer.degreeType === 'master' && '📚 ماجستير'}
    {customer.degreeType === 'phd' && '🔬 دكتوراه'}
    {customer.degreeType === 'diploma' && '📜 دبلوم'}
  </span>
</div>
```

#### Step 3.2: Update Qualification Tab
Show fields conditionally based on degree type:

```javascript
{activeTab === 'qualification' && (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-xl font-bold text-slate-900 mb-6">
      Current Qualification (المؤهل الحالي)
    </h2>
    
    {/* Common Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoField label="Grade/GPA" value={customer.currentQualification?.grade || 'Not specified'} />
      <InfoField label="Overall Rating" value={customer.currentQualification?.overallRating || 'Not specified'} />
      <InfoField label="Graduation Year" value={customer.currentQualification?.graduationYear || 'Not specified'} />
      <InfoField label="Study System" value={customer.currentQualification?.studySystem || 'Not specified'} />
    </div>

    {/* Bachelor-specific fields */}
    {customer.degreeType === 'bachelor' && customer.currentQualification?.bachelor && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">High School Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Certificate Track" value={customer.currentQualification.bachelor.certificateTrack || 'Not specified'} />
        </div>
      </div>
    )}

    {/* Master-seeker fields */}
    {customer.degreeType === 'master' && customer.currentQualification?.masterSeeker && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">📚 Bachelor's Degree (Held)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Specialization" value={customer.currentQualification.masterSeeker.bachelorSpecialization || 'Not specified'} />
          <InfoField label="College" value={customer.currentQualification.masterSeeker.bachelorCollege || 'Not specified'} />
          <InfoField label="University" value={customer.currentQualification.masterSeeker.bachelorUniversity || 'Not specified'} />
          <InfoField label="Country" value={customer.currentQualification.masterSeeker.bachelorCountry || 'Not specified'} />
          <InfoField label="Graduation Year" value={customer.currentQualification.masterSeeker.bachelorGraduationYear || 'Not specified'} />
          <InfoField label="GPA" value={customer.currentQualification.masterSeeker.bachelorGPA || 'Not specified'} />
          <InfoField label="Credit Hours" value={customer.currentQualification.masterSeeker.creditHours || 'Not specified'} />
        </div>
      </div>
    )}

    {/* PhD-seeker fields */}
    {customer.degreeType === 'phd' && customer.currentQualification?.phdSeeker && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">🔬 Master's Degree (Held)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Specialization" value={customer.currentQualification.phdSeeker.masterSpecialization || 'Not specified'} />
          <InfoField label="College" value={customer.currentQualification.phdSeeker.masterCollege || 'Not specified'} />
          <InfoField label="University" value={customer.currentQualification.phdSeeker.masterUniversity || 'Not specified'} />
          <InfoField label="Country" value={customer.currentQualification.phdSeeker.masterCountry || 'Not specified'} />
          <InfoField label="Graduation Year" value={customer.currentQualification.phdSeeker.masterGraduationYear || 'Not specified'} />
          <InfoField label="GPA" value={customer.currentQualification.phdSeeker.masterGPA || 'Not specified'} />
          <InfoField label="Thesis Title" value={customer.currentQualification.phdSeeker.masterThesisTitle || 'Not specified'} />
        </div>
      </div>
    )}

    {customer.currentQualification?.counselorNotes && (
      <div className="mt-6">
        <InfoField label="Counselor Notes" value={customer.currentQualification.counselorNotes} multiline />
      </div>
    )}
  </div>
)}
```

#### Step 3.3: Update Desired Program Tab
Similar conditional rendering for desired program fields.

---

### Task 4: Update Customer List View

**File:** `pages/crm/customers/index.js`

#### Step 4.1: Add Degree Type Filter
Add to the filters section:

```javascript
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Degree Type
  </label>
  <select
    value={filters.degreeType}
    onChange={(e) => setFilters({...filters, degreeType: e.target.value})}
    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
  >
    <option value="">All Degrees</option>
    <option value="bachelor">🎓 Bachelor</option>
    <option value="master">📚 Master</option>
    <option value="phd">🔬 PhD</option>
    <option value="diploma">📜 Diploma</option>
  </select>
</div>
```

#### Step 4.2: Add Degree Type Column/Badge
In the customer list table/cards, add degree type badge:

```javascript
<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
  customer.degreeType === 'bachelor' ? 'bg-blue-100 text-blue-700' :
  customer.degreeType === 'master' ? 'bg-purple-100 text-purple-700' :
  customer.degreeType === 'phd' ? 'bg-green-100 text-green-700' :
  'bg-orange-100 text-orange-700'
}`}>
  {customer.degreeType === 'bachelor' && '🎓'}
  {customer.degreeType === 'master' && '📚'}
  {customer.degreeType === 'phd' && '🔬'}
  {customer.degreeType === 'diploma' && '📜'}
</span>
```

---

## 🚀 Deployment Steps

### Step 1: Run System Settings Seed
```bash
node scripts/seedSystemSettings.js
```

This will add the new dropdown options to the database.

### Step 2: Run Migration Script
```bash
node scripts/migrateDegreeTypes.js
```

This will:
- Set all existing customers to `degreeType: 'bachelor'`
- Migrate existing data to new structure
- Preserve all existing information

### Step 3: Test Each Degree Type

#### Test Bachelor (Existing Functionality)
1. Create new Bachelor customer
2. Verify all fields work
3. Edit and view customer

#### Test Master
1. Create new Master customer
2. Fill in Bachelor degree information (held)
3. Fill in desired Master program
4. Verify save and display

#### Test PhD
1. Create new PhD customer
2. Fill in Master degree information (held)
3. Fill in desired PhD program
4. Verify save and display

### Step 4: Verify Filters and Search
1. Test degree type filter in customer list
2. Verify search works across all degree types
3. Check dashboard statistics

---

## 📋 Testing Checklist

- [ ] System settings seeded successfully
- [ ] Migration script completed without errors
- [ ] Degree type selector works in create form
- [ ] Bachelor customer creation works
- [ ] Master customer creation works
- [ ] PhD customer creation works
- [ ] Conditional fields display correctly in create form
- [ ] Conditional fields display correctly in edit form
- [ ] Conditional fields display correctly in detail view
- [ ] Degree type filter works in customer list
- [ ] Degree type badges display correctly
- [ ] API endpoints handle all degree types
- [ ] Validation works for each degree type
- [ ] Existing customers still work (backward compatibility)
- [ ] Search and filters work with new structure
- [ ] Dashboard shows degree type breakdown

---

## 🎨 UI/UX Notes

### Color Scheme
- **Bachelor**: Blue (`bg-blue-100`, `text-blue-700`)
- **Master**: Purple (`bg-purple-100`, `text-purple-700`)
- **PhD**: Green (`bg-green-100`, `text-green-700`)
- **Diploma**: Orange (`bg-orange-100`, `text-orange-700`)

### Icons
- **Bachelor**: 🎓
- **Master**: 📚
- **PhD**: 🔬
- **Diploma**: 📜

---

## 🔧 Troubleshooting

### Issue: Degree type not saving
**Solution:** Check that `degreeType` is included in formData and API request

### Issue: Nested fields not saving
**Solution:** Verify `handleNestedInputChange` is being used correctly

### Issue: Old customers showing errors
**Solution:** Run migration script to update existing customers

### Issue: Dropdown options not appearing
**Solution:** Run seed script to add new system settings

---

## 📚 Related Files

- `models/Customer.js` - Customer schema
- `components/DegreeTypeFields.js` - Conditional field components
- `scripts/seedSystemSettings.js` - System settings seed
- `scripts/migrateDegreeTypes.js` - Migration script
- `pages/api/crm/customers/index.js` - Customer API (list/create)
- `pages/api/crm/customers/[id].js` - Customer API (get/update/delete)
- `pages/crm/customers/create.js` - Create form
- `pages/crm/customers/[id]/edit.js` - Edit form
- `pages/crm/customers/[id].js` - Detail view
- `pages/crm/customers/index.js` - List view

---

**Document Version:** 1.0  
**Last Updated:** January 8, 2026  
**Status:** Ready for Implementation
