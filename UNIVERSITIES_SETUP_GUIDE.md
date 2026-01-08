# 🎓 Universities System Setup Guide

**Created:** January 8, 2026  
**Purpose:** Setup and manage universities database for cascading dropdowns

---

## 📊 Overview

The system now includes **153 universities** from **6 countries**:

| Country | Universities | Arabic Name |
|---------|-------------|-------------|
| 🇪🇬 Egypt | 90 | مصر |
| 🇯🇴 Jordan | 45 | الأردن |
| 🇩🇪 Germany | 12 | ألمانيا |
| 🇭🇺 Hungary | 8 | هنغاريا |
| 🇦🇪 UAE | 2 | الإمارات |
| 🇨🇾 Cyprus | 6 | قبرص |

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Study Destinations
```bash
npm run seed:destinations
```

**This will:**
- Add 6 new countries to study destinations
- Update system settings
- Make countries available in dropdowns

**Output:**
```
✅ Study destinations updated
📋 Study Destinations List:
   1. مصر
   2. الأردن
   3. ألمانيا
   4. هنغاريا
   5. الإمارات
   6. قبرص
   ... and more
```

---

### Step 2: Seed Universities Database
```bash
npm run seed:universities
```

**This will:**
- Clear existing universities
- Insert 153 universities
- Create indexes for fast searching
- Organize by country

**Output:**
```
✅ Inserted 153 universities

📈 Universities per country:
   Egypt: 90 universities
   Jordan: 45 universities
   Germany: 12 universities
   Hungary: 8 universities
   United Arab Emirates: 2 universities
   Cyprus: 6 universities
```

---

### Step 3: Test the System
```bash
# 1. Start the development server
npm run dev

# 2. Login to CRM
# 3. Go to Create Customer
# 4. In Desired Program section:
#    - Select "Study Destination": مصر (Egypt)
#    - Watch "Desired University" populate with Egyptian universities
#    - Select a university
```

---

## 🔄 How Cascading Dropdowns Work

### Flow Diagram
```
User selects Study Destination
         ↓
   مصر (Egypt) selected
         ↓
API: /api/crm/universities?country=Egypt
         ↓
Returns 90 Egyptian universities
         ↓
Dropdown populates with universities
         ↓
User selects university
         ↓
API: /api/crm/universities/[id]/colleges
         ↓
Returns colleges for that university
         ↓
College dropdown populates
```

### API Endpoints

#### 1. Get Universities by Country
```http
GET /api/crm/universities?country=Egypt
Authorization: Session-based (logged in user)

Response:
{
  "success": true,
  "data": [
    {
      "value": "65f2a3b1c2d4e5f6a7b8c9d0",
      "label": "Cairo University - جامعة القاهرة",
      "country": "Egypt"
    },
    ...
  ]
}
```

#### 2. Get Colleges by University
```http
GET /api/crm/universities/[universityId]/colleges
Authorization: Session-based (logged in user)

Response:
{
  "success": true,
  "data": [
    {
      "value": "65f2a3b1c2d4e5f6a7b8c9d1",
      "label": "Faculty of Engineering",
      "universityId": "65f2a3b1c2d4e5f6a7b8c9d0"
    },
    ...
  ]
}
```

---

## 📝 Universities List

### 🇪🇬 Egypt (90 universities)

**Government Universities:**
- Cairo University - جامعة القاهرة
- Alexandria University - جامعة الإسكندرية
- Ain Shams University - جامعة عين شمس
- Mansoura University - جامعة المنصورة
- Assiut University - جامعة أسيوط
- ... and 40+ more

**Private Universities:**
- German University in Cairo - الجامعة الألمانية بالقاهرة
- British University in Egypt - الجامعة البريطانية في مصر
- Nile University - جامعة النيل
- Future University in Egypt - جامعة المستقبل بمصر
- ... and 40+ more

### 🇯🇴 Jordan (45 universities)

