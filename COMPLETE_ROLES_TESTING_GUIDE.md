# 🧪 Complete Roles Testing Guide - All 5 Roles

## 📋 Overview

This guide provides comprehensive testing procedures for **all 5 user roles** in the CRM system, including the newly added **Super Agent** role.

---

## 👥 All Roles Summary

| # | Role | Arabic | Power Level | User Management | Customer Access |
|---|------|--------|-------------|-----------------|----------------|
| 1 | **Superadmin** | مدير عام | ⭐⭐⭐⭐⭐ | ✅ Full | ✅ All |
| 2 | **Admin** | مدير | ⭐⭐⭐⭐ | ✅ Limited | ✅ All |
| 3 | **Super Agent** | سوبر وكيل | ⭐⭐⭐⭐ | ❌ None | ✅ All |
| 4 | **Agent** | وكيل | ⭐⭐⭐ | ❌ None | ✅ Assigned |
| 5 | **Data Entry** | إدخال بيانات | ⭐⭐ | ❌ None | ✅ Own (15min) |

---

## 🧪 Test 1: Superadmin (المدير العام)

### Prerequisites:
- Login as: `superadmin@example.com`

### User Management Tests:
1. [ ] Go to **User Management**
2. [ ] Click **"Create New User"**
3. [ ] Check role dropdown contains:
   - [ ] Super Admin
   - [ ] Admin
   - [ ] Super Agent ⭐ NEW
   - [ ] Agent
   - [ ] Data Entry
4. [ ] Create user with role **"Super Agent"**
5. [ ] Verify user appears in list with **amber badge** "Super Agent"
6. [ ] Edit any user (including other superadmin)
7. [ ] Change user role to different values
8. [ ] Toggle user active/inactive status

### Customer Management Tests:
9. [ ] View **all customers** in list
10. [ ] Create new customer
11. [ ] Assign agent section **visible**
12. [ ] Evaluation & Status section **visible**
13. [ ] Edit any customer
14. [ ] Reassign agent section **visible**
15. [ ] Delete customer (API test) - should work

### Expected Result:
✅ **All operations work without restrictions**

---

## 🧪 Test 2: Admin (المدير)

### Prerequisites:
- Login as: `admin@example.com`

### User Management Tests:
1. [ ] Go to **User Management**
2. [ ] Click **"Create New User"**
3. [ ] Check role dropdown contains:
   - [ ] Admin (only if superadmin)
   - [ ] Super Agent ⭐ NEW
   - [ ] Agent
   - [ ] Data Entry
   - [ ] **NO** Super Admin option
4. [ ] Create user with role **"Super Agent"**
5. [ ] Verify user appears with **amber badge** "Super Agent"
6. [ ] Try to edit **superadmin user**:
   - [ ] Edit button should be **disabled/grayed out**
   - [ ] Toggle status button should be **disabled/grayed out**
7. [ ] Edit non-superadmin user - should work

### Customer Management Tests:
8. [ ] View **all customers** in list
9. [ ] Create new customer
10. [ ] Assign agent section **visible**
11. [ ] Evaluation & Status section **visible**
12. [ ] Edit any customer - should work
13. [ ] Reassign agent section **visible**
14. [ ] Try to delete customer (API test) - should **fail with 403**

### Expected Result:
✅ **Can manage all customers**  
✅ **Can create Super Agent users**  
❌ **Cannot manage superadmin users**  
❌ **Cannot delete customers**

---

## 🧪 Test 3: Super Agent (سوبر وكيل) ⭐ NEW ROLE

### Prerequisites:
- Create Super Agent user first (using Admin or Superadmin)
- Login as: `superagent@example.com`

### User Management Tests:
1. [ ] Check main menu - **"User Management" should NOT be visible**
2. [ ] Try direct URL: `/crm/users`
3. [ ] Should **redirect to dashboard**
4. [ ] Try API call to create user - should **fail with 403**

### Customer Management Tests (Should Work Like Admin):
5. [ ] Dashboard shows **"All Customers"** stats
6. [ ] Go to **Customer List**
7. [ ] Should see **ALL customers** (not just assigned)
8. [ ] **"Create Customer"** button visible
9. [ ] Click **"Create Customer"**
10. [ ] **"Assign Agent"** section **visible** ✅
11. [ ] **"Evaluation & Status"** section **visible** ✅
12. [ ] Create customer successfully
13. [ ] Open any customer profile
14. [ ] **"Edit"** button **visible** for all customers
15. [ ] Click **"Edit"**
16. [ ] **"Reassign Agent"** section **visible** ✅
17. [ ] **"Evaluation & Status"** section **visible** ✅
18. [ ] Edit and save successfully
19. [ ] Export customers - should work
20. [ ] View all reports - should work

### Expected Result:
✅ **Full customer management (like Admin)**  
✅ **Can assign/reassign agents**  
✅ **Can access Evaluation & Status**  
❌ **Cannot access User Management**  
❌ **Cannot create/edit users**

