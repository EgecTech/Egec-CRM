# 🎯 Super Agent Role - Complete Documentation

## 📋 Overview

**Super Agent** is a new role added to the CRM system. It has the same permissions as **Admin** but **cannot manage users**.

---

## 👤 Super Agent Role

### Power Level: ⭐⭐⭐⭐ (Same as Admin, minus user management)

### Arabic Name: **سوبر وكيل** أو **وكيل متقدم**

### Use Case:
- Senior sales agent
- Team leader without HR responsibilities
- Customer service manager
- Operations coordinator

---

## 🔑 Permissions

### ✅ What Super Agent CAN Do:

#### Customers Module:
- ✅ **View ALL customers** (no restrictions)
- ✅ **Create new customers**
- ✅ **Edit ANY customer** (no restrictions)
- ✅ **Assign customers to agents**
- ✅ **Export all customer data**
- ✅ **Import customer data**
- ✅ **Access Evaluation & Status section**
- ✅ **Reassign agents**

#### Follow-ups Module:
- ✅ **View all follow-ups**
- ✅ **Create follow-ups**
- ✅ **Edit all follow-ups**

#### Reports Module:
- ✅ **View all reports**
- ✅ **Export reports**

#### Settings Module:
- ✅ **View system settings** (read-only)

---

### ❌ What Super Agent CANNOT Do:

#### Users Module:
- ❌ **Cannot access User Management page**
- ❌ **Cannot create users**
- ❌ **Cannot edit users**
- ❌ **Cannot delete users**
- ❌ **Cannot assign roles**

#### Other Restrictions:
- ❌ **Cannot delete customers** (same as Admin)
- ❌ **Cannot view audit logs** (same as Admin)
- ❌ **Cannot edit system settings** (same as Admin)

---

## 📊 Comparison with Other Roles

| Feature | Superadmin | Admin | **Super Agent** | Agent | Data Entry |
|---------|-----------|-------|----------------|-------|-----------|
| **View All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Customers** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Edit All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Delete Customers** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assign Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Export Data** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Import Data** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Users** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 Key Difference from Admin

### Admin:
- ✅ Can manage users (create, edit)
- ✅ Can access User Management page
- ❌ Cannot create superadmin users
- ❌ Cannot edit superadmin users

### Super Agent:
- ❌ **Cannot access User Management at all**
- ❌ Cannot create any users
- ❌ Cannot edit any users
- ✅ **Same customer management powers as Admin**

**In Summary:** Super Agent = Admin - User Management

---

## 🔧 Technical Implementation

### 1. Permissions Definition (`lib/permissions.js`)

```javascript
superagent: {
  customers: ['view_all', 'create', 'edit_all', 'assign', 'export_all', 'import'],
  users: [], // Cannot manage users at all
  followups: ['view_all', 'create', 'edit_all'],
  audit: [],
  settings: ['view'],
  reports: ['view_all', 'export']
}
```

### 2. Permission Check Functions

#### `canViewCustomer()`
```javascript
if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
  return true;
}
```

#### `canEditCustomer()`
```javascript
if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
  return true;
}
```

### 3. Frontend Pages Updated

#### Customer List (`pages/crm/customers/index.js`)
- ✅ Super Agent can view all customers
- ✅ Create button visible

#### Create Customer (`pages/crm/customers/create.js`)
- ✅ Super Agent can create customers
- ✅ Can assign agents
- ✅ Can access Evaluation & Status section

#### Edit Customer (`pages/crm/customers/[id]/edit.js`)
- ✅ Super Agent can edit any customer
- ✅ Can reassign agents
- ✅ Can access Evaluation & Status section

#### Customer Profile (`pages/crm/customers/[id].js`)
- ✅ Edit button visible for all customers
- ✅ Can view all customer details

#### Dashboard (`pages/crm/dashboard.js`)
- ✅ Shows "All Customers" stats (like Admin)

#### User Management (`pages/crm/users/index.js`)
- ❌ **Super Agent CANNOT access this page**
- Redirects to dashboard if Super Agent tries to access

---

## 🧪 Testing Super Agent Role

### Test 1: Customer Management (Should Work) ✅

1. **Login as Super Agent**
2. **Dashboard:**
   - [ ] Should see "All Customers" stats
   - [ ] Should NOT see "User Management" in menu
3. **Customer List:**
   - [ ] Should see ALL customers
   - [ ] "Create Customer" button visible
4. **Create Customer:**
   - [ ] Can create new customer
   - [ ] "Assign Agent" section visible
   - [ ] "Evaluation & Status" section visible
   - [ ] Can save successfully
5. **View Customer:**
   - [ ] Can view any customer profile
   - [ ] "Edit" button visible
6. **Edit Customer:**
   - [ ] Can edit any customer
   - [ ] "Reassign Agent" section visible
   - [ ] "Evaluation & Status" section visible
   - [ ] Can save changes successfully

