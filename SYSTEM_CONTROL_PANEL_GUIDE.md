# 🎛️ System Control Panel - Complete Guide

**Created:** January 8, 2026  
**Access Level:** 🔴 **Superadmin Only**  
**URL:** `/crm/system-control`

---

## 📋 Overview

The System Control Panel is a comprehensive interface for managing all dropdown lists and system settings in the CRM. It provides full CRUD (Create, Read, Update, Delete) operations for all system configurations.

---

## 🎯 Features

### ✅ **Complete CRUD Operations**
- ✅ **Create** new dropdown lists
- ✅ **Read** all existing settings
- ✅ **Update** dropdown values
- ✅ **Delete** unused settings
- ✅ **Toggle** active/inactive status
- ✅ **Reorder** dropdown items (drag up/down)

### ✅ **User-Friendly Interface**
- ✅ Search functionality
- ✅ Statistics dashboard
- ✅ Inline editing
- ✅ Real-time updates
- ✅ Confirmation dialogs
- ✅ Audit logging

---

## 🔐 Access Control

### Who Can Access?
- ✅ **Superadmin ONLY**
- ❌ Admin (cannot access)
- ❌ Super Agent (cannot access)
- ❌ Agent (cannot access)
- ❌ Data Entry (cannot access)

### Security Features:
- ✅ Role-based access control
- ✅ API endpoint protection
- ✅ Audit logging for all changes
- ✅ Rate limiting
- ✅ Direct browser access blocked

---

## 📊 Available Dropdown Lists

### Customer Information:
1. **counselor_statuses** - Customer status options
2. **nationalities** - Customer nationalities
3. **countries** - Customer countries
4. **genders** - Gender options

### University & Education:
5. **study_destinations** - Study destination countries (ENGLISH)
6. **university_types** - University types (حكومية، أهلية، خاصة)
7. **study_times** - Study time options
8. **study_languages** - Study languages
9. **study_systems** - Study systems (سنوي، فصلي، etc.)
10. **academic_sectors** - Academic sectors

### Bachelor's Degree:
11. **certificate_tracks** - Certificate tracks
12. **available_colleges** - Available colleges
13. **overall_ratings** - Overall ratings

### Master's Degree:
14. **master_types** - Master program types
15. **study_methods** - Study methods (حضوري، عن بعد، etc.)

### PhD:
16. **research_fields** - Research fields

### Evaluation:
17. **interest_rates** - Interest rate options
18. **call_quality** - Call quality options
19. **educational_levels** - Educational level options

### Marketing:
20. **sources** - Lead sources
21. **companies** - Company list

---

## 🎨 User Interface

### Main Dashboard:
```
┌────────────────────────────────────────────────────┐
│  🎛️ System Control Panel                          │
│  Manage all dropdown lists and system settings    │
├────────────────────────────────────────────────────┤
│                                                    │
│  📊 Statistics:                                    │
│  ┌──────────┬──────────┬──────────┬──────────┐   │
│  │ Total: 21│ Active:20│ Inactive:1│ Dropdowns│   │
│  └──────────┴──────────┴──────────┴──────────┘   │
│                                                    │
│  🔍 Search: [________________]  [+ Add New]       │
│                                                    │
│  📋 Settings List:                                 │
│  ┌────────────────────────────────────────────┐   │
│  │ counselor_statuses          [Edit] [Delete]│   │
│  │ Customer status options                    │   │
│  │ 8 items | dropdown_options | Active        │   │
│  │ ┌────────────────────────────────────────┐ │   │
│  │ │ 1. جديد                                 │ │   │
│  │ │ 2. متابعة                              │ │   │
│  │ │ 3. مهتم                                │ │   │
│  │ └────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Edit Mode:
```
┌────────────────────────────────────────────────────┐
│  counselor_statuses                    [Save] [X]  │
│  Customer status options                           │
│  ┌────────────────────────────────────────────┐   │
│  │ Add new value: [____________] [+ Add]      │   │
│  ├────────────────────────────────────────────┤   │
│  │ [↑][↓] 1. [جديد____________] [Delete]      │   │
│  │ [↑][↓] 2. [متابعة___________] [Delete]     │   │
│  │ [↑][↓] 3. [مهتم____________] [Delete]      │   │
│  │ [↑][↓] 4. [غير مهتم_________] [Delete]     │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

## 🔧 How to Use

### 1. Access the Panel:
```
1. Login as Superadmin
2. Click "System Control" in sidebar
3. Or navigate to: /crm/system-control
```

### 2. View All Settings:
```
- All dropdown lists displayed
- Statistics at top
- Search bar for filtering
- Active/Inactive status visible
```

### 3. Edit a Setting:
```
1. Click [Edit] button
2. Inline editor appears
3. Add new values
4. Edit existing values
5. Reorder with ↑↓ buttons
6. Delete unwanted values
7. Click [Save] to apply
```

### 4. Create New Setting:
```
1. Click [+ Add New Setting]
2. Fill in form:
   - Setting Key (unique identifier)
   - Description
   - Type (dropdown_options, etc.)
   - Initial Values (comma-separated)
3. Click [Create Setting]
```

### 5. Delete a Setting:
```
1. Click [Delete] button
2. Confirm deletion
3. Setting removed from system
```

### 6. Toggle Active/Inactive:
```
1. Click toggle icon (🟢/⚪)
2. Setting enabled/disabled
3. Inactive settings hidden from users
```

---

## 🔄 API Endpoints

### GET All Settings:
```javascript
GET /api/crm/system-settings

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "settingKey": "counselor_statuses",
      "settingValue": ["جديد", "متابعة", ...],
      "settingType": "dropdown_options",
      "description": "Customer status options",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    ...
  ]
}
```