---

## 🧪 Test 4: Agent (الوكيل)

### Prerequisites:
- Create Agent user
- Assign some customers to this agent
- Login as: `agent@example.com`

### User Management Tests:
1. [ ] **"User Management"** menu item **NOT visible**
2. [ ] Direct URL access should redirect to dashboard

### Customer Management Tests:
3. [ ] Dashboard shows **"Assigned Customers"** stats only
4. [ ] Customer list shows **only assigned customers**
5. [ ] **"Create Customer"** button **NOT visible**
6. [ ] Open **assigned customer** profile
7. [ ] **"Edit"** button **visible**
8. [ ] Edit assigned customer - should work
9. [ ] **"Evaluation & Status"** section **visible**
10. [ ] Try to open **non-assigned customer**:
    - [ ] Should get **403 Forbidden** error
11. [ ] Try to edit non-assigned customer:
    - [ ] **"Edit"** button should **NOT be visible**

### Follow-up Tests:
12. [ ] Create follow-up for assigned customer - should work
13. [ ] Edit own follow-up - should work
14. [ ] Try to edit other agent's follow-up - should fail

### Expected Result:
✅ **Can only view/edit assigned customers**  
✅ **Can create follow-ups**  
❌ **Cannot create customers**  
❌ **Cannot access non-assigned customers**  
❌ **Cannot manage users**

---

## 🧪 Test 5: Data Entry (إدخال البيانات)

### Prerequisites:
- Login as: `dataentry@example.com`

### User Management Tests:
1. [ ] **"User Management"** menu item **NOT visible**

### Customer Creation:
2. [ ] Dashboard shows **"Own Customers"** stats only
3. [ ] Customer list shows **only own created customers**
4. [ ] **"Create Customer"** button **visible**
5. [ ] Click **"Create Customer"**
6. [ ] **"Assign Agent"** section **NOT visible** ❌
7. [ ] **"Evaluation & Status"** section **NOT visible** ❌
8. [ ] Create customer successfully
9. [ ] Note the creation time

### Edit Within 15 Minutes:
10. [ ] Open just-created customer profile **immediately**
11. [ ] Should see **countdown warning**:
    ```
    ⏱️ You can edit this customer for the next X minutes
    ```
12. [ ] **"Edit"** button **visible**
13. [ ] Click **"Edit"**
14. [ ] Should see **countdown on edit page**:
    ```
    ⏱️ Edit Window Active - You have X minutes remaining
    ```
15. [ ] Make changes and save - should work ✅

### Edit After 15 Minutes:
16. [ ] **Option A:** Wait 15+ minutes (slow)
17. [ ] **Option B:** Use database hack (fast):
    ```javascript
    // In MongoDB, update customer createdAt to 20 minutes ago
    db.customers.updateOne(
      { customerNumber: "YOUR_CUSTOMER_NUMBER" },
      { $set: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } }
    )
    ```
18. [ ] Refresh customer profile page
19. [ ] Should see **expired warning**:
    ```
    🔒 Your 15-minute edit window has expired. Contact your supervisor.
    ```
20. [ ] **"Edit"** button **NOT visible** ❌
21. [ ] Try to access edit page directly - should show **error message**
22. [ ] Try to save changes via API - should **fail with 403**

### Other Users' Customers:
23. [ ] Try to view customer created by another user
24. [ ] Should get **403 Forbidden** error
25. [ ] Customer list shows **only own customers**

### Expected Result:
✅ **Can create customers**  
✅ **Can edit own customers within 15 minutes**  
✅ **Countdown timer visible**  
❌ **Cannot edit after 15 minutes**  
❌ **Cannot view/edit others' customers**  
❌ **Cannot see Assign Agent section**  
❌ **Cannot see Evaluation & Status section**

---

## 📊 Quick Comparison Matrix

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|-----------|-------|-------------|-------|-----------|
| **View All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Customers** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Edit All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Assigned** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Edit Own (15min)** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Delete Customers** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assign Agents** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Evaluation Section** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Create Users** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Users** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manage Superadmin** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 Role Badges in User List

When viewing User Management, verify the badge colors:

| Role | Badge Color | Text |
|------|-------------|------|
| Superadmin | 🔴 Red/Rose | "Super Admin" |
| Admin | 🟣 Purple/Violet | "Admin" |
| **Super Agent** | 🟠 **Amber/Orange** | **"Super Agent"** ⭐ |
| Agent | 🔵 Blue | "Agent" |
| Data Entry | 🟢 Green/Emerald | "Data Entry" |

---

## 🔄 Cascading Dropdowns Test (All Roles)

**Test with any authenticated role:**

1. [ ] Go to **"Create Customer"** page
2. [ ] Select **"Study Destination"** (e.g., "Turkey")
3. [ ] **"Desired University"** dropdown auto-populates
4. [ ] Select a university
5. [ ] **"Desired College"** dropdown auto-populates
6. [ ] Select a college
7. [ ] Save customer
8. [ ] Verify saved data includes university and college

