# 🧪 System Testing Guide - Quick Manual Tests

**Last Updated:** January 8, 2026  
**Purpose:** Quick manual testing before and after deployment

---

## 🎯 Critical Path Testing (15 minutes)

### Test 1: Authentication & Session ✅
```
1. Open browser incognito/private window
2. Go to /auth/signin
3. Try login with wrong password → Should show error
4. Try login 6 times quickly → Should rate limit
5. Login with correct credentials → Should redirect to dashboard
6. Check session persists on page refresh
7. Open another tab → Should be logged in
8. Logout → Should redirect to signin
9. Try to access /crm/customers directly → Should redirect to signin
```

**Expected Results:**
- ✅ Wrong credentials rejected
- ✅ Rate limiting works
- ✅ Successful login redirects
- ✅ Session persists
- ✅ Protected routes secured

---

### Test 2: Superadmin Capabilities ✅
```
1. Login as Superadmin
2. Go to /crm/customers
   - Should see ALL customers
   - Should see Agent column
   - Should see degree type tabs with all counts
3. Go to /crm/customers/create
   - Should see Marketing Data step
   - Should see all fields
4. Create test customer (Bachelor)
5. View customer profile
   - Should see Marketing Data tab
   - Should see all tabs
6. Edit customer
   - Should see Marketing Data section
   - Should be able to assign agent
7. Go to /crm/users
   - Should see user management
   - Should be able to create Superadmin
8. Go to /crm/audit-logs
   - Should have access
```

**Expected Results:**
- ✅ Full system access
- ✅ Can see marketing data
- ✅ Can manage users
- ✅ Can access audit logs

---

### Test 3: Admin Capabilities ✅
```
1. Create Admin user (as Superadmin)
2. Logout and login as Admin
3. Go to /crm/customers
   - Should see ALL customers
   - Should see Agent column
   - Should see degree type tabs
4. Create customer
   - Should see Marketing Data step
5. View/Edit customer
   - Should see Marketing Data
   - Should be able to assign agent
6. Go to /crm/users
   - Should see user management
   - Should NOT see option to create Superadmin
7. Go to /crm/audit-logs
   - Should redirect to dashboard (no access)
8. Go to /crm/reports
   - Should have access
```

**Expected Results:**
- ✅ Can see all customers
- ✅ Can see marketing data
- ✅ Can manage users (except superadmin)
- ✅ Cannot access audit logs

---

### Test 4: Super Agent Capabilities ✅
```
1. Create Super Agent user (as Admin)
2. Logout and login as Super Agent
3. Go to /crm/customers
   - Should see ALL customers
   - Should see Agent column
   - Should see degree type tabs
4. Create customer
   - Should NOT see Marketing Data step (starts from Basic Data)
5. View customer profile
   - Should NOT see Marketing Data tab
6. Edit customer
   - Should NOT see Marketing Data section
   - Should be able to assign agent
7. Go to /crm/users
   - Should redirect to dashboard (no access)
8. Go to /crm/reports
   - Should have access
```

**Expected Results:**
- ✅ Can see all customers
- ✅ Cannot see marketing data
- ✅ Cannot manage users
- ✅ Can access reports
- ✅ Can assign customers

---

### Test 5: Agent Capabilities ✅
```
1. Create Agent user (as Admin)
2. Assign 3-5 test customers to this agent
3. Logout and login as Agent
4. Go to /crm/customers
   - Should see ONLY assigned customers
   - Should NOT see Agent column
   - Should see degree type tabs (with own customer counts)
5. Try to access unassigned customer directly
   - Should get 403 or redirect
6. Create customer
   - Should NOT see Marketing Data step
   - Customer should auto-assign to self
7. Edit assigned customer
   - Should work
   - Should NOT see Marketing Data
   - Should NOT see Assign Agent field
8. View customer profile
   - Should work for assigned customers
   - Should NOT see Marketing Data tab
9. Test Filters:
   - Click Filters button → Should open
   - Should see Counselor Status filter
   - Should NOT see Agent filter (redundant)
   - Should see Date filters
   - Apply filter: Counselor Status = "New"
   - Should only show assigned customers with that status
10. Test Degree Tabs:
    - Click Bachelor tab
    - Should show count and list of assigned bachelor customers
    - Click Master tab
    - Should show count and list of assigned master customers
11. Search:
    - Search by customer name
    - Should only search in assigned customers
12. Go to /crm/users
    - Should redirect to dashboard (no access)
13. Go to /crm/reports
    - Should redirect to dashboard (no access)
14. Go to /crm/followups
    - Should have access
    - Should see only assigned follow-ups
```