**Major Universities:**
- University of Jordan - الجامعة الأردنية
- Yarmouk University - جامعة اليرموك
- Hashemite University - الجامعة الهاشمية
- Jordan University of Science and Technology - جامعة العلوم والتكنولوجيا الاردنيه
- Middle East University - جامعة الشرق الأوسط
- ... and 40+ more

### 🇩🇪 Germany (12 universities)

**Universities:**
- Technical University of Munich - الجامعة التقنية فى ميونخ
- Free University of Berlin - برلين الحره
- Universität Bonn - جامعه بون
- Karlsruhe Institute of Technology (KIT) - معهد كالسروه للتكنولوجيا
- Fresenius University of Applied Sciences - جامعة فريزينيوس للعلوم التطبيقية
- ... and 7 more

### 🇭🇺 Hungary (8 universities)

**Universities:**
- Eötvös Loránd University (ELTE) - جامعة إيلتي إيتفوش لوراند
- Budapest University of Technology and Economics - جامعة بودابست للتكنولوجيا والاقتصاد
- University of Pécs - جامعة بيتش
- University of Szeged - جامعة سيجد
- ... and 4 more

### 🇦🇪 United Arab Emirates (2 universities)

**Universities:**
- American University of Ras Al Khaimah - الجامعة الأمريكية في رأس الخيمة
- RAK Medical & Health Sciences University - جامعة رأس الخيمة للطب والعلوم الصحية

### 🇨🇾 Cyprus (6 universities)

**Universities:**
- Near East University - جامعة الشرق الادنى
- CYPRUS INTERNATIONAL UNIVERSITY - جامعة قبرص الدولية
- CIU University - جامعة CIU
- KYRENIA ÜNİVERSİTESİ - جامعة كيرينيا
- ... and 2 more

---

## 🔧 Management & Updates

### Add New University

```javascript
// In MongoDB shell or Compass
use egec_crm;

db.universities.insertOne({
  name: "New University",
  arabicName: "الجامعة الجديدة",
  country: "Egypt",
  colleges: [],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Update University

```javascript
db.universities.updateOne(
  { name: "Cairo University" },
  {
    $set: {
      colleges: [
        { name: "Faculty of Engineering", arabicName: "كلية الهندسة" },
        { name: "Faculty of Medicine", arabicName: "كلية الطب" }
      ],
      updatedAt: new Date()
    }
  }
);
```

### Delete University

```javascript
db.universities.deleteOne({
  name: "University Name"
});
```

### Re-seed All Universities

```bash
# This will clear all and re-insert
npm run seed:universities
```

---

## 📊 Database Schema

### University Document
```javascript
{
  _id: ObjectId("..."),
  name: "Cairo University",           // English name
  arabicName: "جامعة القاهرة",        // Arabic name
  country: "Egypt",                    // Country name (English)
  colleges: [                          // Array of colleges
    {
      name: "Faculty of Engineering",
      arabicName: "كلية الهندسة"
    },
    {
      name: "Faculty of Medicine",
      arabicName: "كلية الطب"
    }
  ],
  createdAt: ISODate("2026-01-08..."),
  updatedAt: ISODate("2026-01-08...")
}
```

### Indexes
```javascript
// Performance indexes
{ country: 1 }           // For country filtering
{ name: 1 }              // For name searching
{ arabicName: 1 }        // For Arabic name searching
{ name: "text", arabicName: "text" }  // Full-text search
```

---

## 🧪 Testing

### Test 1: Study Destination → University Cascade
```
1. Login to CRM
2. Create new customer
3. Go to "Desired Program" section
4. Select Study Destination: "مصر" (Egypt)
5. Watch Desired University dropdown
   ✅ Should populate with 90 Egyptian universities
6. Select a university
   ✅ Should be saved to customer record
