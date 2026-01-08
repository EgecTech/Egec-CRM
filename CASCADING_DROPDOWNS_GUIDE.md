# 🔗 Cascading Dropdowns Implementation Guide

## Overview

This guide explains the **session-based cascading dropdowns** implementation for the internal CRM customer creation form. The feature provides dependent dropdowns for:
- **Study Destination** → **Desired University** → **Desired College**

## Key Features

✅ **Session-authenticated** - Uses NextAuth session, no external API token required
✅ **Cascading behavior** - Each dropdown depends on the previous selection
✅ **Automatic reset** - Dependent fields reset when parent selection changes
✅ **Loading states** - Disabled states show clear user feedback
✅ **Caching** - 1-hour TTL for improved performance
✅ **Error handling** - Graceful fallbacks for network issues

---

## Architecture

### 1. Internal API Endpoints

#### `/api/crm/universities`
**Purpose**: Fetch universities filtered by country
**Authentication**: Session-based (NextAuth)
**Parameters**: 
- `country` (query param, optional) - Filter universities by country

**Response**:
```json
{
  "success": true,
  "data": [
    { "value": "64a1b2c3d4e5f6g7h8i9j0k1", "label": "Cairo University", "country": "مصر" },
    { "value": "64a1b2c3d4e5f6g7h8i9j0k2", "label": "Ain Shams University", "country": "مصر" }
  ]
}
```

**Cache Key**: `universities:country:{countryName}` or `universities:all`
**TTL**: 3600 seconds (1 hour)

---

#### `/api/crm/universities/[id]/colleges`
**Purpose**: Fetch colleges for a specific university
**Authentication**: Session-based (NextAuth)
**Parameters**: 
- `id` (route param, required) - University ObjectId

**Response**:
```json
{
  "success": true,
  "data": [
    { "value": "64b1c2d3e4f5g6h7i8j9k0l1", "label": "Faculty of Engineering" },
    { "value": "64b1c2d3e4f5g6h7i8j9k0l2", "label": "Faculty of Medicine" }
  ]
}
```

**Cache Key**: `colleges:university:{universityId}`
**TTL**: 3600 seconds (1 hour)

---

### 2. Frontend Implementation

#### State Management

```javascript
// Dropdown data
const [universities, setUniversities] = useState([]);
const [colleges, setColleges] = useState([]);

// Selected values stored in formData
formData.marketingData.studyDestination  // String (country name)
formData.desiredProgram.desiredUniversity  // String (university name)
formData.desiredProgram.desiredUniversityId  // String (ObjectId)
formData.desiredProgram.desiredCollege  // String (college name)
formData.desiredProgram.desiredCollegeId  // String (ObjectId)
```

#### Data Flow

```
User selects Study Destination
    ↓
useEffect triggers → Fetch universities for that country
    ↓
Universities populate dropdown
    ↓
User selects University
    ↓
useEffect triggers → Fetch colleges for that university
    ↓
Colleges populate dropdown
    ↓
User selects College
    ↓
Form data ready for submission (with IDs and names)
```

---

### 3. Cascading Logic

#### useEffect #1: Fetch Universities
```javascript
useEffect(() => {
  if (!formData.marketingData.studyDestination) {
    setUniversities([]);
    setColleges([]);
    return;
  }

  fetch(`/api/crm/universities?country=${encodeURIComponent(studyDestination)}`)
    .then(res => res.json())
    .then(data => setUniversities(data.data));
}, [formData.marketingData.studyDestination]);
```

#### useEffect #2: Fetch Colleges
```javascript
useEffect(() => {
  if (!formData.desiredProgram.desiredUniversityId) {
    setColleges([]);
    return;
  }

  fetch(`/api/crm/universities/${desiredUniversityId}/colleges`)
    .then(res => res.json())
    .then(data => setColleges(data.data));
}, [formData.desiredProgram.desiredUniversityId]);
```