**Expected Results:**
- ✅ Can see only assigned customers
- ✅ Agent column hidden
- ✅ Cannot see marketing data
- ✅ Cannot manage users
- ✅ Cannot access reports
- ✅ Filters work on assigned customers
- ✅ Degree tabs show assigned customer counts
- ✅ Search limited to assigned customers

---

### Test 6: Data Entry Capabilities ✅
```
1. Create Data Entry user (as Admin)
2. Logout and login as Data Entry
3. Go to /crm/customers
   - Should see ONLY own created customers
   - Should NOT see Agent column
   - Should see degree type tabs
4. Create customer
   - Should NOT see Marketing Data step
5. Edit own customer (within 15 minutes)
   - Should work
6. Wait 16 minutes
7. Try to edit same customer
   - Should fail or show read-only
8. Try to view other user's customer
   - Should get 403 or not in list
9. Go to /crm/followups
   - Should redirect to dashboard (no access)
10. Go to /crm/users
    - Should redirect to dashboard (no access)
11. Test Filters:
    - Should work on own customers only
    - Degree tabs should show own customer counts
```

**Expected Results:**
- ✅ Can see only own created customers
- ✅ Can edit within 15 minutes only
- ✅ Cannot access follow-ups
- ✅ Cannot manage users
- ✅ Filters work on own customers

---

### Test 7: Cascading Dropdowns ✅
```
1. Login as any user
2. Go to /crm/customers/create
3. In Marketing Data step (if visible):
   - Select Study Destination: "USA"
   - University dropdown should populate with USA universities
   - Select a university
   - College dropdown should populate with that university's colleges
   - Select a college
4. Change Study Destination to "UK"
   - University dropdown should reset and show UK universities
   - College dropdown should reset
5. In Desired Program step:
   - University and College should follow same cascade
```

**Expected Results:**
- ✅ Dropdowns cascade correctly
- ✅ Resetting parent clears children
- ✅ Data loads from correct APIs

---

### Test 8: Degree Type Functionality ✅
```
1. Create customer with degreeType: Bachelor
   - Should show only relevant Bachelor fields
2. View customer profile
   - Should show Bachelor qualification fields
3. Edit customer, change degreeType to Master
   - Should show Bachelor's degree info section
   - Should NOT show duplicate common fields
4. Save and view
   - Should display correctly
5. Edit again, change to PhD
   - Should show both Bachelor and Master sections
   - Should NOT show duplicate common fields
6. Save and view
   - Should display all nested qualifications
```

**Expected Results:**
- ✅ Degree type selector works
- ✅ Conditional fields display correctly
- ✅ No duplicate fields for Master/PhD
- ✅ Nested qualifications saved properly

---

### Test 9: Filters & Search ✅
```
1. Login as Admin
2. Go to /crm/customers
3. Test Search:
   - Search by customer name → Should find
   - Search by phone → Should find
   - Search by email → Should find
   - Search by customer number → Should find
4. Test Counselor Status Filter:
   - Select "New" → Should filter
   - Clear → Should show all
5. Test Agent Filter:
   - Select specific agent → Should filter
   - Clear → Should show all
6. Test Date Range:
   - Set From: 2026-01-01, To: 2026-01-31
   - Should filter by creation date
7. Test Degree Tabs:
   - Click Bachelor → Should show only bachelor customers
   - Click Master → Should show only master customers
   - Click PhD → Should show only phd customers
   - Click All → Should show all
8. Test Multiple Filters Together:
   - Select Bachelor tab + Counselor Status "New" + Date range
   - Should apply all filters correctly
```

**Expected Results:**
- ✅ Search works across all fields
- ✅ All filters work independently
- ✅ Multiple filters work together
- ✅ Clearing filters resets correctly

---

