# 🎓 مرجع سريع: الدرجات الثلاثة في نظام CRM

## 📚 الدرجات الثلاثة المتاحة

بعد حذف "Diploma"، يدعم النظام الآن **3 درجات علمية فقط**:

---

## 1️⃣ بكالوريوس (Bachelor)

### المعلومات الأساسية
- **Variable Name**: `bachelor`
- **Value in degreeType field**: `'bachelor'`
- **Label (Arabic)**: بكالوريوس
- **Label (English)**: Bachelor
- **Color Theme**: Blue (أزرق)

### الحقول في قاعدة البيانات
```javascript
{
  degreeType: 'bachelor',
  currentQualification: {
    // حقول مشتركة
    grade: String,              // المعدل
    overallRating: String,      // التقدير
    studySystem: String,        // نظام الدراسة
    graduationYear: Number,     // سنة التخرج
    counselorNotes: String,     // ملاحظات المرشد
    
    // حقول خاصة بالبكالوريوس
    bachelor: {
      certificateTrack: String  // المسار (علمي، أدبي)
    }
  }
}
```

### متى يُستخدم؟
- للطلاب الذين يرغبون في الالتحاق ببرنامج بكالوريوس
- الطلاب الحاصلون على الثانوية العامة أو ما يعادلها

---

## 2️⃣ ماجستير (Master)

### المعلومات الأساسية
- **Variable Name**: `master`
- **Value in degreeType field**: `'master'`
- **Label (Arabic)**: ماجستير
- **Label (English)**: Master
- **Color Theme**: Purple (بنفسجي)

### الحقول في قاعدة البيانات
```javascript
{
  degreeType: 'master',
  currentQualification: {
    // ⚠️ لا توجد حقول مشتركة في الأعلى لـ Master
    counselorNotes: String,     // ملاحظات المرشد فقط
    
    // معلومات شهادة البكالوريوس السابقة
    masterSeeker: {
      bachelorSpecialization: String,    // تخصص البكالوريوس
      bachelorCollege: String,           // كلية البكالوريوس
      bachelorUniversity: String,        // جامعة البكالوريوس
      bachelorCountry: String,           // دولة شهادة البكالوريوس
      bachelorGraduationYear: Number,    // سنة الحصول على البكالوريوس
      bachelorGPA: String                // المعدل
    }
  }
}
```

### متى يُستخدم؟
- للطلاب الحاصلين على شهادة بكالوريوس ويرغبون في دراسة الماجستير
- يجب إدخال معلومات شهادة البكالوريوس الحاصل عليها الطالب

---

## 3️⃣ دكتوراه (PhD)

### المعلومات الأساسية
- **Variable Name**: `phd`
- **Value in degreeType field**: `'phd'`
- **Label (Arabic)**: دكتوراه
- **Label (English)**: PhD / Doctorate
- **Color Theme**: Green (أخضر)

### الحقول في قاعدة البيانات
```javascript
{
  degreeType: 'phd',
  currentQualification: {
    // ⚠️ لا توجد حقول مشتركة في الأعلى لـ PhD
    counselorNotes: String,     // ملاحظات المرشد فقط
    
    // معلومات شهادة البكالوريوس
    phdSeeker: {
      // بيانات البكالوريوس
      bachelorSpecialization: String,
      bachelorSpecializationSector: String,
      bachelorCollege: String,
      bachelorUniversity: String,
      bachelorCountry: String,
      bachelorGraduationYear: Number,
      bachelorStudySystem: String,
      bachelorGPA: String,
      bachelorRating: String,
      bachelorSemesters: String,
      
      // بيانات الماجستير
      masterSpecialization: String,
      masterSpecializationSector: String,
      masterCollege: String,
      masterUniversity: String,
      masterCountry: String,
      masterGraduationYear: Number,
      masterStudySystem: String,
      masterDegreeType: String,        // بحثي / مقررات دراسية / مختلط
      masterGPA: String,
      masterRating: String,
      masterThesisTitle: String,       // عنوان رسالة الماجستير
      masterStudyDuration: String      // مدة الدراسة
    }
  }
}
```

### متى يُستخدم؟
- للطلاب الحاصلين على شهادتي بكالوريوس وماجستير ويرغبون في دراسة الدكتوراه
- يجب إدخال معلومات كل من شهادة البكالوريوس والماجستير

### ⚠️ ملاحظة مهمة لـ PhD
عند اختيار "دكتوراه"، **لا تظهر** الحقول المشتركة التالية في الأعلى:
- ❌ Grade/GPA (المعدل)
- ❌ Overall Rating (التقدير)
- ❌ Study System (نظام الدراسة)
- ❌ Graduation Year (سنة التخرج)

