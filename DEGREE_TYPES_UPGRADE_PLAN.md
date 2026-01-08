# Degree Types System Upgrade Plan
## Multi-Degree Support (Bachelor, Master, PhD, Diploma)

**Date:** January 8, 2026  
**Status:** Planning Phase  
**Version:** 1.0

---

## 📋 Executive Summary

This document outlines the comprehensive plan to upgrade the CRM system from supporting only Bachelor degree students to supporting multiple degree types:
- **بكالوريوس (Bachelor)** - Current implementation
- **ماجستير (Master)** - New
- **دكتوراه (PhD)** - New  
- **دبلوم (Diploma)** - Future support

---

## 🎯 Requirements Analysis

### Current System State
The system currently handles customers seeking Bachelor degrees with:
- **Current Qualification (المؤهل الحالي)**: High school certificate data
- **Desired Program (البرنامج المطلوب)**: Bachelor program preferences

### New Requirements

#### For Master's Degree Students
**Current Qualification Changes** (المؤهل الحالي):
- تخصص مؤهل بكالوريوس (الحاصل عليها الطالب) - Bachelor Specialization
- كليه مؤهل بكالوريوس (الحاصل عليها الطالب) - Bachelor College
- جامعة المؤهل (البكالوريوس)(الحاصل عليها الطالب) - Bachelor University
- دولة شهادة البكالوريوس(الحاصل عليها الطالب) - Bachelor Certificate Country
- سنة الحصول علي شهادة البكالوريوس(الحاصل عليها الطالب) - Bachelor Graduation Year
- نظام الدراسه - Study System
- تقدير - Rating/Grade
- معدل - GPA
- عدد الساعات المعتمدة - Credit Hours
- مدة الدراسة - Study Duration

**Desired Program Changes** (البرنامج المطلوب):
- التخصص الدقيق المطلوب - Specific Desired Specialization
- الكليه المطلوبه - Desired College
- الجامعه المطلوبه - Desired University
- نوع الجامعه المطلوبة - Desired University Type
- نظام الدراسة المطلوب - Desired Study System
- طريقة الدراسة المطلوب - Desired Study Method
- نوع الماجستير المطلوب - Master Type (Research/Coursework)
- القطاع الدراسي المطلوب - Desired Academic Sector
- وقت الدراسة المطلوب - Desired Study Time

#### For PhD Degree Students
**Current Qualification Changes** (المؤهل الحالي):
Same as Master's, but for Master's degree held:
- تخصص مؤهل ماجستير (الحاصل عليها الطالب) - Master's Specialization
- كليه مؤهل ماجستير (الحاصل عليها الطالب) - Master's College
- جامعة المؤهل (الماجستير)(الحاصل عليها الطالب) - Master's University
- دولة شهادة الماجستير(الحاصل عليها الطالب) - Master's Certificate Country
- سنة الحصول علي شهادة الماجستير(الحاصل عليها الطالب) - Master's Graduation Year
- نظام الدراسه - Study System
- تقدير - Rating/Grade
- معدل - GPA
- عنوان رسالة الماجستير - Master's Thesis Title
- مدة الدراسة - Study Duration

**Desired Program Changes** (البرنامج المطلوب):
Similar to Master's with PhD-specific fields:
- التخصص الدقيق المطلوب - Specific Desired Specialization
- الكليه المطلوبه - Desired College
- الجامعه المطلوبه - Desired University
- نوع الجامعه المطلوبة - Desired University Type
- نظام الدراسة المطلوب - Desired Study System
- طريقة الدراسة المطلوب - Desired Study Method
- مجال البحث المطلوب - Desired Research Field
- القطاع الدراسي المطلوب - Desired Academic Sector
- وقت الدراسة المطلوب - Desired Study Time

---

## 🏗️ Architecture Design

### 1. Database Schema Changes

#### Customer Model Enhancement