#### Reset Cascading Fields
```javascript
// When Study Destination changes
onChange={(e) => {
  handleInputChange("marketingData", "studyDestination", e.target.value);
  // Reset downstream fields
  setFormData(prev => ({
    ...prev,
    desiredProgram: {
      ...prev.desiredProgram,
      desiredUniversity: "",
      desiredUniversityId: null,
      desiredCollege: "",
      desiredCollegeId: null,
    }
  }));
}}

// When University changes
onChange={(e) => {
  // Update university
  // Reset college only
  setFormData(prev => ({
    ...prev,
    desiredProgram: {
      ...prev.desiredProgram,
      desiredUniversityId: e.target.value,
      desiredUniversity: selectedUni.label,
      desiredCollege: "",
      desiredCollegeId: null,
    }
  }));
}}
```

---

## User Experience

### Visual States

1. **Study Destination**
   - Always enabled
   - Default value: "مصر"

2. **Desired University**
   - Disabled if no Study Destination selected
   - Shows "Select Study Destination First" when disabled
   - Shows "No universities available" if API returns empty array
   - Shows "Select University" when ready

3. **Desired College**
   - Disabled if no University selected
   - Shows "Select University First" when disabled
   - Shows "No colleges available" if API returns empty array
   - Shows "Select College" when ready

---

## Testing Checklist

### ✅ Basic Flow
- [ ] Select Study Destination → Universities load
- [ ] Select University → Colleges load
- [ ] Select College → All data saved correctly

### ✅ Reset Behavior
- [ ] Change Study Destination → University and College reset
- [ ] Change University → College resets

### ✅ Edge Cases
- [ ] No universities for selected country → Shows "No universities available"
- [ ] No colleges for selected university → Shows "No colleges available"
- [ ] Network error → Dropdown shows empty state gracefully

### ✅ Data Integrity
- [ ] Both `desiredUniversityId` and `desiredUniversity` (name) are saved
- [ ] Both `desiredCollegeId` and `desiredCollege` (name) are saved
- [ ] Form submission works correctly
- [ ] Customer record shows correct university and college names

---

## Common Issues & Solutions

### Issue: "No universities available" even though data exists
**Cause**: Study destination name mismatch between SystemSettings and University.country field
**Solution**: Ensure country names are consistent in both collections

### Issue: Colleges not loading
**Cause**: University ID not set correctly or network error
**Solution**: Check browser console for API errors, verify university ObjectId is valid

### Issue: Selected values disappear on page refresh
**Cause**: localStorage draft not saving IDs
**Solution**: Verify formData includes desiredUniversityId and desiredCollegeId fields

---

## Data Model

### Customer Model
```javascript
desiredProgram: {
  desiredUniversity: String,        // Display name
  desiredUniversityId: ObjectId,    // Reference ID
  desiredCollege: String,           // Display name
  desiredCollegeId: ObjectId,       // Reference ID
  // ... other fields
}
```

### University Model
```javascript
{
  _id: ObjectId,
  name: String,
  country: String,
  colleges: [
    {
      _id: ObjectId,
      name: String,
      // ... other college fields
    }
  ]
}
```

---

## Performance

- **Caching**: 1-hour TTL reduces database queries
- **Debouncing**: Not needed (user selection triggers fetch, not typing)
- **Lazy Loading**: Universities/colleges only loaded when needed
- **Network**: Typical response time < 200ms (with cache hit)

---

## Future Enhancements

1. **Search/Autocomplete**: For large lists (100+ universities)
2. **Specialization Cascade**: Add `Desired Specialization` as 4th level
3. **Edit Form**: Implement same logic in `pages/crm/customers/[id]/edit.js`
4. **Filters Page**: Add to customer list filters
5. **Analytics**: Track most selected universities/colleges

---

## Related Files

- `pages/api/crm/universities.js` - Universities API
- `pages/api/crm/universities/[id]/colleges.js` - Colleges API
- `pages/crm/customers/create.js` - Customer creation form
- `models/University.js` - University data model
- `models/Customer.js` - Customer data model
- `lib/cache.js` - Caching utilities

---

## Support

For issues or questions:
1. Check browser console for API errors
2. Verify session authentication is working
3. Check database for university/college data
4. Review cache keys in Redis/memory

---

**Last Updated**: January 2026
**Version**: 1.0.0