**لماذا؟** لأن هذه الحقول موجودة بشكل مفصل داخل أقسام البكالوريوس والماجستير المخصصة.

---

## 🔄 المقارنة السريعة

| Feature | Bachelor | Master | PhD |
|---------|----------|--------|-----|
| **الحقول المشتركة** | ✅ نعم | ❌ لا | ❌ لا |
| **معلومات بكالوريوس سابق** | ❌ | ✅ نعم | ✅ نعم |
| **معلومات ماجستير سابق** | ❌ | ❌ | ✅ نعم |
| **اللون في UI** | 🔵 Blue | 🟣 Purple | 🟢 Green |
| **عدد الأقسام** | 1 | 2 | 3 |

---

## 📝 كيفية الاستخدام في الكود

### 1. التحقق من نوع الدرجة
```javascript
if (customer.degreeType === 'bachelor') {
  // معالجة البكالوريوس
}

if (customer.degreeType === 'master') {
  // معالجة الماجستير
}

if (customer.degreeType === 'phd') {
  // معالجة الدكتوراه
}
```

### 2. الوصول للحقول
```javascript
// Bachelor
const track = customer.currentQualification?.bachelor?.certificateTrack;

// Master
const bachelorUni = customer.currentQualification?.masterSeeker?.bachelorUniversity;

// PhD
const bachelorSpec = customer.currentQualification?.phdSeeker?.bachelorSpecialization;
const masterThesis = customer.currentQualification?.phdSeeker?.masterThesisTitle;
```

### 3. عرض الحقول في UI (Conditional Rendering)
```javascript
{/* الحقول المشتركة - فقط لـ Bachelor فقط */}
{customer.degreeType === 'bachelor' && (
  <div>
    <input name="grade" />
    <input name="overallRating" />
    <input name="studySystem" />
    <input name="graduationYear" />
  </div>
)}

{/* حقول Bachelor الخاصة */}
{customer.degreeType === 'bachelor' && (
  <input name="certificateTrack" />
)}

{/* حقول Master الخاصة */}
{customer.degreeType === 'master' && (
  <div>
    <h3>معلومات شهادة البكالوريوس</h3>
    <input name="bachelorSpecialization" />
    {/* ... */}
  </div>
)}

{/* حقول PhD الخاصة */}
{customer.degreeType === 'phd' && (
  <>
    <div>
      <h3>بيانات البكالوريوس</h3>
      {/* حقول البكالوريوس */}
    </div>
    <div>
      <h3>بيانات الماجستير</h3>
      {/* حقول الماجستير */}
    </div>
  </>
)}
```

---

## ✅ التحقق من صحة البيانات

### Bachelor
```javascript
// مطلوب
- degreeType === 'bachelor'
- grade (optional but recommended)
- overallRating (optional)
- studySystem (optional)
- graduationYear (optional)

// اختياري
- certificateTrack
```

### Master
```javascript
// مطلوب
- degreeType === 'master'
- bachelorSpecialization (recommended)
- bachelorUniversity (recommended)
- bachelorCountry (recommended)
- bachelorGraduationYear (recommended)
```

### PhD
```javascript
// مطلوب
- degreeType === 'phd'

// موصى به بشدة (Bachelor info)
- bachelorSpecialization
- bachelorUniversity
- bachelorCountry
- bachelorGraduationYear

// موصى به بشدة (Master info)
- masterSpecialization
- masterUniversity
- masterCountry
- masterGraduationYear
- masterThesisTitle
```

---

## 🎯 الخلاصة

### المتغيرات الأساسية
```javascript
// في Customer Model
degreeType: {
  type: String,
  enum: ['bachelor', 'master', 'phd'],  // 3 خيارات فقط
  required: true
}
```

### Labels للعرض
```javascript
const degreeLabels = {
  bachelor: { ar: 'بكالوريوس', en: 'Bachelor' },
  master: { ar: 'ماجستير', en: 'Master' },
  phd: { ar: 'دكتوراه', en: 'PhD' }
};
```

### Colors للـ UI
```javascript
const degreeColors = {
  bachelor: 'blue',
  master: 'purple',
  phd: 'green'
};
```

---

## 📄 الصفحات المحدّثة

✅ **Create Page** (`pages/crm/customers/create.js`) - مكتمل  
✅ **Edit Page** (`pages/crm/customers/[id]/edit.js`) - مكتمل  
⚠️ **View Page** (`pages/crm/customers/[id].js`) - قد يحتاج تحديث للعرض  
✅ **Customer Model** (`models/Customer.js`) - مكتمل  
✅ **API Endpoints** - جاهزة

---

**آخر تحديث**: 8 يناير 2026  
**الحالة**: ✅ نظام الدرجات الثلاثة مكتمل وجاهز للاستخدام
