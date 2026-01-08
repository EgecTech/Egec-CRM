# 🚀 Quick Permissions Test Checklist

## ⚡ Fast Testing Guide

Use this checklist to quickly verify that all permissions are working correctly.

---

## 🔹 Test 1: Superadmin (2 minutes)

**Login:** superadmin@example.com

### Quick Actions:
1. [ ] Dashboard shows "All Customers" stats
2. [ ] Can see "User Management" in menu
3. [ ] Can create customer
4. [ ] Can edit any customer
5. [ ] Edit button visible on all customer profiles

**Expected:** ✅ All actions work

---

## 🔹 Test 2: Admin (2 minutes)

**Login:** admin@example.com

### Quick Actions:
1. [ ] Dashboard shows "All Customers" stats
2. [ ] Can see "User Management" in menu (but cannot manage superadmin users)
3. [ ] Can create customer
4. [ ] Can edit any customer
5. [ ] Edit button visible on all customer profiles

**Expected:** ✅ All actions work, ❌ Cannot manage superadmin users

---

## 🔹 Test 3: Agent (3 minutes)

**Login:** agent@example.com

### Quick Actions:
1. [ ] Dashboard shows only "Assigned Customers" stats
2. [ ] Customer list shows only assigned customers
3. [ ] Cannot see "Create Customer" button
4. [ ] Can view assigned customer profile
5. [ ] Edit button visible ONLY on assigned customer profiles
6. [ ] Cannot see "User Management" in menu
7. [ ] Try to access non-assigned customer → Should fail with 403

**Expected:** ✅ Can only see/edit assigned customers

---

## 🔹 Test 4: Data Entry (5 minutes) ⏱️

**Login:** dataentry@example.com

### Step 1: Create Customer
1. [ ] Dashboard shows only "Own Customers" stats
2. [ ] Can see "Create Customer" button
3. [ ] Click "Create Customer"
4. [ ] Notice: No "Assign Agent" section
5. [ ] Notice: No "Evaluation & Status" section
6. [ ] Fill form and save

### Step 2: Edit Within 15 Minutes
7. [ ] Open just-created customer profile
8. [ ] Should see: "⏱️ You can edit this customer for the next X minutes"
9. [ ] Edit button is visible
10. [ ] Click "Edit"
11. [ ] Should see: "⏱️ Edit Window Active - You have X minutes remaining"
12. [ ] Make changes and save → Should work ✅

### Step 3: Simulate After 15 Minutes
**Option A: Wait 15+ minutes** (slow)

**Option B: Database Hack** (fast, for testing only):
```javascript
// In MongoDB or using MongoDB Compass:
// Find your customer and update createdAt to 20 minutes ago
db.customers.updateOne(
  { customerNumber: "YOUR_CUSTOMER_NUMBER" },
  { $set: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } }
)
```

13. [ ] Refresh customer profile
14. [ ] Should see: "🔒 Your 15-minute edit window has expired"
15. [ ] Edit button is NOT visible
16. [ ] Try to access edit page directly → Should show error message
17. [ ] Try to save changes via API → Should fail with 403

### Step 4: Other Users' Customers
18. [ ] Try to view customer created by another user → Should fail with 403
19. [ ] Customer list shows only own created customers

**Expected:** 
- ✅ Can edit own customers within 15 minutes
- ❌ Cannot edit after 15 minutes
- ❌ Cannot view/edit others' customers

---

## 🔹 Test 5: Cascading Dropdowns (1 minute)

**Login:** Any role

1. [ ] Go to "Create Customer"
2. [ ] Select "Study Destination" (e.g., Turkey)
3. [ ] "Desired University" auto-populates
4. [ ] Select a university
5. [ ] "Desired College" auto-populates
6. [ ] Select college and save

**Expected:** ✅ Works for all authenticated users

---

## 🔹 Test 6: Degree Types (2 minutes)

**Login:** Any role with create permission

### Bachelor:
1. [ ] Select "Bachelor" degree type
2. [ ] Common fields visible (Grade, Rating, System, Year)
3. [ ] Certificate Track field visible

### Master:
4. [ ] Select "Master" degree type
5. [ ] Common fields NOT visible
6. [ ] "Bachelor's Degree Information" section visible (8 fields)

### PhD:
7. [ ] Select "PhD" degree type
8. [ ] Common fields NOT visible
9. [ ] "Bachelor's Degree Information" section visible (10 fields)
10. [ ] "Master's Degree Information" section visible (12 fields)

**Expected:** ✅ All 3 degree types work correctly

---

## 📊 Test Results Summary

| Test | Expected Time | Pass/Fail |
|------|--------------|-----------|
| Superadmin | 2 min | [ ] |
| Admin | 2 min | [ ] |
| Agent | 3 min | [ ] |
| Data Entry (15-min window) | 5 min | [ ] |
| Cascading Dropdowns | 1 min | [ ] |
| Degree Types | 2 min | [ ] |
| **Total** | **15 min** | **[ ]** |

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution:** Make sure you're logged in

### Issue: "Cannot see other customers"
**Solution:** This is correct for Agent/Data Entry roles

### Issue: "Edit button disappeared after 15 minutes"
**Solution:** This is correct for Data Entry role

### Issue: "Cannot create superadmin user"
**Solution:** This is correct for Admin role (only Superadmin can)

### Issue: "Cascading dropdowns not working"
**Solution:** Check if you're logged in with session authentication

---

## ✅ All Tests Passed?

If all tests pass:
- ✅ Permission system is working correctly
- ✅ All roles are properly configured
- ✅ Frontend and backend security is in place
- ✅ Data Entry 15-minute window is enforced
- ✅ Cascading dropdowns are secured
- ✅ Degree types are working correctly

---

## 🔧 Database Test Helper (Optional)

To quickly test Data Entry 15-minute window without waiting:

```javascript
// Connect to MongoDB and run:

// 1. Create test customer as Data Entry
// 2. Get customer number (e.g., "CRM-2026-0001")

// 3. Set createdAt to 5 minutes ago (should still be editable)
db.customers.updateOne(
  { customerNumber: "CRM-2026-0001" },
  { $set: { createdAt: new Date(Date.now() - 5 * 60 * 1000) } }
)
// Result: Edit button visible, countdown shows ~10 minutes

// 4. Set createdAt to 20 minutes ago (should NOT be editable)
db.customers.updateOne(
  { customerNumber: "CRM-2026-0001" },
  { $set: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } }
)
// Result: Edit button hidden, warning shown

// 5. Reset to now (restore for further testing)
db.customers.updateOne(
  { customerNumber: "CRM-2026-0001" },
  { $set: { createdAt: new Date() } }
)
```

---

**Testing Time:** 15 minutes  
**Last Updated:** January 8, 2026  
**Status:** Ready for Testing ✅