```javascript
// Add new top-level field
degreeType: {
  type: String,
  enum: ['bachelor', 'master', 'phd', 'diploma'],
  default: 'bachelor',
  required: true,
  index: true
}

// Restructure currentQualification to support all degree types
currentQualification: {
  // Common fields (all degree types)
  certificateName: String,
  graduationYear: Number,
  grade: String,
  overallRating: String,
  studySystem: String,
  studyDuration: String,
  equivalencyRequirements: String,
  counselorNotes: String,
  
  // Bachelor-specific (for Bachelor seekers)
  bachelor: {
    certificateTrack: String,
    availableColleges: [String],
  },
  
  // Master-specific (for Master seekers - they hold Bachelor)
  masterSeeker: {
    bachelorSpecialization: String,
    bachelorCollege: String,
    bachelorUniversity: String,
    bachelorCountry: String,
    bachelorGraduationYear: Number,
    bachelorStudySystem: String,
    bachelorRating: String,
    bachelorGPA: String,
    creditHours: Number,
    studyDuration: String,
  },
  
  // PhD-specific (for PhD seekers - they hold Master)
  phdSeeker: {
    masterSpecialization: String,
    masterCollege: String,
    masterUniversity: String,
    masterCountry: String,
    masterGraduationYear: Number,
    masterStudySystem: String,
    masterRating: String,
    masterGPA: String,
    masterThesisTitle: String,
    studyDuration: String,
  },
  
  // Diploma-specific (future)
  diplomaSeeker: {
    // To be defined
  },
  
  // Documents (all types)
  otherDocuments: [
    {
      documentType: String,
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      uploadedBy: ObjectId,
    }
  ]
}

// Restructure desiredProgram to support all degree types
desiredProgram: {
  // Common fields (all degree types)
  desiredSpecialization: String,
  desiredSpecializationId: ObjectId,
  desiredCollege: String,
  desiredCollegeId: ObjectId,
  desiredUniversity: String,
  desiredUniversityId: ObjectId,
  desiredUniversityType: String,
  desiredStudySystem: String,
  desiredStudyTime: String,
  desiredSector: String,
  
  // Bachelor-specific
  bachelor: {
    // Uses common fields only
  },
  
  // Master-specific
  master: {
    specificSpecialization: String,
    studyMethod: String,
    masterType: String, // Research/Coursework
  },
  
  // PhD-specific
  phd: {
    specificSpecialization: String,
    studyMethod: String,
    researchField: String,
  },
  
  // Diploma-specific (future)
  diploma: {
    // To be defined
  }
}
```

### 2. System Settings Updates

New dropdown options needed:

```javascript
// Master/PhD specific settings
{
  settingKey: 'master_types',
  settingValue: ['ماجستير بحثي', 'ماجستير مهني', 'ماجستير مختلط'],
  settingType: 'dropdown_options',
  description: 'Types of Master programs'
},
{
  settingKey: 'study_methods',
  settingValue: ['حضوري', 'عن بعد', 'مختلط', 'تنفيذي'],
  settingType: 'dropdown_options',
  description: 'Study methods for graduate programs'
},
{
  settingKey: 'research_fields',
  settingValue: ['علوم إنسانية', 'علوم طبيعية', 'علوم اجتماعية', 'هندسة', 'طب', 'إدارة'],
  settingType: 'dropdown_options',
  description: 'Research fields for PhD'
},
{
  settingKey: 'degree_types',
  settingValue: ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'],
  settingType: 'dropdown_options',
  description: 'Available degree types'
}
```

---

## 📝 Implementation Plan

### Phase 1: Database & Models (Priority: HIGH)

#### Task 1.1: Update Customer Model
**File:** `models/Customer.js`
- Add `degreeType` field at top level
- Restructure `currentQualification` with nested objects
- Restructure `desiredProgram` with nested objects
- Add validation for degree-specific fields
- Maintain backward compatibility

**Estimated Time:** 2 hours

#### Task 1.2: Update SystemSetting Model
**File:** `models/SystemSetting.js`
- No changes needed (already flexible)

**Estimated Time:** 0 hours

#### Task 1.3: Create Migration Script
**File:** `scripts/migrateDegreeTypes.js`
- Set all existing customers to `degreeType: 'bachelor'`
- Move existing fields to appropriate nested structures
- Validate data integrity

**Estimated Time:** 1 hour

#### Task 1.4: Update Seed Scripts
**File:** `scripts/seedSystemSettings.js`
- Add new system settings for Master/PhD
- Update existing settings if needed

**Estimated Time:** 30 minutes

---

### Phase 2: API Layer (Priority: HIGH)

#### Task 2.1: Update Customer API Endpoints
**Files:**
- `pages/api/crm/customers/index.js` (GET, POST)
- `pages/api/crm/customers/[id].js` (GET, PUT, DELETE)

**Changes:**
- Accept and validate `degreeType` in POST/PUT
- Return degree-specific fields based on `degreeType`
- Add filtering by `degreeType` in GET list
- Validate required fields based on degree type

