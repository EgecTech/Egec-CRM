# Degree Types System - Quick Reference Card

## 🚀 Quick Start

### 1. Deploy New Settings
```bash
node scripts/seedSystemSettings.js
```

### 2. Migrate Existing Data
```bash
node scripts/migrateDegreeTypes.js
```

### 3. Verify
- Check customer collection for `degreeType` field
- Test creating new customers with different degree types

---

## 🎓 Degree Types

| Type | Arabic | Icon | Color | Value |
|------|--------|------|-------|-------|
| Bachelor | بكالوريوس | 🎓 | Blue | `bachelor` |
| Master | ماجستير | 📚 | Purple | `master` |
| PhD | دكتوراه | 🔬 | Green | `phd` |
| Diploma | دبلوم | 📜 | Orange | `diploma` |

---

## 📋 Field Structure

### Bachelor (بكالوريوس)
**Current Qualification:** High School Certificate
- Certificate Track (المسار)
- Grade, Rating, Graduation Year

**Desired Program:** Bachelor Degree
- University, College, Specialization
- Study Time, University Type, Sector

---

### Master (ماجستير)
**Current Qualification:** Bachelor Degree (Held)
- Bachelor Specialization, College, University
- Bachelor Country, Graduation Year
- GPA, Credit Hours, Study Duration

**Desired Program:** Master Degree
- University, College, Specialization
- Study Method (حضوري/عن بعد/مختلط)
- Master Type (بحثي/مهني/مختلط)
- Research Field, Study Time

---

### PhD (دكتوراه)
**Current Qualification:** Master Degree (Held)
- Master Specialization, College, University
- Master Country, Graduation Year
- GPA, Thesis Title, Study Duration

**Desired Program:** PhD Degree
- University, College, Specialization
- Study Method
- Research Field
- Study Time

---

## 🔧 Code Snippets

### Import Helper Components
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

### Degree Type Badge
```javascript
<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
```

### Conditional Rendering
```javascript
{formData.degreeType === 'bachelor' && (
  <BachelorQualificationFields {...props} />
)}

{formData.degreeType === 'master' && (
  <MasterSeekerQualificationFields {...props} />
)}

{formData.degreeType === 'phd' && (
  <PhDSeekerQualificationFields {...props} />
)}
```

### Nested Field Update
```javascript
handleNestedInputChange(
  formData, 
  setFormData, 
  'currentQualification',  // section
  'masterSeeker',          // subsection
  'bachelorSpecialization', // field
  value
);
```

---

## 🗂️ System Settings Keys

| Setting Key | Description |
|------------|-------------|
| `degree_types` | بكالوريوس, ماجستير, دكتوراه, دبلوم |
| `master_types` | ماجستير بحثي, ماجستير مهني, ماجستير مختلط |
| `study_methods` | حضوري, عن بعد, مختلط, تنفيذي |
| `research_fields` | علوم إنسانية, علوم طبيعية, هندسة, طب, etc. |
| `study_systems` | سنوي, فصلي, ساعات معتمدة, etc. |
| `academic_sectors` | القطاع الطبي, الهندسي, الإداري, etc. |

---

## 🔍 API Filters

### Get Customers by Degree Type
```javascript
GET /api/crm/customers?degreeType=master
```

### Filter Options
- `degreeType=bachelor`
- `degreeType=master`
- `degreeType=phd`
- `degreeType=diploma`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `models/Customer.js` | Customer schema with degree types |
| `components/DegreeTypeFields.js` | Conditional field components |
| `scripts/migrateDegreeTypes.js` | Data migration script |
| `scripts/seedSystemSettings.js` | System settings seed |
| `DEGREE_TYPES_IMPLEMENTATION_GUIDE.md` | Detailed integration guide |
| `DEGREE_TYPES_UPGRADE_SUMMARY.md` | Complete summary |

---

## ⚡ Common Tasks

### Create Bachelor Customer
1. Select 🎓 Bachelor degree type
2. Fill high school certificate info
3. Fill desired bachelor program
4. Save

### Create Master Customer
1. Select 📚 Master degree type
2. Fill bachelor degree info (already held)
3. Fill desired master program
4. Select master type and study method
5. Save

### Create PhD Customer
1. Select 🔬 PhD degree type
2. Fill master degree info (already held)
3. Fill desired PhD program
4. Select research field and study method
5. Save

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Settings not showing | Run `node scripts/seedSystemSettings.js` |
| Old customers error | Run `node scripts/migrateDegreeTypes.js` |
| Nested fields not saving | Use `handleNestedInputChange` helper |
| Degree type not in API | Check API includes `degreeType` in query |

---

## 📞 Need Help?

1. **Implementation:** See `DEGREE_TYPES_IMPLEMENTATION_GUIDE.md`
2. **Overview:** See `DEGREE_TYPES_UPGRADE_SUMMARY.md`
3. **Planning:** See `DEGREE_TYPES_UPGRADE_PLAN.md`

---

**Version:** 1.0  
**Last Updated:** January 8, 2026
