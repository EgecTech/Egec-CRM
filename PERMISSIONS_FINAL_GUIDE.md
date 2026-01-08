# 🔐 Complete Permissions Guide - Egec CRM System

Last Updated: January 8, 2026

## 📋 Table of Contents
1. [Role Overview](#role-overview)
2. [Permission Matrix](#permission-matrix)
3. [Page-by-Page Access Control](#page-by-page-access-control)
4. [Field-Level Visibility](#field-level-visibility)
5. [API Security](#api-security)
6. [Testing Guide](#testing-guide)

---

## 1. Role Overview

### 👑 Superadmin
- **Full System Access**
- Can manage all users including other superadmins
- Can view and edit all customers
- Can access all system settings
- Can view marketing data
- Can view audit logs
- Can generate reports

### 🔧 Admin
- **Administrative Access**
- Can manage users (except superadmins)
- Can view and edit all customers
- Can access system settings
- Can view marketing data
- Can assign agents
- Can generate reports

### 🌟 Super Agent
- **Agent Management Access WITHOUT User Management**
- CANNOT manage users (this is the key difference from Admin)
- Can view and edit all customers
- Can view system settings (read-only)
- CANNOT view marketing data
- Can assign agents to customers
- Can generate reports

### 👤 Agent
- **Customer Management Access**
- Can view only assigned customers
- Can edit only assigned customers
- Can create new customers
- CANNOT view marketing data
- Cannot assign customers
- Cannot access user management

### 📝 Data Entry
- **Basic Entry Access**
- Can view only their created customers
- Can edit only their created customers
- Can create new customers
- CANNOT view marketing data
- Cannot assign customers
- Cannot access user management

---

## 2. Permission Matrix

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Users** | | | | | |
| View Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Customers** | | | | | |
| View All Customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Assigned Customers | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own Created Customers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Customers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit All Customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Assigned Customers | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own Created Customers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign Customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Import Customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Marketing Data** | | | | | |
| View Marketing Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Marketing Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Follow-ups** | | | | | |
| View All Follow-ups | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Assigned Follow-ups | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Follow-ups | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit All Follow-ups | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Assigned Follow-ups | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Reports** | | | | | |
| View Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Settings** | | | | | |
| View Settings | ✅ | ✅ | ✅ (read-only) | ❌ | ❌ |
| Edit Settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** | | | | | |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Page-by-Page Access Control

### 📊 Dashboard (`/crm/dashboard`)
- **All Roles:** ✅ Can access
- **Content varies by role:**
  - Superadmin/Admin/Super Agent: See all customer stats, sales pipeline, team performance
  - Agent: See only assigned customer stats and follow-ups
  - Data Entry: See only their created customer stats

### 👥 Customer List (`/crm/customers`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent (see all customers)
  - ✅ Agent (see only assigned customers)
  - ✅ Data Entry (see only their created customers)

- **Table Columns:**
  - **All Roles:** Customer #, Name, Phone, حالة المرشد, Desired Specialization, Actions
  - **Admin Roles Only (Superadmin/Admin/Super Agent):** + Agent column
  - **Agent/Data Entry:** Agent column is HIDDEN

- **Features:**
  - Degree Type Tabs (All, Bachelor, Master, PhD) - Available for ALL roles
  - Counselor Status Filter - Available for ALL roles
  - Agent Filter - Available for Admin roles ONLY (hidden from Agent/Data Entry)
  - Date Range Filters (Created From/To) - Available for ALL roles
  - Search by Customer Number, Name, Phone, Email - Available for ALL roles
  - Export Button (Admin roles only)
  - New Customer Button (all roles except standard Agent in some contexts)

- **Degree Type Tabs Visibility:**
  - ✅ Superadmin, Admin, Super Agent (see all customers by degree)
  - ✅ Agent (see ONLY assigned customers by degree)
  - ✅ Data Entry (see ONLY own created customers by degree)

- **Filters Behavior by Role:**
  - **Admin Roles:** All filters work on ALL customers in system
  - **Agent:** All filters work on ASSIGNED customers only (Agent filter hidden as redundant)
  - **Data Entry:** All filters work on OWN CREATED customers only (Agent filter hidden as not relevant)

### ➕ Create Customer (`/crm/customers/create`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent, Data Entry
  - ✅ Agent

- **Form Steps:**
  - **Superadmin/Admin:**
    1. Marketing Data (includes Study Destination, Source, Company, Counselor)
    2. Basic Data
    3. Current Qualification (varies by Degree Type)
    4. Desired Program
    5. Evaluation & Status

  - **Super Agent/Agent:**
    1. ~~Marketing Data~~ (HIDDEN)
    2. Basic Data (STARTS HERE)
    3. Current Qualification (varies by Degree Type)
    4. Desired Program
    5. Evaluation & Status

### 👁️ Customer Profile (`/crm/customers/[id]`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent (all customers)
  - ✅ Agent (assigned customers only)
  - ✅ Data Entry (own created customers only)

- **Tabs Visible:**
  - **Superadmin/Admin:**
    - Basic Info
    - Marketing Data ✅
    - Qualification
    - Desired Program
    - Evaluation
    - Follow-ups
    - Activity

  - **Super Agent/Agent/Data Entry:**
    - Basic Info
    - ~~Marketing Data~~ (HIDDEN)
    - Qualification
    - Desired Program
    - Evaluation
    - Follow-ups
    - Activity

- **Edit Button:**
  - Visible only if user has edit permission for this customer

### ✏️ Edit Customer (`/crm/customers/[id]/edit`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent (all customers)
  - ✅ Agent (assigned customers only)
  - ✅ Data Entry (own created customers only)

- **Sections Visible:**
  - Degree Type Selector (All roles)
  - **Marketing Data:** Only Superadmin/Admin
  - Basic Data (All roles)
  - Current Qualification (All roles, varies by degree type)
  - Desired Program (All roles)
  - Evaluation & Status (All roles)

- **Assign Agent Field:**
  - Only visible to Superadmin/Admin/Super Agent

### 📞 Follow-ups (`/crm/followups`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent (all follow-ups)
  - ✅ Agent (assigned follow-ups only)
  - ❌ Data Entry (no access)

### 📈 Reports (`/crm/reports`)
- **Access:**
  - ✅ Superadmin, Admin, Super Agent
  - ❌ Agent, Data Entry

### 👥 Users Management (`/crm/users`)
- **Access:**
  - ✅ Superadmin (can manage all roles including other superadmins)
  - ✅ Admin (can manage all roles except superadmins)
  - ❌ Super Agent (no user management)
  - ❌ Agent, Data Entry (no access)

- **Role Options in Create/Edit:**
  - **Superadmin can create:**
    - Superadmin
    - Admin
    - Super Agent
    - Agent
    - Data Entry

  - **Admin can create:**
    - Admin
    - Super Agent
    - Agent
    - Data Entry

### 🔧 System Settings (`/crm/system-settings`)
- **Access:**
  - ✅ Superadmin, Admin (full edit access)
  - ✅ Super Agent (read-only access)
  - ❌ Agent, Data Entry

### 📋 Audit Logs (`/crm/audit-logs`)
- **Access:**
  - ✅ Superadmin only
  - ❌ All other roles

---

## 4. Field-Level Visibility

### Marketing Data Section
**Visible to:** Superadmin, Admin ONLY  
**Hidden from:** Super Agent, Agent, Data Entry

**Fields:**
- Study Destination (الوجهة الدراسية)
- Source (المصدر)
- Company (الشركة)
- Counselor (المرشد)
- Inquiry Date (تاريخ الاستفسار)
- Inquiry Reference (رقم الاستفسار)
- Article Inquiry (تفاصيل الاستفسار)
- Sub Guides

### Agent Column in Customer Table
**Visible to:** Superadmin, Admin, Super Agent  
**Hidden from:** Agent, Data Entry

### Assign Agent Dropdown
**Visible to:** Superadmin, Admin, Super Agent  
**Hidden from:** Agent, Data Entry

### Current Qualification - Degree Type Specific Fields

#### Bachelor's Degree
**Common Fields (All Users):**
- Grade/GPA (المعدل)
- Overall Rating (التقدير)
- Study System (نظام الدراسة)
- Graduation Year (سنة التخرج)
- Certificate Track
- Available Colleges

#### Master's Degree
**Common Fields:** REMOVED (duplicate data)  
~~Grade/GPA, Overall Rating, Study System, Graduation Year~~

**Bachelor's Degree Information (nested):**
- Bachelor's Specialization
- Bachelor's College
- Bachelor's University
- Bachelor's Country
- Bachelor's Graduation Year
- Bachelor's GPA
- Bachelor's Credit Hours
- Bachelor's Study Duration

#### PhD
**Common Fields:** REMOVED (duplicate data)  
~~Grade/GPA, Overall Rating, Study System, Graduation Year~~

**Bachelor's Degree Information (nested):**
- All Bachelor fields (same as Master)

**Master's Degree Information (nested):**
- Master's Specialization
- Master's Sector
- Master's Degree Type
- Master's College
- Master's University
- Master's Country
- Master's Graduation Year
- Master's GPA
- Master's Credit Hours
- Master's Study Duration

---

## 5. API Security

All API endpoints use `lib/permissions.js` for access control:

### Customer Query Building
```javascript
// lib/permissions.js
function buildCustomerQuery(role, userId) {
  if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
    return {}; // All customers
  }
  if (role === 'agent' || role.includes('agent')) {
    return { 'assignment.assignedAgent': userId }; // Assigned only
  }
  if (role === 'dataentry') {
    return { createdBy: userId }; // Own created only
  }
  return { _id: null }; // No access
}
```

### Key API Endpoints

#### `/api/crm/customers` (GET)
- Uses `buildCustomerQuery` to filter results
- Returns degree stats based on user's accessible customers
- Supports pagination, search, and date filters

#### `/api/crm/customers` (POST)
- Marketing data is optional
- Auto-assigns to creator if Agent/Data Entry
- Validates degree type and required fields

#### `/api/crm/customers/[id]` (GET)
- Uses `canViewCustomer` to check access
- Returns 403 if unauthorized

#### `/api/crm/customers/[id]` (PUT)
- Uses `canEditCustomer` to check access
- Returns 403 if unauthorized
- Superadmin/Admin/Super Agent can reassign customers

#### `/api/crm/customers/stats`
- Returns customer counts by degree type
- Respects user's query scope
- Cached for 5 minutes

#### `/api/crm/followups` (GET)
- Uses `buildFollowupQuery` to filter results
- Admin sees all, Agent sees assigned only

#### `/api/crm/universities` (Internal)
- Session-authenticated
- Used for cascading dropdowns
- No token required (internal use)

---

## 6. Testing Guide

### Test Scenario 1: Superadmin
1. ✅ Login as superadmin
2. ✅ Navigate to `/crm/customers` - should see all customers with Agent column
3. ✅ Navigate to `/crm/customers/create` - should see Marketing Data step
4. ✅ View any customer profile - should see Marketing Data tab
5. ✅ Navigate to `/crm/users` - should see all users and can create superadmin
6. ✅ Navigate to `/crm/reports` - should have access
7. ✅ Navigate to `/crm/audit-logs` - should have access

### Test Scenario 2: Admin
1. ✅ Login as admin
2. ✅ Navigate to `/crm/customers` - should see all customers with Agent column
3. ✅ Navigate to `/crm/customers/create` - should see Marketing Data step
4. ✅ View any customer profile - should see Marketing Data tab
5. ✅ Navigate to `/crm/users` - should see all users except superadmins, cannot create superadmin
6. ✅ Navigate to `/crm/reports` - should have access
7. ❌ Navigate to `/crm/audit-logs` - should redirect to dashboard

### Test Scenario 3: Super Agent
1. ✅ Login as superagent
2. ✅ Navigate to `/crm/customers` - should see all customers with Agent column
3. ✅ Navigate to `/crm/customers/create` - should NOT see Marketing Data step (starts from Basic Data)
4. ✅ View any customer profile - should NOT see Marketing Data tab
5. ✅ Edit any customer - should NOT see Marketing Data section
6. ❌ Navigate to `/crm/users` - should redirect to dashboard
7. ✅ Navigate to `/crm/reports` - should have access
8. ❌ Navigate to `/crm/audit-logs` - should redirect to dashboard

### Test Scenario 4: Agent
1. ✅ Login as agent
2. ✅ Navigate to `/crm/customers` - should see ONLY assigned customers WITHOUT Agent column
3. ✅ Should see Degree Type Tabs (All, Bachelor, Master, PhD) with counts for assigned customers only
4. ✅ Navigate to `/crm/customers/create` - should NOT see Marketing Data step
5. ✅ View assigned customer profile - should NOT see Marketing Data tab
6. ❌ Try to view unassigned customer - should get 403 error or redirect
7. ✅ Edit assigned customer - should NOT see Marketing Data section or Assign Agent field
8. ❌ Navigate to `/crm/users` - should redirect to dashboard
9. ❌ Navigate to `/crm/reports` - should redirect to dashboard
10. ✅ Navigate to `/crm/followups` - should see only assigned follow-ups

### Test Scenario 5: Data Entry
1. ✅ Login as dataentry
2. ✅ Navigate to `/crm/customers` - should see ONLY own created customers WITHOUT Agent column
3. ✅ Should see Degree Type Tabs (All, Bachelor, Master, PhD) with counts for own created customers only
4. ✅ Navigate to `/crm/customers/create` - should NOT see Marketing Data step
5. ✅ View own created customer profile - should NOT see Marketing Data tab
6. ❌ Try to view other's customer - should get 403 error or redirect
7. ✅ Edit own created customer - should NOT see Marketing Data section
8. ❌ Navigate to `/crm/users` - should redirect to dashboard
9. ❌ Navigate to `/crm/reports` - should redirect to dashboard
10. ❌ Navigate to `/crm/followups` - should redirect to dashboard

---

## 🔍 Quick Permission Checks

### "Can I view Marketing Data?"
- ✅ Superadmin
- ✅ Admin
- ❌ Super Agent
- ❌ Agent
- ❌ Data Entry

### "Can I manage users?"
- ✅ Superadmin (all roles)
- ✅ Admin (all except superadmin)
- ❌ Super Agent
- ❌ Agent
- ❌ Data Entry

### "Can I see all customers?"
- ✅ Superadmin
- ✅ Admin
- ✅ Super Agent
- ❌ Agent (assigned only)
- ❌ Data Entry (own created only)

### "Can I see the Agent column in customer table?"
- ✅ Superadmin
- ✅ Admin
- ✅ Super Agent
- ❌ Agent
- ❌ Data Entry

### "Can I assign customers to agents?"
- ✅ Superadmin
- ✅ Admin
- ✅ Super Agent
- ❌ Agent
- ❌ Data Entry

### "Can I generate reports?"
- ✅ Superadmin
- ✅ Admin
- ✅ Super Agent
- ❌ Agent
- ❌ Data Entry

---

## 🎯 Implementation Files

### Backend Permission Logic
- `lib/permissions.js` - Core permission functions
- `pages/api/crm/customers/index.js` - Customer list & creation
- `pages/api/crm/customers/[id].js` - Customer view & edit
- `pages/api/crm/followups/index.js` - Follow-ups
- `pages/api/admin/users.js` - User management

### Frontend Permission Checks
- `pages/crm/customers/index.js` - Customer list visibility
- `pages/crm/customers/create.js` - Create form steps
- `pages/crm/customers/[id].js` - Customer profile tabs
- `pages/crm/customers/[id]/edit.js` - Edit form sections
- `pages/crm/dashboard.js` - Dashboard access
- `pages/crm/users/index.js` - User management
- `pages/crm/reports/index.js` - Reports access

---

## ✅ Security Checklist

- [x] All API endpoints check authentication
- [x] Customer queries filtered by role
- [x] Marketing data hidden from Super Agent, Agent, Data Entry
- [x] Agent column hidden from Agent, Data Entry
- [x] Super Agent cannot access user management
- [x] Agent can only view/edit assigned customers
- [x] Data Entry can only view/edit own created customers
- [x] Edit button hidden if user cannot edit customer
- [x] Marketing Data step hidden for Super Agent, Agent, Data Entry in create form
- [x] Degree Type selector working on edit page
- [x] Reports page includes Super Agent
- [x] Dashboard "Create Customer" button includes Super Agent
- [x] All role checks use consistent role names

---

**Last Verified:** January 8, 2026  
**Version:** 2.0  
**Status:** ✅ Complete & Tested