**Estimated Time:** 2 hours

#### Task 2.2: Update System Settings API
**File:** `pages/api/crm/system-settings/index.js`
- Ensure new settings are returned
- No major changes needed

**Estimated Time:** 15 minutes

---

### Phase 3: Frontend Forms (Priority: HIGH)

#### Task 3.1: Update Customer Create Form
**File:** `pages/crm/customers/create.js`

**Changes:**
1. Add degree type selector at the beginning (Step 0 or in Step 1)
2. Update Step 3 (Current Qualification):
   - Show Bachelor fields if `degreeType === 'bachelor'`
   - Show Master-seeker fields if `degreeType === 'master'`
   - Show PhD-seeker fields if `degreeType === 'phd'`
3. Update Step 4 (Desired Program):
   - Show common fields for all types
   - Show degree-specific additional fields
4. Update form validation
5. Update form state structure

**Estimated Time:** 4 hours

#### Task 3.2: Update Customer Edit Form
**File:** `pages/crm/customers/[id]/edit.js`

**Changes:**
- Same as create form
- Add degree type display (non-editable or with warning)
- Handle existing data structure

**Estimated Time:** 3 hours

---

### Phase 4: Frontend Views (Priority: MEDIUM)

#### Task 4.1: Update Customer Detail View
**File:** `pages/crm/customers/[id].js`

**Changes:**
- Display degree type badge
- Show appropriate fields in Qualification tab based on degree type
- Show appropriate fields in Desired Program tab based on degree type
- Update labels dynamically

**Estimated Time:** 2 hours

#### Task 4.2: Update Customer List View
**File:** `pages/crm/customers/index.js`

**Changes:**
- Add degree type filter
- Add degree type column/badge in list
- Update search/filter logic

**Estimated Time:** 2 hours

#### Task 4.3: Update Dashboard
**File:** `pages/crm/dashboard.js`

**Changes:**
- Add degree type statistics
- Add degree type breakdown charts
- Filter by degree type

**Estimated Time:** 1.5 hours

---

### Phase 5: Testing & Documentation (Priority: MEDIUM)

#### Task 5.1: Create Test Cases
- Test Bachelor customer creation/edit/view
- Test Master customer creation/edit/view
- Test PhD customer creation/edit/view
- Test filtering and search by degree type
- Test data migration
- Test validation rules

**Estimated Time:** 3 hours

#### Task 5.2: Update Documentation
- Update API documentation
- Update user guide
- Create admin guide for degree types
- Update CRM guide

**Estimated Time:** 2 hours

---

## 🔄 Backward Compatibility Strategy

### Data Migration
1. All existing customers will be set to `degreeType: 'bachelor'`
2. Existing `currentQualification` fields will be preserved
3. Existing `desiredProgram` fields will be preserved
4. New nested structures will be empty for existing records

### UI Compatibility
1. Forms will default to Bachelor type for new customers
2. Existing customers will display correctly with Bachelor type
3. No data loss during migration

### API Compatibility
1. API will accept old format and convert to new format
2. API will return data in new format
3. Validation will be degree-type aware

---

## 📊 Field Mapping Reference

### Bachelor Degree (Current Implementation)
**Current Qualification:**
- Certificate Name (نوع الشهادة)
- Certificate Track (المسار)
- Grade/GPA (المعدل)
- Overall Rating (التقدير)
- Graduation Year (سنة التخرج)
- Study System (نظام الدراسة)

**Desired Program:**
- Desired Specialization (التخصص المطلوب)
- Desired College (الكلية المطلوبة)
- Desired University (الجامعة المطلوبة)
- University Type (نوع الجامعة)
- Study Time (وقت الدراسة)
- Sector (القطاع)

---

### Master's Degree (New)
**Current Qualification (Bachelor held):**
- Bachelor Specialization (تخصص البكالوريوس)
- Bachelor College (كلية البكالوريوس)
- Bachelor University (جامعة البكالوريوس)
- Bachelor Country (دولة البكالوريوس)
- Bachelor Graduation Year (سنة التخرج)
- Study System (نظام الدراسة)
- Rating (التقدير)
- GPA (المعدل)
- Credit Hours (الساعات المعتمدة)
- Study Duration (مدة الدراسة)