**Expected Result:**
✅ Works for all authenticated users  
❌ Unauthenticated users get 401 error

---

## 🎓 Degree Types Test (All Roles with Create Permission)

**Test with: Superadmin, Admin, Super Agent, or Data Entry**

### Bachelor:
1. [ ] Select **"Bachelor"** degree type
2. [ ] Common fields **visible** (Grade, Rating, System, Year)
3. [ ] Certificate Track field **visible**
4. [ ] Save and verify

### Master:
5. [ ] Select **"Master"** degree type
6. [ ] Common fields **NOT visible**
7. [ ] **"Bachelor's Degree Information"** section **visible** (8 fields)
8. [ ] Save and verify

### PhD:
9. [ ] Select **"PhD"** degree type
10. [ ] Common fields **NOT visible**
11. [ ] **"Bachelor's Degree Information"** section **visible** (10 fields)
12. [ ] **"Master's Degree Information"** section **visible** (12 fields)
13. [ ] Save and verify

**Expected Result:**
✅ All 3 degree types work correctly

---

## ✅ Final Checklist

### User Management:
- [ ] Super Agent appears in role dropdown (Create User)
- [ ] Super Agent appears in role dropdown (Edit User)
- [ ] Super Agent badge shows as **amber/orange**
- [ ] Super Agent label shows as **"Super Agent"**
- [ ] Admin cannot edit superadmin users
- [ ] Admin cannot create superadmin users

### Super Agent Role:
- [ ] Cannot access User Management page
- [ ] Can view all customers
- [ ] Can create customers
- [ ] Can edit all customers
- [ ] Can assign/reassign agents
- [ ] Can access Evaluation & Status section
- [ ] Edit button visible for all customers

### All Other Roles:
- [ ] Superadmin - Full access
- [ ] Admin - Full access except delete & superadmin management
- [ ] Agent - Assigned customers only
- [ ] Data Entry - Own customers with 15-minute window

### General Features:
- [ ] Cascading dropdowns work for all authenticated users
- [ ] All 3 degree types work correctly
- [ ] Permission checks on both frontend and backend
- [ ] Audit logging for all actions

---

## 🚨 Common Issues to Check

### Issue 1: Super Agent Not in Dropdown
**Check:** `pages/crm/users/index.js` - Create and Edit modals
**Fix:** Add `<option value="superagent">Super Agent</option>`

### Issue 2: Super Agent Can Access User Management
**Check:** `pages/crm/users/index.js` - Access check
**Fix:** Only allow `admin` and `superadmin`, NOT `superagent`

### Issue 3: Super Agent Cannot Edit Customers
**Check:** `lib/permissions.js` - `canEditCustomer()` function
**Fix:** Add `|| role === 'superagent'` to condition

### Issue 4: Badge Color Wrong
**Check:** `pages/crm/users/index.js` - `getRoleBadge()` function
**Fix:** Add `'superagent': 'bg-amber-100 text-amber-700'`

### Issue 5: Role Shows as "superagent" Instead of "Super Agent"
**Check:** `pages/crm/users/index.js` - Display in table
**Fix:** Use `getRoleLabel(user.role)` instead of `user.role`

---

## 📊 Test Results Template

| Test | Role | Expected | Actual | Pass/Fail |
|------|------|----------|--------|-----------|
| Create Super Agent User | Admin | ✅ Works | | [ ] |
| Super Agent Badge Color | Admin | 🟠 Amber | | [ ] |
| Super Agent View All Customers | Super Agent | ✅ Works | | [ ] |
| Super Agent Edit Any Customer | Super Agent | ✅ Works | | [ ] |
| Super Agent Access User Mgmt | Super Agent | ❌ Blocked | | [ ] |
| Agent View Non-Assigned | Agent | ❌ Blocked | | [ ] |
| Data Entry 15min Window | Data Entry | ✅ Works | | [ ] |
| Cascading Dropdowns | All | ✅ Works | | [ ] |
| All Degree Types | All | ✅ Works | | [ ] |

---

## 🎯 Success Criteria

### All Tests Pass When:
1. ✅ Super Agent role appears in user creation dropdown
2. ✅ Super Agent role appears in user edit dropdown
3. ✅ Super Agent badge shows with correct color (amber)
4. ✅ Super Agent label shows as "Super Agent" (not "superagent")
5. ✅ Super Agent can manage all customers (like Admin)
6. ✅ Super Agent CANNOT access User Management
7. ✅ All other roles work as documented
8. ✅ Cascading dropdowns work for all authenticated users
9. ✅ All 3 degree types work correctly
10. ✅ No linter errors

---

**Testing Time:** ~30-45 minutes for complete test  
**Last Updated:** January 8, 2026  
**Status:** Ready for Testing ✅

---

**🧪 Complete this testing guide to ensure all 5 roles work perfectly!**
