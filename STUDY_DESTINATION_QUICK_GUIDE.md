# 🚀 Study Destination - Quick Start Guide

**Updated:** January 8, 2026

---

## ✅ What Changed?

The **Study Destination (الوجهة الدراسية)** field has been **moved** from:
- ❌ **Before:** Marketing Data section
- ✅ **After:** Desired Program section

---

## 🎯 Why This Change?

1. **Logical Flow:** Study Destination directly relates to the desired university selection
2. **Cascading Dropdowns:** Study Destination → University → College
3. **Better UX:** Clear progression in the Desired Program section
4. **Data Integrity:** Desired Program data stays together

---

## 🔧 Setup Instructions

### Step 1: Seed Universities (if not done)

```bash
npm run seed:universities
```

This will add **153 universities** from **6 countries**:
- Egypt: 88 universities
- Jordan: 44 universities
- Germany: 12 universities
- Hungary: 6 universities
- United Arab Emirates: 2 universities
- Cyprus: 5 universities

### Step 2: Update Study Destinations

```bash
npm run seed:destinations
```

This will update system settings with the list of available study destinations (Arabic names).

### Step 3: Verify Configuration

```bash
npm run verify:destinations
```

This will:
- Check if study destinations are configured
- Verify mapping between Arabic names and English country names
- Count universities per country
- Identify any missing mappings

### Step 4: Start Development Server

```bash
npm run dev
```

---

## 📊 How It Works

### 1. User Flow (Create Customer)

```
Step 1: Select Degree Type (Bachelor/Master/PhD)
   ↓
Step 2: Fill Basic Data
   ↓
Step 3: Fill Current Qualification
   ↓
Step 4: Fill Desired Program
   ├─→ Select Study Destination (e.g., "مصر", "ألمانيا")
   ├─→ Select University (filtered by destination)
   └─→ Select College (filtered by university)
```

### 2. Technical Flow

```
Frontend (pages/crm/customers/create.js)
   ↓
   User selects: formData.desiredProgram.studyDestination = "مصر"
   ↓
   useEffect triggers
   ↓
   API Call: GET /api/crm/universities?country=مصر
   ↓
   Backend (pages/api/crm/universities.js)
   ↓
   Map: "مصر" → "Egypt"
   ↓
   Database Query: University.find({ country: "Egypt" })
   ↓
   Return: [{ value: "uni_id", label: "Cairo University" }, ...]
   ↓
   Frontend: Populate University dropdown
```

---

## 🌍 Study Destination Mapping

| Arabic (UI) | English (DB) | Universities |
|------------|--------------|--------------|
| مصر | Egypt | 88 |
| الأردن | Jordan | 44 |
| ألمانيا | Germany | 12 |
| هنغاريا | Hungary | 6 |
| الإمارات | United Arab Emirates | 2 |
| قبرص | Cyprus | 5 |

**Total:** 157 universities

---

## 🧪 Testing

### Test Case 1: Create Customer with Egypt Universities

1. Go to: `/crm/customers/create`
2. Select Degree Type: "Bachelor"
3. Fill Basic Data
4. Go to "Desired Program" section
5. Select Study Destination: "مصر"
6. ✅ Verify: University dropdown should show 88 Egyptian universities
7. Select a university
8. ✅ Verify: College dropdown should show colleges for that university

### Test Case 2: Create Customer with Germany Universities

1. Go to: `/crm/customers/create`
2. Select Study Destination: "ألمانيا"
3. ✅ Verify: University dropdown should show 12 German universities

### Test Case 3: Edit Existing Customer

1. Go to: `/crm/customers/[id]/edit`
2. ✅ Verify: Study Destination is in "Desired Program" section
3. Change Study Destination
4. ✅ Verify: University dropdown updates
5. Save changes
6. ✅ Verify: Data is saved correctly

### Test Case 4: View Customer Profile

1. Go to: `/crm/customers/[id]`
2. Click "Desired Program" tab
3. ✅ Verify: Study Destination is displayed

---

## 🔍 Troubleshooting

### Problem 1: University Dropdown is Empty

**Symptoms:**
- Study Destination is selected
- University dropdown shows "No universities available"

**Solution:**
```bash
# 1. Check if universities are seeded
npm run verify:destinations

# 2. If not, seed them
npm run seed:universities

# 3. Verify again
npm run verify:destinations
```

### Problem 2: Study Destination Not Showing

**Symptoms:**
- Create/Edit form doesn't show Study Destination in Desired Program

**Solution:**
1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Check browser console for errors

### Problem 3: Mapping Not Working

**Symptoms:**
- Select "مصر" but get no universities
- API returns empty array

**Solution:**
1. Check the mapping in `pages/api/crm/universities.js`
2. Verify the mapping: "مصر" → "Egypt"
3. Check database: Universities should have `country: "Egypt"` (English)
4. Run verification: `npm run verify:destinations`

---

## 📝 API Documentation

### GET /api/crm/universities

**Description:** Fetch universities for cascading dropdowns

**Authentication:** Session-based (internal API)

**Parameters:**
- `country` (optional): Study destination in Arabic (e.g., "مصر") or English (e.g., "Egypt")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "507f1f77bcf86cd799439011",
      "label": "Cairo University",
      "country": "Egypt"
    },
    ...
  ]
}
```

**Example Requests:**
```javascript
// Arabic (from UI)
fetch('/api/crm/universities?country=مصر')

// English (also works)
fetch('/api/crm/universities?country=Egypt')

// All universities
fetch('/api/crm/universities')
```

---

## 🛠️ For Developers

### Adding New Countries

1. Add universities to database (or seed script)
2. Add mapping in `pages/api/crm/universities.js`:
```javascript
const DESTINATION_COUNTRY_MAP = {
  'مصر': 'Egypt',
  'الأردن': 'Jordan',
  // Add new country here
  'اسم الدولة بالعربي': 'Country Name in English',
  ...
};
```

3. Update `scripts/updateStudyDestinations.js` to include the Arabic name
4. Run: `npm run seed:destinations`
5. Verify: `npm run verify:destinations`

### Cache Management

Universities are cached for **1 hour** per country:
- Cache key: `universities:country:{country}`
- TTL: 3600 seconds

To clear cache (if using Redis):
```bash
redis-cli FLUSHDB
```

Or restart the application (in-memory cache will be cleared).

---

## ✅ Checklist Before Going Live

- [ ] Universities seeded: `npm run seed:universities`
- [ ] Study destinations updated: `npm run seed:destinations`
- [ ] Verification passed: `npm run verify:destinations`
- [ ] Tested creating a customer with Egypt universities
- [ ] Tested creating a customer with Germany universities
- [ ] Tested editing an existing customer
- [ ] Tested cascading: Study Destination → University → College
- [ ] Tested on different browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsive design tested
- [ ] API endpoints tested with Postman/curl
- [ ] Linter passed: `npm run lint`
- [ ] Build successful: `npm run build`

---

## 📞 Support

If you encounter issues:

1. **Check logs:** Browser console and server terminal
2. **Verify data:** Run `npm run verify:destinations`
3. **Check documentation:** `STUDY_DESTINATION_MIGRATION_COMPLETE.md`
4. **Database connection:** Ensure MongoDB is accessible
5. **Environment variables:** Check `.env.local` file

---

**Status:** ✅ Ready for Production  
**Last Updated:** January 8, 2026
