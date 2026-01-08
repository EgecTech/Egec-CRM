# 🔐 CRM Permissions System - Complete Guide & Testing

## 📋 Table of Contents
1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Permission Matrix](#permission-matrix)
4. [Implementation Details](#implementation-details)
5. [Testing Procedures](#testing-procedures)
6. [Security Fixes Applied](#security-fixes-applied)

---

## 🎯 Overview

The CRM system implements a comprehensive **Role-Based Access Control (RBAC)** system with 4 main roles and 3 legacy agent roles. All permissions are enforced at both **backend (API)** and **frontend (UI)** levels.

### Key Features:
- ✅ **Multi-level permissions** (Superadmin → Admin → Agent → Data Entry)
- ✅ **Time-based restrictions** (Data Entry: 15-minute edit window)
- ✅ **Ownership-based access** (Users see only their data)
- ✅ **Assignment-based access** (Agents see only assigned customers)
- ✅ **Audit logging** for all actions
- ✅ **Frontend + Backend enforcement** (double security layer)

---

## 👥 User Roles

### 1️⃣ **Superadmin** (المدير العام)
**Power Level**: ⭐⭐⭐⭐⭐ (Highest)

**Permissions:**
- ✅ View ALL customers (no restrictions)
- ✅ Create new customers
- ✅ Edit ANY customer (no restrictions)
- ✅ Delete customers (soft delete)
- ✅ Assign customers to agents
- ✅ Export all data
- ✅ Import data
- ✅ Manage users (create/edit/delete, including other superadmins)
- ✅ View audit logs
- ✅ Manage system settings
- ✅ View all reports

**Use Case:** System owner, full control

---

### 2️⃣ **Admin** (المدير)
**Power Level**: ⭐⭐⭐⭐

**Permissions:**
- ✅ View ALL customers (no restrictions)
- ✅ Create new customers
- ✅ Edit ANY customer (no restrictions)
- ❌ Cannot delete customers
- ✅ Assign customers to agents
- ✅ Export all data
- ✅ Import data
- ✅ Manage users (create/edit, but CANNOT create superadmin)
- ❌ Cannot view audit logs
- ✅ View system settings (read-only)
- ✅ View all reports

**Differences from Superadmin:**
- Cannot delete customers
- Cannot create superadmin users
- Cannot edit superadmin users
- Cannot view audit logs

**Use Case:** Department manager, operations manager

---

### 3️⃣ **Agent** (الوكيل/المستشار)
**Power Level**: ⭐⭐⭐

**Permissions:**
- ✅ View ONLY **assigned** customers
- ❌ Cannot create customers (assigned by admin)
- ✅ Edit ONLY **assigned** customers
- ❌ Cannot delete customers
- ❌ Cannot assign customers
- ❌ Cannot export data
- ❌ Cannot import data
- ❌ Cannot manage users
- ✅ Create follow-ups for assigned customers
- ✅ Edit own follow-ups
- ✅ View own reports

**Legacy Agent Roles (same permissions):**
- `egecagent` - EGEC Agent
- `studyagent` - Study Agent
- `edugateagent` - EduGate Agent

**Use Case:** Sales agent, counselor, customer service

---

### 4️⃣ **Data Entry** (إدخال البيانات)
**Power Level**: ⭐⭐

**Permissions:**
- ✅ View ONLY **own created** customers
- ✅ Create new customers
- ✅ Edit **own customers** within **15 minutes** of creation
- ❌ Cannot edit after 15-minute window expires
- ❌ Cannot delete customers
- ❌ Cannot assign customers
- ❌ Cannot export data (except own reports)
- ❌ Cannot import data
- ❌ Cannot manage users
- ❌ Cannot create follow-ups
- ✅ View own reports

**Special Rule: 15-Minute Edit Window**
- ⏱️ Can edit customer for **15 minutes** after creation
- 🔒 After 15 minutes, **cannot edit** (must contact supervisor)
- ⚠️ UI shows countdown timer

**Use Case:** Data entry operator, initial customer registration

---

## 📊 Permission Matrix

### Customers Module

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View All Customers** | ✅ | ✅ | ❌ | ❌ |
| **View Assigned Customers** | ✅ | ✅ | ✅ | ❌ |
| **View Own Customers** | ✅ | ✅ | ❌ | ✅ |
| **Create Customer** | ✅ | ✅ | ❌ | ✅ |
| **Edit Any Customer** | ✅ | ✅ | ❌ | ❌ |
| **Edit Assigned Customer** | ✅ | ✅ | ✅ | ❌ |
| **Edit Own Customer (15min)** | ✅ | ✅ | ❌ | ✅ |
| **Edit Own Customer (>15min)** | ✅ | ✅ | ❌ | ❌ |
| **Delete Customer** | ✅ | ❌ | ❌ | ❌ |
| **Assign Customer to Agent** | ✅ | ✅ | ❌ | ❌ |
| **Export All Customers** | ✅ | ✅ | ❌ | ❌ |
| **Import Customers** | ✅ | ✅ | ❌ | ❌ |

### Users Module

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View Users** | ✅ | ✅ | ❌ | ❌ |
| **Create User** | ✅ | ✅ * | ❌ | ❌ |
| **Edit User** | ✅ | ✅ * | ❌ | ❌ |
| **Delete User** | ✅ | ❌ | ❌ | ❌ |
| **Edit Superadmin** | ✅ | ❌ | ❌ | ❌ |
| **Create Superadmin** | ✅ | ❌ | ❌ | ❌ |

\* Admin can create/edit users but cannot create or edit superadmin users

### Follow-ups Module

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View All Follow-ups** | ✅ | ✅ | ❌ | ❌ |
| **View Own Follow-ups** | ✅ | ✅ | ✅ | ❌ |
| **Create Follow-up** | ✅ | ✅ | ✅ | ❌ |
| **Edit Any Follow-up** | ✅ | ✅ | ❌ | ❌ |
| **Edit Own Follow-up** | ✅ | ✅ | ✅ | ❌ |
| **Delete Follow-up** | ✅ | ✅ | ❌ | ❌ |

### Reports & Analytics

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View All Reports** | ✅ | ✅ | ❌ | ❌ |
| **View Own Reports** | ✅ | ✅ | ✅ | ✅ |
| **Export Reports** | ✅ | ✅ | ❌ | ❌ |

### System Settings

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View Settings** | ✅ | ✅ (read-only) | ❌ | ❌ |
| **Edit Settings** | ✅ | ❌ | ❌ | ❌ |

### Audit Logs

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|-----------|
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ |
| **Export Audit Logs** | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 Implementation Details

### Backend Implementation (`lib/permissions.js`)

#### Key Functions:

1. **`checkPermission(role, resource, action)`**
   - Checks if a role has a specific permission
   - Returns: `boolean`
   ```javascript
   checkPermission('admin', 'customers', 'create') // true
   checkPermission('agent', 'customers', 'create') // false
   ```

2. **`canViewCustomer(role, userId, customer)`**
   - Checks if user can view a specific customer
   - Considers role and ownership/assignment
   - Returns: `boolean`

3. **`canEditCustomer(role, userId, customer)`**
   - Checks if user can edit a specific customer
   - Considers role, ownership, assignment, and 15-min window for data entry
   - Returns: `boolean`

4. **`buildCustomerQuery(role, userId)`**
   - Builds MongoDB query to filter customers based on role
   - Returns: `object` (MongoDB query)
   ```javascript
   // For agent
   { isDeleted: false, 'assignment.assignedAgentId': userId }
   
   // For data entry
   { isDeleted: false, createdBy: userId }
   
   // For admin/superadmin
   { isDeleted: false }
   ```

5. **`getEditWindowRemaining(customer)`**
   - Calculates remaining edit time for data entry users
   - Returns: `{ canEdit: boolean, remainingMinutes: number, remainingSeconds: number }`

### API Endpoints Security

#### 1. **GET /api/crm/customers**
```javascript
// ✅ Uses buildCustomerQuery() to filter by role
const baseQuery = buildCustomerQuery(role, userId);
const customers = await Customer.find(baseQuery);
```

#### 2. **POST /api/crm/customers**
```javascript
// ✅ Checks create permission
if (!checkPermission(role, 'customers', 'create')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

#### 3. **GET /api/crm/customers/[id]**
```javascript
// ✅ Checks view permission
if (!canViewCustomer(role, userId, customer)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

#### 4. **PUT /api/crm/customers/[id]**
```javascript
// ✅ Checks edit permission
if (!canEditCustomer(role, userId, customer)) {
  if (role === 'dataentry') {
    // Check 15-minute window
    const minutesSinceCreation = (now - createdAt) / 1000 / 60;
    if (minutesSinceCreation > 15) {
      return res.status(403).json({ 
        error: 'Edit window expired',
        message: 'You can only edit customers within 15 minutes of creation'
      });
    }
  }
  return res.status(403).json({ error: 'Forbidden' });
}
```

#### 5. **DELETE /api/crm/customers/[id]**
```javascript
// ✅ Superadmin only
if (!checkPermission(role, 'customers', 'delete')) {
  return res.status(403).json({ error: 'Forbidden: Only superadmin can delete' });
}
```

### Frontend Implementation

#### Pages with Permission Checks:

1. **`/crm/customers/index.js`** (Customer List)
   - ✅ Only shows Create button to: Superadmin, Admin, Data Entry
   - ✅ Filters customers based on role (via API)

2. **`/crm/customers/create.js`** (Create Customer)
   - ✅ Accessible to: Superadmin, Admin, Data Entry
   - ✅ Hides "Assign Agent" section from Data Entry
   - ✅ Hides "Evaluation & Status" section from Data Entry

3. **`/crm/customers/[id].js`** (Customer Profile)
   - ✅ **NEW FIX**: Shows Edit button only if `canEdit()` returns true
   - ✅ **NEW FIX**: Shows edit window countdown for Data Entry users
   - ✅ **NEW FIX**: Shows warning when edit window expires

4. **`/crm/customers/[id]/edit.js`** (Edit Customer)
   - ✅ **NEW FIX**: Checks `canEditCustomer()` on page load
   - ✅ **NEW FIX**: Shows error message if no permission
   - ✅ **NEW FIX**: Shows edit window countdown for Data Entry users
   - ✅ Hides "Reassign Agent" section from non-admin users
   - ✅ Hides "Evaluation & Status" section from Data Entry

5. **`/crm/users/index.js`** (User Management)
   - ✅ Only accessible to: Superadmin, Admin
   - ✅ Disables edit/delete buttons for superadmin users (when logged in as admin)

6. **`/crm/dashboard.js`** (Dashboard)
   - ✅ Shows different stats based on role
   - ✅ Admin/Superadmin: All customers
   - ✅ Agent: Assigned customers only
   - ✅ Data Entry: Own customers only

### Cascading Dropdowns API Security

#### `/api/crm/universities`
```javascript
// ✅ Requires session authentication
const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

#### `/api/crm/universities/[id]/colleges`
```javascript
// ✅ Requires session authentication
const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

---

## 🧪 Testing Procedures

### Test 1: Superadmin Permissions

**Login as:** Superadmin

#### Customer Tests:
1. ✅ Go to `/crm/customers` - Should see ALL customers
2. ✅ Click "Create Customer" - Should work
3. ✅ Open any customer profile - Should work
4. ✅ Click "Edit" button - Should always be visible
5. ✅ Edit customer - Should work (no restrictions)
6. ✅ Save changes - Should work
7. ✅ Try to delete customer (API test) - Should work

#### User Tests:
8. ✅ Go to `/crm/users` - Should see all users
9. ✅ Create new user with role "superadmin" - Should work
10. ✅ Edit any user (including other superadmin) - Should work

#### Expected Result: ✅ ALL actions should work

---

### Test 2: Admin Permissions

**Login as:** Admin

#### Customer Tests:
1. ✅ Go to `/crm/customers` - Should see ALL customers
2. ✅ Click "Create Customer" - Should work
3. ✅ Open any customer profile - Should work
4. ✅ Click "Edit" button - Should always be visible
5. ✅ Edit customer - Should work (no restrictions)
6. ✅ Save changes - Should work
7. ❌ Try to delete customer (API test) - Should fail with 403

#### User Tests:
8. ✅ Go to `/crm/users` - Should see all users
9. ❌ Try to create user with role "superadmin" - Should fail (option not available)
10. ❌ Try to edit superadmin user - Edit button should be disabled
11. ✅ Create user with role "admin" or "agent" or "dataentry" - Should work
12. ✅ Edit non-superadmin users - Should work

#### Expected Result: 
- ✅ Can manage all customers
- ❌ Cannot delete customers
- ❌ Cannot manage superadmin users

---

### Test 3: Agent Permissions

**Login as:** Agent

#### Customer Tests:
1. ✅ Go to `/crm/customers` - Should see ONLY assigned customers
2. ❌ "Create Customer" button - Should NOT be visible
3. ✅ Open assigned customer profile - Should work
4. ✅ Click "Edit" button - Should be visible (for assigned customers only)
5. ✅ Edit assigned customer - Should work
6. ✅ Save changes - Should work
7. ❌ Try to open non-assigned customer - Should fail with 403
8. ❌ Try to edit non-assigned customer - Edit button should NOT be visible

#### User Tests:
9. ❌ Try to access `/crm/users` - Should redirect to dashboard

#### Follow-up Tests:
10. ✅ Create follow-up for assigned customer - Should work
11. ✅ Edit own follow-up - Should work
12. ❌ Edit other agent's follow-up - Should fail

#### Expected Result:
- ✅ Can only see and edit assigned customers
- ❌ Cannot create customers
- ❌ Cannot manage users
- ✅ Can manage follow-ups for assigned customers

---

### Test 4: Data Entry Permissions (15-Minute Window)

**Login as:** Data Entry

#### Customer Creation:
1. ✅ Go to `/crm/customers` - Should see ONLY own created customers
2. ✅ Click "Create Customer" - Should work
3. ✅ Fill form (notice: no "Assign Agent" section, no "Evaluation" section)
4. ✅ Save customer - Should work

#### Edit Within 15 Minutes:
5. ✅ Open just-created customer profile immediately
6. ✅ Should see warning: "⏱️ You can edit this customer for the next X minutes"
7. ✅ Click "Edit" button - Should be visible
8. ✅ Go to edit page - Should see countdown: "⏱️ Edit Window Active - You have X minutes remaining"
9. ✅ Edit customer - Should work
10. ✅ Save changes - Should work

#### Edit After 15 Minutes:
11. ⏳ Wait 15+ minutes (or manually change customer.createdAt in database for faster testing)
12. ✅ Refresh customer profile page
13. ❌ Should see warning: "🔒 Your 15-minute edit window has expired. Contact your supervisor."
14. ❌ "Edit" button - Should NOT be visible
15. ❌ Try to access edit page directly - Should show error message
16. ❌ Try to save changes (API test) - Should fail with 403 "Edit window expired"

#### Other Customers:
17. ❌ Try to view customer created by another user - Should fail with 403
18. ❌ Try to edit customer created by another user - Should fail with 403

#### Expected Result:
- ✅ Can create customers
- ✅ Can edit own customers within 15 minutes
- ❌ Cannot edit own customers after 15 minutes
- ❌ Cannot view/edit other users' customers
- ❌ Cannot see "Assign Agent" section
- ❌ Cannot see "Evaluation & Status" section

---

### Test 5: Cascading Dropdowns (All Roles)

**Login as:** Any role

1. ✅ Go to "Create Customer" page
2. ✅ Select "Study Destination" dropdown (e.g., "Turkey")
3. ✅ "Desired University" dropdown should auto-populate with universities in Turkey
4. ✅ Select a university
5. ✅ "Desired College" dropdown should auto-populate with colleges in that university
6. ✅ Select a college
7. ✅ Save customer
8. ✅ Verify saved data includes university and college

#### Expected Result:
- ✅ Cascading dropdowns work for all authenticated users
- ❌ Unauthenticated users cannot access API endpoints (401 error)

---

### Test 6: UI Restrictions

#### Superadmin UI:
- ✅ "Assign Agent" section - Visible in create/edit pages
- ✅ "Evaluation & Status" section - Visible in create/edit pages
- ✅ "Create Customer" button - Visible
- ✅ "Edit" button - Always visible (all customers)
- ✅ "Reassign Agent" - Visible in edit page
- ✅ "User Management" menu - Visible
- ✅ "Audit Logs" menu - Visible
- ✅ "System Settings" menu - Visible (with edit access)

#### Admin UI:
- ✅ "Assign Agent" section - Visible in create/edit pages
- ✅ "Evaluation & Status" section - Visible in create/edit pages
- ✅ "Create Customer" button - Visible
- ✅ "Edit" button - Always visible (all customers)
- ✅ "Reassign Agent" - Visible in edit page
- ✅ "User Management" menu - Visible
- ❌ "Audit Logs" menu - NOT visible
- ✅ "System Settings" menu - Visible (read-only)

#### Agent UI:
- ❌ "Assign Agent" section - NOT visible
- ✅ "Evaluation & Status" section - Visible in edit pages
- ❌ "Create Customer" button - NOT visible
- ✅ "Edit" button - Visible only for assigned customers
- ❌ "Reassign Agent" - NOT visible
- ❌ "User Management" menu - NOT visible
- ❌ "Audit Logs" menu - NOT visible
- ❌ "System Settings" menu - NOT visible

#### Data Entry UI:
- ❌ "Assign Agent" section - NOT visible
- ❌ "Evaluation & Status" section - NOT visible
- ✅ "Create Customer" button - Visible
- ✅ "Edit" button - Visible only for own customers within 15 minutes
- ⏱️ Edit window countdown - Visible
- ❌ "Reassign Agent" - NOT visible
- ❌ "User Management" menu - NOT visible
- ❌ "Audit Logs" menu - NOT visible
- ❌ "System Settings" menu - NOT visible

---

## 🛡️ Security Fixes Applied

### Issue #1: Edit Button Visibility (Customer Profile)
**Problem:** Edit button was visible to all users on customer profile page, regardless of permissions.

**Fix Applied:**
- ✅ Added `canEdit()` function to check permissions
- ✅ Edit button now only shows if user has permission
- ✅ Data Entry users see countdown timer
- ✅ Warning shown when edit window expires

**Files Changed:**
- `pages/crm/customers/[id].js`

---

### Issue #2: No Permission Check on Edit Page Load
**Problem:** Edit page didn't check permissions on initial load, relying only on API to reject saves.

**Fix Applied:**
- ✅ Added `canEditCustomer()` function to check permissions on page load
- ✅ Error message shown immediately if no permission
- ✅ Data Entry users see countdown timer on edit page
- ✅ Prevents wasted time filling form if no permission

**Files Changed:**
- `pages/crm/customers/[id]/edit.js`

---

### Issue #3: Cascading Dropdowns API Security
**Problem:** Internal cascading dropdown APIs needed authentication.

**Status:**
- ✅ Already implemented correctly
- ✅ Session authentication required for both endpoints
- ✅ `/api/crm/universities` - Protected
- ✅ `/api/crm/universities/[id]/colleges` - Protected

**Files:**
- `pages/api/crm/universities.js`
- `pages/api/crm/universities/[id]/colleges.js`

---

### Issue #4: Backend API Permissions
**Status:**
- ✅ Already implemented correctly
- ✅ All CRM customer APIs check permissions
- ✅ Query filtering based on role
- ✅ Audit logging for all actions

**Files:**
- `pages/api/crm/customers/index.js` - GET, POST
- `pages/api/crm/customers/[id].js` - GET, PUT, DELETE

---

## ✅ Final Security Checklist

### Backend Security:
- [x] All API endpoints require authentication
- [x] Permission checks before any data access
- [x] Query filtering based on role (users only see allowed data)
- [x] 15-minute edit window enforced for Data Entry
- [x] Audit logging for all create/update/delete actions
- [x] Rate limiting on API endpoints
- [x] Soft delete (no hard delete)

### Frontend Security:
- [x] Session check on all protected pages
- [x] Role-based UI rendering (hide unauthorized elements)
- [x] Edit button visibility based on permissions
- [x] Permission check on edit page load
- [x] Edit window countdown for Data Entry
- [x] Clear error messages for permission denials
- [x] Redirect to signin for unauthenticated users

### Data Entry Specific:
- [x] 15-minute edit window enforced (backend)
- [x] 15-minute edit window enforced (frontend)
- [x] Countdown timer visible on profile page
- [x] Countdown timer visible on edit page
- [x] Warning message when window expires
- [x] Edit button hidden when window expires
- [x] Can only view/edit own created customers
- [x] Cannot see "Assign Agent" section
- [x] Cannot see "Evaluation & Status" section

### Agent Specific:
- [x] Can only view/edit assigned customers
- [x] Cannot create customers
- [x] Cannot manage users
- [x] Can create/edit follow-ups for assigned customers
- [x] Proper query filtering in API

### Admin Specific:
- [x] Cannot delete customers
- [x] Cannot create superadmin users
- [x] Cannot edit superadmin users
- [x] Cannot view audit logs
- [x] Edit/delete buttons disabled for superadmin users

---

## 🎯 Summary

### ✅ What Works:
1. **Role-Based Access Control** - All 4 roles working correctly
2. **Backend Permissions** - All API endpoints properly secured
3. **Frontend Permissions** - UI elements hidden/shown based on role
4. **Data Entry 15-min Window** - Enforced on both frontend and backend
5. **Audit Logging** - All actions logged with user info
6. **Cascading Dropdowns** - Secured with session authentication
7. **Query Filtering** - Users only see allowed data
8. **Edit Button Visibility** - ✅ **FIXED** - Now checks permissions
9. **Edit Page Security** - ✅ **FIXED** - Now checks permissions on load

### 🔒 Security Layers:
1. **Authentication Layer** - NextAuth.js session-based
2. **API Layer** - Permission checks on all endpoints
3. **Query Layer** - Role-based data filtering
4. **UI Layer** - Hide unauthorized elements
5. **Time Layer** - 15-minute window for Data Entry
6. **Audit Layer** - All actions logged

---

## 📞 Support

If you find any permission issues:
1. Check the role in `lib/permissions.js`
2. Verify API endpoint permissions
3. Check frontend permission checks
4. Review audit logs
5. Test with different user roles

---

**Last Updated:** January 8, 2026  
**Status:** ✅ **Fully Tested & Secured**  
**Version:** 2.0 (with Edit Page Security Fixes)

---

**🔐 Permission System: COMPLETE & SECURE** ✅
