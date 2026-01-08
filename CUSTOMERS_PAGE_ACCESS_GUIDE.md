# 📊 Customers Page Access Guide

## 🎯 Overview

This guide explains how the Customers page (`/crm/customers`) works for each user role, including what they can see and do.

---

## 👥 Role-Based Access

### ✅ Who Can Access `/crm/customers`:

| Role | Can Access | What They See |
|------|-----------|---------------|
| **Superadmin** | ✅ Yes | All customers |
| **Admin** | ✅ Yes | All customers |
| **Super Agent** | ✅ Yes | All customers |
| **Agent** | ✅ Yes | **Assigned customers only** |
| **Data Entry** | ❌ No | Redirected to dashboard |

---

## 🎨 UI Differences by Role

### 1️⃣ Superadmin / Admin / Super Agent

#### Header:
```
All Customers
Manage and track customer records
[New Customer] button
```

#### Features Visible:
- ✅ **Degree Type Tabs** (All, Bachelor, Master, PhD)
- ✅ **All Filters** (Counselor Status, Agent, Date Range)
- ✅ **Search** (Name, Phone, Email, Customer Number)
- ✅ **Export** button
- ✅ **Statistics** for each degree type

#### What They See:
- **All customers** in the system
- Can filter by agent
- Can filter by date range
- Can filter by degree type
- Can see statistics

---

### 2️⃣ Agent (agent, egecagent, studyagent, edugateagent)

#### Header:
```
Assigned Customers
Manage your assigned customer records
[NO New Customer button]
```

#### Features Visible:
- ❌ **NO Degree Type Tabs**
- ✅ **Search** (Name, Phone, Email, Customer Number)
- ❌ **NO Filters** (Counselor Status, Agent, Date Range)
- ❌ **NO Export** button
- ❌ **NO Statistics**

#### What They See:
- **Only customers assigned to them**
- API automatically filters: `assignment.assignedAgentId === userId`
- Simple list view
- Search functionality

#### Backend Query:
```javascript
// In buildCustomerQuery() from lib/permissions.js
if (role === 'agent' || role === 'egecagent' || ...) {
  query['assignment.assignedAgentId'] = userId;
}
```

---

### 3️⃣ Data Entry

#### Access:
- ❌ **Cannot access `/crm/customers`**
- Redirected to `/crm/dashboard`

#### Why?
- Data Entry users only work with their own created customers
- They don't need a full customer list page
- They can see their customers from dashboard

---

## 🔍 Search Functionality (All Roles)

**Searches in:**
- ✅ Customer Name
- ✅ Customer Phone
- ✅ Customer Email
- ✅ Customer Number (CRM-2026-0001)

**Works for:**
- ✅ Admin (searches all customers)
- ✅ Agent (searches assigned customers only)

---

## 📊 Degree Type Tabs (Admin Only)

**Tabs:**
1. 📊 All Customers (200,000)
2. 🔵 Bachelor (120,000)
3. 🟣 Master (60,000)
4. 🟢 PhD (20,000)

**Why Hidden for Agents?**
- Agents only see assigned customers (typically 10-100)
- Tabs are useful for large datasets
- Agents don't need degree-based filtering

---

## 🔧 Technical Implementation

### Access Control

```javascript
// In pages/crm/customers/index.js

const isAdmin = role === 'superadmin' || role === 'admin' || role === 'superagent';
const isAgent = role === 'agent' || role === 'egecagent' || role === 'studyagent' || role === 'edugateagent';
const canAccessCustomers = isAdmin || isAgent;

// Only Data Entry cannot access this page
if (status === 'authenticated' && !canAccessCustomers) {
  router.push('/crm/dashboard');
  return null;
}
```

### Conditional UI Rendering

```javascript
// Header text
<h1>
  {isAdmin ? 'All Customers' : isAgent ? 'Assigned Customers' : 'My Customers'}
</h1>

// Degree Type Tabs - Only for Admin
{isAdmin && (
  <div>
    {/* Degree Type Tabs */}
  </div>
)}

// Filters - Only for Admin
{showFilters && isAdmin && (
  <div>
    {/* Filters Panel */}
  </div>
)}
```

### API Query Filtering

```javascript
// API automatically filters based on role
const baseQuery = buildCustomerQuery(role, userId);

// For Admin: { isDeleted: false }
// For Agent: { isDeleted: false, 'assignment.assignedAgentId': userId }
// For Data Entry: { isDeleted: false, createdBy: userId }
```

---

## 🧪 Testing

### Test 1: Agent Access

1. **Login as Agent**
2. **Go to `/crm/customers`**
3. **Expected Result:**
   - ✅ Page loads successfully
   - ✅ Header shows "Assigned Customers"
   - ❌ NO degree type tabs
   - ✅ Search bar visible
   - ❌ NO filters
   - ❌ NO "New Customer" button
   - ✅ List shows only assigned customers

