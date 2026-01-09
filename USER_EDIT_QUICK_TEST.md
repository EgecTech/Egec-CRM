# ✅ User Edit - Quick 3-Minute Test

**Quick manual test to verify user edit permissions work correctly**

---

## 🎯 Test as Superadmin (2 minutes)

### ✅ Step 1: Edit an Agent User

1. **Login as Superadmin**
2. **Go to User Management:** `/crm/users`
3. **Find an Agent user**
4. **Click Edit button (pencil icon)**
5. **Verify Modal:**
   - [ ] Name field: ✅ Editable
   - [ ] Email field: ✅ Editable
   - [ ] Phone field: ✅ Editable
   - [ ] Role dropdown: ✅ Enabled (all roles visible)
   - [ ] Password field: ✅ Can enter new password
6. **Make changes:**
   - Change name to "Test User Updated"
   - Change role to "Super Agent"
7. **Click "Save Changes"**
8. **Verify:**
   - [ ] Modal closes
   - [ ] User list refreshes
   - [ ] Changes appear in table

**Expected:** ✅ All changes save successfully

---

### ✅ Step 2: Try to Edit Own Account

1. **Find your own account** (Superadmin)
2. **Click Edit**
3. **Try to change role**
4. **Verify:**
   - [ ] Can edit name, email, phone ✅
   - [ ] Role change should be blocked (try saving and check console)

**Expected:** ✅ Can edit profile BUT cannot change own role

---

## 🎯 Test as Admin (1 minute)

### ✅ Step 1: Edit an Agent User

1. **Login as Admin**
2. **Go to User Management**
3. **Find an Agent user**
4. **Click Edit**
5. **Verify Modal:**
   - [ ] Name field: ✅ Editable
   - [ ] Email field: ✅ Editable
   - [ ] Phone field: ✅ Editable
   - [ ] Role dropdown: ❌ **DISABLED** with message "Only superadmin can change roles"
   - [ ] Password field: ✅ Can enter new password
6. **Make changes:**
   - Change name
   - Change email
7. **Click "Save Changes"**

**Expected:** ✅ Changes save (except role)

---

### ✅ Step 2: Try to Edit Superadmin/Admin

1. **Find a Superadmin or another Admin user**
2. **Look at Edit button**
3. **Verify:**
   - [ ] Edit button is **grayed out** (opacity 30%)
   - [ ] Cursor shows "not-allowed" when hovering
   - [ ] Button is **disabled** (cannot click)

**Expected:** ✅ Cannot edit admin/superadmin accounts

---

### ✅ Step 3: Try to Edit Own Account

1. **Find your own account** (Admin)
2. **Click Edit**
3. **Verify:**
   - [ ] Can edit name, email, phone ✅
   - [ ] Role dropdown **DISABLED** ❌
   - [ ] Cannot change own role

**Expected:** ✅ Can edit profile but not role

---

## 🎯 Test as Agent (30 seconds)

### ✅ Step 1: Try to Access User Management

1. **Login as Agent**
2. **Try to navigate to:** `/crm/users`
3. **Verify:**
   - [ ] Redirected to `/crm/dashboard` automatically
   - [ ] Cannot access the page

**Expected:** ✅ Access denied, redirected to dashboard

---

## 🚨 Red Flags (Things That Should NOT Happen)

### ❌ If you see these, there's a problem:

1. **Admin can click Edit on Superadmin**
   - Edit button should be disabled

2. **Admin can change roles**
   - Role dropdown should be disabled

3. **Agent can access User Management page**
   - Should be redirected

4. **User can change own role**
   - Should be blocked (check API response)

5. **Changes not saving**
   - Check console for errors

6. **Role changes when Admin edits**
   - API should block role change

---

## ✅ Pass Criteria

### Test PASSES if:

| Scenario | Expected Result | ✅/❌ |
|----------|----------------|------|
| Superadmin edits Agent | ✅ All fields editable, saves | [ ] |
| Superadmin changes role | ✅ Role change works | [ ] |
| Admin edits Agent | ✅ Name/email/password editable | [ ] |
| Admin tries to change role | ❌ Dropdown disabled | [ ] |
| Admin tries to edit Superadmin | ❌ Button disabled | [ ] |
| Agent tries to access page | ❌ Redirected to dashboard | [ ] |

---

## 🔍 How to Check Results

### In Browser Console (F12):

1. **Look for errors:**
   - Should be NO red errors during edit

2. **Check API responses:**
   - Look in Network tab
   - Edit request should return 200 OK (success)
   - Unauthorized edits should return 403 Forbidden

3. **Check actual changes:**
   - Open MongoDB Compass
   - Check `frontenduser` collection
   - Verify changes are saved

---

## 📊 Quick Reference - Who Can Do What?

| Action | Superadmin | Admin | Agent |
|--------|-----------|-------|-------|
| Access User Management | ✅ Yes | ✅ Yes | ❌ No |
| Edit Agent user | ✅ Yes | ✅ Yes | ❌ No |
| Edit Admin user | ✅ Yes | ❌ No | ❌ No |
| Edit Superadmin user | ✅ Yes | ❌ No | ❌ No |
| Change roles | ✅ Yes | ❌ No | ❌ No |
| Change own role | ❌ No | ❌ No | ❌ No |
| Change passwords | ✅ Yes | ✅ Yes (non-admin) | ❌ No |
| Activate/Deactivate | ✅ Yes | ❌ No | ❌ No |

---

## 🎯 Test Log

**Use this to track your tests:**

```
Date: __________
Tester: __________

[ ] Test 1: Superadmin edits Agent - PASS/FAIL
[ ] Test 2: Superadmin tries to edit own role - PASS/FAIL
[ ] Test 3: Admin edits Agent - PASS/FAIL
[ ] Test 4: Admin role dropdown disabled - PASS/FAIL
[ ] Test 5: Admin cannot edit Superadmin - PASS/FAIL
[ ] Test 6: Agent redirected from page - PASS/FAIL

Overall Result: _______________
```

---

## 🆘 Troubleshooting

### Problem: Changes not saving

**Check:**
1. Console errors?
2. Network tab - what's the API response?
3. MongoDB - is data actually changing?

### Problem: Edit button not disabled for Admin

**Check:**
1. Are you really logged in as Admin?
2. Check session: `console.log(session.user.role)`
3. Hard refresh page (Ctrl+Shift+R)

### Problem: Agent can access page

**Check:**
1. Clear browser cache
2. Logout and login again
3. Check role in database

---

**Test Duration:** 3-5 minutes  
**Difficulty:** Easy  
**Required:** Admin/Superadmin + Agent accounts for testing