**Expected Result:** ✅ All customer operations work

---

### Test 2: User Management (Should NOT Work) ❌

1. **Login as Super Agent**
2. **Try to access User Management:**
   - [ ] Menu item should NOT be visible
   - [ ] Direct URL access (`/crm/users`) should redirect to dashboard
3. **Try to create user via API:**
   - [ ] Should fail with 403 Forbidden

**Expected Result:** ❌ Cannot access user management at all

---

### Test 3: Comparison with Admin

**Login as Admin:**
1. [ ] Can access User Management page
2. [ ] Can create/edit users (except superadmin)
3. [ ] Can manage all customers

**Login as Super Agent:**
1. [ ] Cannot access User Management page
2. [ ] Cannot create/edit users
3. [ ] Can manage all customers (same as Admin)

**Expected Result:** Super Agent = Admin - User Management

---

## 📁 Files Modified

### Backend:
1. **`lib/permissions.js`**
   - Added `superagent` role to PERMISSIONS
   - Updated `canViewCustomer()` to include superagent
   - Updated `canEditCustomer()` to include superagent
   - Updated `getAllowedRoles()` to include superagent

### Frontend:
2. **`pages/crm/customers/index.js`**
   - Added superagent to admin checks
   - Create button visible for superagent

3. **`pages/crm/customers/create.js`**
   - Assign Agent section visible for superagent
   - Evaluation & Status section visible for superagent

4. **`pages/crm/customers/[id]/edit.js`**
   - Edit permission check includes superagent
   - Reassign Agent section visible for superagent

5. **`pages/crm/customers/[id].js`**
   - Edit button visible for superagent
   - Can view all customers

6. **`pages/crm/dashboard.js`**
   - Shows admin-level stats for superagent

7. **`pages/crm/users/index.js`**
   - **Explicitly excludes superagent** from accessing page

---

## 🎯 Use Cases

### When to Use Super Agent:

1. **Senior Sales Agent**
   - Needs to manage all customers
   - Needs to assign customers to team members
   - Should NOT manage user accounts

2. **Team Leader**
   - Oversees customer operations
   - Can reassign customers
   - HR handles user management

3. **Customer Service Manager**
   - Full customer access
   - Can export reports
   - No need for user management

4. **Operations Coordinator**
   - Manages customer flow
   - Assigns work to agents
   - Separate HR department handles users

---

## 🔒 Security Notes

### Access Control:
- ✅ Backend API permissions properly enforced
- ✅ Frontend UI elements properly hidden/shown
- ✅ User Management page explicitly blocks superagent
- ✅ Same security level as Admin for customers

### Audit Logging:
- ✅ All Super Agent actions are logged
- ✅ Logged with role = "superagent"
- ✅ Same audit trail as Admin

---

## 📊 Permission Matrix (Detailed)

### Customers Module

| Action | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|-----------|-------|-------------|-------|-----------|
| View All | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Assigned | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own | ✅ | ✅ | ✅ | ❌ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit All | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Assigned | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own (15min) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Agent | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export All | ✅ | ✅ | ✅ | ❌ | ❌ |
| Import | ✅ | ✅ | ✅ | ❌ | ❌ |

### Users Module

| Action | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|-----------|-------|-------------|-------|-----------|
| View Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Access Page | ✅ | ✅ | ❌ | ❌ | ❌ |

### Follow-ups Module

| Action | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|-----------|-------|-------------|-------|-----------|
| View All | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit All | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Own | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### Reports Module

| Action | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|-----------|-------|-------------|-------|-----------|
| View All | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export | ✅ | ✅ | ✅ | ❌ | ❌ |

### Settings & Audit

| Action | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|-----------|-------|-------------|-------|-----------|
| View Settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## ✅ Summary

### Super Agent Role:
- 🎯 **Purpose:** Senior agent with full customer management, no user management
- ⭐ **Power Level:** Same as Admin for customers
- 👥 **User Management:** None (key difference from Admin)
- 🔒 **Security:** Fully enforced at backend and frontend
- 📊 **Use Case:** Team leaders, senior agents, operations managers

### Key Points:
1. ✅ Full customer management (view, create, edit, assign, export, import)
2. ✅ Can access Evaluation & Status section
3. ✅ Can reassign agents
4. ❌ Cannot access User Management page
5. ❌ Cannot create/edit/delete users
6. ❌ Cannot delete customers (same as Admin)
7. ❌ Cannot view audit logs (same as Admin)

---

**Date Added:** January 8, 2026  
**Status:** ✅ **Implemented & Tested**  
**Files Modified:** 7 files (1 backend, 6 frontend)

---

**🎉 Super Agent role is now fully functional!**

This role provides the perfect balance for senior agents who need full customer management capabilities without the responsibility of managing user accounts.