```

### Test 2: Change Study Destination
```
1. While creating customer
2. Select Study Destination: "مصر" (Egypt)
3. Select a university: "Cairo University"
4. Change Study Destination to "الأردن" (Jordan)
5. Check Desired University dropdown
   ✅ Should reset and show 45 Jordanian universities
   ✅ Previous selection should be cleared
```

### Test 3: Search Universities
```
1. In Create Customer form
2. Select Study Destination: "Egypt"
3. Open Desired University dropdown
4. Type "cairo" in search (if searchable)
   ✅ Should filter to Cairo-related universities
```

### Test 4: Edit Customer
```
1. Edit existing customer
2. Change Study Destination
   ✅ Cascade should work in edit form too
   ✅ Previous university cleared when country changes
```

---

## 🔍 Troubleshooting

### Issue 1: Universities not showing
**Symptoms:** Dropdown empty after selecting country  
**Solution:**
```bash
# Check if universities exist
mongo YOUR_DB_URI
> use egec_crm
> db.universities.countDocuments()
# Should return 153

# If 0, run:
npm run seed:universities
```

### Issue 2: Wrong universities showing
**Symptoms:** Egyptian universities showing for Jordan  
**Solution:**
```bash
# Check API response
curl http://localhost:3000/api/crm/universities?country=Egypt

# Verify country names match exactly (case-sensitive)
# Database: "Egypt" not "egypt" or "EGYPT"
```

### Issue 3: Cascade not working
**Symptoms:** Dropdown doesn't update when country changes  
**Solution:**
- Check browser console for errors
- Verify API endpoint is reachable
- Check if session is valid
- Verify `useEffect` dependencies in frontend

### Issue 4: Duplicate universities
**Symptoms:** Same university appears multiple times  
**Solution:**
```bash
# Re-seed to clean duplicates
npm run seed:universities
```

---

## 📈 Future Enhancements

### 1. Add Colleges
Currently colleges array is empty. To add:
```bash
# Create a new script: scripts/seedColleges.js
# Add colleges for each university
# Run: npm run seed:colleges
```

### 2. Add Programs/Specializations
```bash
# Each college can have programs
# e.g., Faculty of Engineering → Computer Science, Mechanical, etc.
```

### 3. Search & Filter
```javascript
// Add text search in universities
// Filter by: public/private, ranking, etc.
```

### 4. University Details
```javascript
// Add: website, location, ranking, tuition fees, etc.
{
  name: "Cairo University",
  website: "https://cu.edu.eg",
  location: "Cairo, Egypt",
  type: "Public",
  ranking: 1,
  tuitionFees: "Low"
}
```

---

## 📚 Related Documentation

- [CASCADING_IMPLEMENTATION_SUMMARY.md](./CASCADING_IMPLEMENTATION_SUMMARY.md) - Original cascade implementation
- [FINAL_DEPLOYMENT_REPORT.md](./FINAL_DEPLOYMENT_REPORT.md) - Deployment guide
- [PERMISSIONS_FINAL_GUIDE.md](./PERMISSIONS_FINAL_GUIDE.md) - Permissions system

---

## ✅ Checklist

### Setup
- [ ] Run `npm run seed:destinations`
- [ ] Run `npm run seed:universities`
- [ ] Verify in database (153 universities)
- [ ] Test cascading in create form
- [ ] Test cascading in edit form

### Production
- [ ] Run scripts on production database
- [ ] Verify all 6 countries visible
- [ ] Test with real users
- [ ] Monitor API performance
- [ ] Backup universities data

---

## 🎉 Success Criteria

**System is working if:**
- ✅ 6 countries available in Study Destination
- ✅ 153 universities in database
- ✅ Cascade works: Country → Universities
- ✅ Universities filtered by selected country
- ✅ Works in both create and edit forms
- ✅ Data saved correctly to customer record

---

**Status:** 🟢 Ready to Use  
**Last Updated:** January 8, 2026  
**Total Universities:** 153  
**Total Countries:** 6