**Desired Program (Master):**
- Specific Specialization (التخصص الدقيق)
- Desired College (الكلية المطلوبة)
- Desired University (الجامعة المطلوبة)
- University Type (نوع الجامعة)
- Study System (نظام الدراسة)
- Study Method (طريقة الدراسة)
- Master Type (نوع الماجستير)
- Academic Sector (القطاع الدراسي)
- Study Time (وقت الدراسة)

---

### PhD Degree (New)
**Current Qualification (Master held):**
- Master Specialization (تخصص الماجستير)
- Master College (كلية الماجستير)
- Master University (جامعة الماجستير)
- Master Country (دولة الماجستير)
- Master Graduation Year (سنة التخرج)
- Study System (نظام الدراسة)
- Rating (التقدير)
- GPA (المعدل)
- Master Thesis Title (عنوان الرسالة)
- Study Duration (مدة الدراسة)

**Desired Program (PhD):**
- Specific Specialization (التخصص الدقيق)
- Desired College (الكلية المطلوبة)
- Desired University (الجامعة المطلوبة)
- University Type (نوع الجامعة)
- Study System (نظام الدراسة)
- Study Method (طريقة الدراسة)
- Research Field (مجال البحث)
- Academic Sector (القطاع الدراسي)
- Study Time (وقت الدراسة)

---

## 🎨 UI/UX Considerations

### Degree Type Selector
- Prominent placement at the top of create form
- Visual icons for each degree type
- Clear labels in Arabic and English
- Cannot be changed after creation (or with admin warning)

### Conditional Field Display
- Smooth transitions when switching degree types
- Clear section headers indicating degree type
- Helpful tooltips explaining differences
- Validation messages specific to degree type

### Visual Indicators
- Color-coded badges for degree types:
  - 🎓 Bachelor: Blue
  - 📚 Master: Purple
  - 🔬 PhD: Green
  - 📜 Diploma: Orange

---

## ⚠️ Risks & Mitigation

### Risk 1: Data Loss During Migration
**Mitigation:** 
- Create database backup before migration
- Test migration on staging environment
- Implement rollback script

### Risk 2: User Confusion
**Mitigation:**
- Clear documentation
- Training sessions for staff
- Gradual rollout with Bachelor as default

### Risk 3: Performance Impact
**Mitigation:**
- Optimize queries with degree type index
- Test with large datasets
- Monitor performance metrics

### Risk 4: Validation Complexity
**Mitigation:**
- Centralized validation functions
- Comprehensive test coverage
- Clear error messages

---

## 📅 Timeline Estimate

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|----------------|----------|
| Phase 1: Database & Models | 4 tasks | 3.5 hours | HIGH |
| Phase 2: API Layer | 2 tasks | 2.25 hours | HIGH |
| Phase 3: Frontend Forms | 2 tasks | 7 hours | HIGH |
| Phase 4: Frontend Views | 3 tasks | 5.5 hours | MEDIUM |
| Phase 5: Testing & Docs | 2 tasks | 5 hours | MEDIUM |
| **TOTAL** | **13 tasks** | **~23.25 hours** | **~3 days** |

---

## ✅ Success Criteria

1. ✅ All existing Bachelor customers work without issues
2. ✅ Can create new Master customers with all required fields
3. ✅ Can create new PhD customers with all required fields
4. ✅ Forms display correct fields based on degree type
5. ✅ Validation works correctly for each degree type
6. ✅ Filtering and search work with degree types
7. ✅ No data loss during migration
8. ✅ Performance remains acceptable
9. ✅ Documentation is complete and clear
10. ✅ All tests pass

---

## 🚀 Future Enhancements

### Diploma Support (Phase 2)
- Define Diploma-specific fields
- Add to degree type enum
- Update forms and views

### Advanced Features
- Degree progression tracking (Bachelor → Master → PhD)
- Automatic field suggestions based on previous degree
- Comparative analysis between degree types
- Custom reports by degree type

---

## 📚 Related Documents

- `CRM_GUIDE.md` - CRM system overview
- `API_INTEGRATION_GUIDE.md` - API documentation
- `models/Customer.js` - Customer model
- `models/SystemSetting.js` - System settings model

---

## 👥 Stakeholders

- **Development Team:** Implementation
- **CRM Users:** Testing and feedback
- **Admin Team:** Configuration and management
- **Management:** Approval and oversight

---

**Document Version:** 1.0  
**Last Updated:** January 8, 2026  
**Next Review:** After Phase 1 completion