### GET Specific Setting:
```javascript
GET /api/crm/system-settings?key=counselor_statuses

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "settingKey": "counselor_statuses",
    "settingValue": ["جديد", "متابعة", ...],
    ...
  }
}
```

### CREATE New Setting:
```javascript
POST /api/crm/system-settings
Content-Type: application/json

{
  "settingKey": "new_dropdown",
  "settingValue": ["Option 1", "Option 2"],
  "settingType": "dropdown_options",
  "description": "New dropdown list"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Setting created successfully"
}
```

### UPDATE Setting:
```javascript
PUT /api/crm/system-settings/[id]
Content-Type: application/json

{
  "settingValue": ["Updated 1", "Updated 2"],
  "isActive": true
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### DELETE Setting:
```javascript
DELETE /api/crm/system-settings/[id]

Response:
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

---

## 🔒 Security Features

### 1. Role-Based Access:
```javascript
// Only superadmin can access
if (role !== 'superadmin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 2. Audit Logging:
```javascript
// All changes logged
await logAudit({
  userId,
  userName,
  action: 'UPDATE_SYSTEM_SETTING',
  resource: 'SystemSettings',
  details: {
    settingKey,
    oldValues,
    newValues
  }
});
```

### 3. Rate Limiting:
```javascript
// 100 requests per minute
withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
```

### 4. Direct Access Protection:
```javascript
// Blocks direct browser navigation
if (checkDirectAccess(req, res)) return;
```

---

## ⚠️ Important Notes

### 1. **study_destinations MUST be in ENGLISH**
```javascript
// ✅ CORRECT:
settingValue: ["Egypt", "Jordan", "Cyprus", ...]

// ❌ WRONG:
settingValue: ["مصر", "الأردن", "قبرص", ...]
```
**Reason:** Universities are stored with English country names

### 2. **Be Careful When Deleting**
- Deleting a setting affects all forms using it
- Check if setting is used before deleting
- Consider deactivating instead of deleting

### 3. **Maintain Consistency**
- Keep dropdown values consistent
- Use same format across similar settings
- Arabic for Arabic fields, English for English fields

### 4. **Cache Clearing**
- Changes clear system cache automatically
- Users may need to refresh page
- Cache expires after 5 minutes anyway

---

## 📝 Common Tasks

### Add New Counselor Status:
```
1. Search for "counselor_statuses"
2. Click [Edit]
3. Type new status in "Add new value"
4. Click [+ Add]
5. Reorder if needed with ↑↓
6. Click [Save]
```

### Add New Country:
```
1. Search for "countries"
2. Click [Edit]
3. Add new country name
4. Click [+ Add]
5. Click [Save]
```

### Create New Dropdown List:
```
1. Click [+ Add New Setting]
2. Setting Key: "my_new_dropdown"
3. Description: "My new dropdown list"
4. Type: dropdown_options
5. Initial Values: "Value 1, Value 2, Value 3"
6. Click [Create Setting]
```

### Deactivate Unused Setting:
```
1. Find the setting
2. Click toggle icon (🟢)
3. Setting becomes inactive (⚪)
4. Hidden from users but not deleted
```

---

## 🐛 Troubleshooting

### Issue: Changes not appearing
**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Cache expires in 5 minutes

### Issue: Cannot delete setting
**Solution:**
- Check if setting is used in forms
- Deactivate instead of deleting
- Contact developer if critical

### Issue: Dropdown not showing in forms
**Solution:**
- Check if setting is Active
- Verify settingKey matches form code
- Check settingType is "dropdown_options"

---

## 📊 Statistics Explained

### Total Settings:
- Count of all settings in system
- Includes active and inactive

### Active:
- Settings currently in use
- Visible to users in forms

### Inactive:
- Settings disabled
- Hidden from users
- Can be reactivated

### Dropdown Options:
- Count of dropdown_options type
- Most common type in system

---

## 🎯 Best Practices

### 1. **Naming Convention:**
```
✅ Good: counselor_statuses, study_destinations
❌ Bad: CounselorStatuses, studyDestinations
```

### 2. **Descriptions:**
```
✅ Good: "Customer status options"
❌ Bad: "statuses" or empty
```

### 3. **Value Format:**
```
✅ Consistent: ["جديد", "متابعة", "مهتم"]
❌ Mixed: ["جديد", "Follow up", "interested"]
```

### 4. **Before Deleting:**
```
1. Check usage in forms
2. Verify with team
3. Consider deactivating first
4. Document reason for deletion
```

---

## 📚 Related Files

### Frontend:
- `pages/crm/system-control.js` - Control panel UI

### Backend:
- `pages/api/crm/system-settings/index.js` - GET all, CREATE
- `pages/api/crm/system-settings/[id].js` - GET one, UPDATE, DELETE

### Model:
- `models/SystemSetting.js` - Database schema

### Permissions:
- `lib/permissions.js` - Access control

---

## 🚀 Future Enhancements

### Planned Features:
- [ ] Bulk import/export
- [ ] Version history
- [ ] Rollback changes
- [ ] Setting dependencies
- [ ] Usage analytics
- [ ] Duplicate detection
- [ ] Validation rules
- [ ] Multi-language support

---

## ✅ Summary

**What is it?**
- Control panel for managing all dropdown lists

**Who can use it?**
- Superadmin only

**What can you do?**
- Create, Read, Update, Delete dropdown lists
- Toggle active/inactive
- Reorder items
- Search and filter

**Where to access?**
- Sidebar → "System Control"
- URL: `/crm/system-control`

**Security:**
- Role-based access
- Audit logging
- Rate limiting
- API protection

---

**Status:** ✅ **PRODUCTION READY**  
**Last Updated:** January 8, 2026