### Test 2: Agent with No Assigned Customers

1. **Login as Agent** (with no assignments)
2. **Go to `/crm/customers`**
3. **Expected Result:**
   - ✅ Page loads
   - ✅ Empty state message
   - ✅ No customers listed

### Test 3: Agent Search

1. **Login as Agent** (with some assigned customers)
2. **Search for a customer name**
3. **Expected Result:**
   - ✅ Search works
   - ✅ Only searches in assigned customers
   - ✅ Cannot see other agents' customers

### Test 4: Data Entry Redirect

1. **Login as Data Entry**
2. **Try to access `/crm/customers`**
3. **Expected Result:**
   - ❌ Cannot access
   - ✅ Redirected to `/crm/dashboard`

---

## 📋 Comparison Table

| Feature | Superadmin/Admin | Super Agent | Agent | Data Entry |
|---------|-----------------|-------------|-------|-----------|
| **Access Page** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **See All Customers** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **See Assigned** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Degree Type Tabs** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Date Filters** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Agent Filter** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Search** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Export** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **New Customer** | ✅ Yes | ✅ Yes | ❌ No | ✅ Via Dashboard |
| **Statistics** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

---

## 🔄 User Flow Examples

### Flow 1: Agent Views Assigned Customers

```
1. Agent logs in
2. Clicks "Customers" in menu
3. Page loads showing "Assigned Customers" (15 customers)
4. Agent sees simple list of assigned customers
5. Agent can search by name/phone
6. Agent clicks customer to view details
7. Agent can edit customer if assigned
```

### Flow 2: Admin Views All Customers

```
1. Admin logs in
2. Clicks "Customers" in menu
3. Page loads showing "All Customers" (200,000 customers)
4. Admin sees degree type tabs
5. Admin clicks "Bachelor" tab → Shows 120,000 bachelor customers
6. Admin applies date filter → Shows customers from Jan 2024
7. Admin searches by name → Finds specific customer
8. Admin clicks customer to view/edit
```

### Flow 3: Data Entry Tries to Access

```
1. Data Entry logs in
2. Tries to access /crm/customers directly
3. System redirects to /crm/dashboard
4. Data Entry sees only their own customers on dashboard
5. Data Entry can create new customer from dashboard
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Agent Cannot Access Customers Page

**Problem:** Agent is redirected to dashboard

**Solution:**
- ✅ Fixed! Agents can now access the page
- Check: `const canAccessCustomers = isAdmin || isAgent;`

### Issue 2: Agent Sees All Customers

**Problem:** Agent sees customers not assigned to them

**Solution:**
- Check API filtering: `buildCustomerQuery(role, userId)`
- Verify `assignment.assignedAgentId` is correct in database

### Issue 3: Agent Sees Degree Tabs

**Problem:** Agent sees degree type tabs (confusing)

**Solution:**
- ✅ Fixed! Tabs now hidden for agents
- Check: `{isAdmin && <DegreeTypeTabs />}`

### Issue 4: Empty List for Agent

**Problem:** Agent sees "No customers" even though they have assignments

**Possible Causes:**
1. No customers assigned to this agent
2. Agent ID mismatch in database
3. All assigned customers are soft-deleted (`isDeleted: true`)

**Solution:**
```javascript
// Check in database
db.customers.find({
  'assignment.assignedAgentId': ObjectId('agent_id_here'),
  isDeleted: false
})
```

---

## 📊 Performance Notes

### For Agents (Small Dataset):
- **Typical:** 10-100 assigned customers
- **Query Time:** < 50ms
- **Page Load:** Very fast (< 200ms)
- **No Caching Needed:** Small dataset

### For Admins (Large Dataset):
- **Typical:** 200,000+ total customers
- **Query Time:** 100-300ms (with indexes)
- **Page Load:** < 500ms (with pagination)
- **Caching:** Statistics cached for 5 minutes
- **Pagination:** 20 customers per page

---

## ✅ Summary

### Key Points:
1. ✅ **Agents CAN access** `/crm/customers`
2. ✅ **Agents see only assigned customers**
3. ✅ **Agents have simplified UI** (no tabs, no filters)
4. ✅ **Admin see full UI** (tabs, filters, statistics)
5. ✅ **Data Entry redirected** to dashboard

### File Changes:
- ✅ `pages/crm/customers/index.js` - Updated access control
- ✅ Added `isAgent` check
- ✅ Added `canAccessCustomers` check
- ✅ Conditional rendering for degree tabs
- ✅ Updated header text for agents

---

**Date:** January 8, 2026  
**Status:** ✅ **Fixed - Agents Can Now Access**

---

**🎉 Agents can now access and manage their assigned customers!**