### Test 10: Performance & Edge Cases ✅
```
1. Large Data:
   - With 100+ customers, check page load time
   - Should load within 2-3 seconds
   - Pagination should work smoothly
2. Special Characters:
   - Create customer with name: "أحمد O'Brien"
   - Should save and display correctly
3. Empty States:
   - Agent with no assigned customers
   - Should show "No customers found" message
4. Network Issues:
   - Disable network, try to save
   - Should show error message
   - Re-enable network, try again
   - Should work
5. Session Expiry:
   - Wait 48+ hours or clear session
   - Try to access protected route
   - Should redirect to login
```

**Expected Results:**
- ✅ Good performance with large data
- ✅ Special characters handled
- ✅ Empty states display properly
- ✅ Network errors handled gracefully
- ✅ Session expiry handled

---

## 🐛 Known Issues to Check

### Issue 1: Duplicate Phone/Email
```
Test:
1. Create customer with phone: +1234567890
2. Try to create another with same phone
3. Should reject with "Duplicate customer" error
```
**Expected:** ✅ Duplicate detection works

### Issue 2: Agent Filter Hidden
```
Test:
1. Login as Agent
2. Go to customers page
3. Click Filters
4. Agent dropdown should NOT be visible
```
**Expected:** ✅ Agent filter hidden for Agent role

### Issue 3: Marketing Data Hidden
```
Test:
1. Login as Agent or Super Agent
2. Create customer
3. Step 1 should be Basic Data (not Marketing Data)
4. View customer profile
5. Marketing Data tab should NOT be visible
```
**Expected:** ✅ Marketing data properly hidden

---

## 📊 Performance Benchmarks

### Page Load Times (Target)
- Dashboard: < 1.5s
- Customer List (20 items): < 2s
- Customer Profile: < 1.5s
- Create Customer Form: < 1s

### API Response Times (Target)
- GET /api/crm/customers: < 500ms (with pagination)
- GET /api/crm/customers/[id]: < 200ms
- POST /api/crm/customers: < 1s
- GET /api/crm/customers/stats: < 300ms (with cache)

### Database Performance
- Text search: < 100ms
- Filtered queries: < 200ms
- Aggregation (stats): < 500ms

**Test with:**
```bash
# Install Artillery for load testing (optional)
npm install -g artillery

# Create test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
    - get:
        url: "/api/crm/customers?page=1&limit=20"
EOF

# Run test
artillery run load-test.yml
```

---

## ✅ Test Results Template

Copy and fill this after testing:

```markdown
## Test Results - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- User: [Role]

### Critical Path Tests
- [ ] Test 1: Authentication ✅/❌
- [ ] Test 2: Superadmin ✅/❌
- [ ] Test 3: Admin ✅/❌
- [ ] Test 4: Super Agent ✅/❌
- [ ] Test 5: Agent ✅/❌
- [ ] Test 6: Data Entry ✅/❌
- [ ] Test 7: Cascading Dropdowns ✅/❌
- [ ] Test 8: Degree Types ✅/❌
- [ ] Test 9: Filters & Search ✅/❌
- [ ] Test 10: Performance ✅/❌

### Issues Found
1. [Description of issue]
   - Severity: High/Medium/Low
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

### Performance Metrics
- Dashboard load: [time]
- Customer list load: [time]
- Search response: [time]

### Recommendation
✅ Ready for deployment
⚠️ Deploy with caution
❌ Do not deploy
```

---

## 🚨 Critical Blockers

**DO NOT DEPLOY if any of these fail:**

1. ❌ Cannot login at all
2. ❌ Agent can see other agents' customers
3. ❌ Data Entry can edit after 15 minutes
4. ❌ Super Agent can access user management
5. ❌ Marketing data visible to non-admin users
6. ❌ Database connection fails
7. ❌ Session doesn't persist
8. ❌ Critical API returns 500 errors

---

## 📞 Reporting Issues

When reporting issues, include:

1. **Environment**
   - Browser & version
   - OS
   - User role
   - Timestamp

2. **Steps to Reproduce**
   - Detailed step-by-step
   - Include URLs
   - Include data entered

3. **Expected vs Actual**
   - What should happen
   - What actually happened

4. **Screenshots/Videos**
   - Include if helpful

5. **Console Errors**
   - Open browser DevTools
   - Check Console tab
   - Copy any errors

---

**Test Early, Test Often, Test Thoroughly! 🧪**
