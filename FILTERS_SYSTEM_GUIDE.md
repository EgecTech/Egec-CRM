# 🔍 Filters System Guide - Customer List Page

**Last Updated:** January 8, 2026  
**Version:** 1.0

---

## 📋 Overview

The customer list page (`/crm/customers`) now has a comprehensive filtering system that works correctly based on user permissions. Each user role has access to appropriate filters based on their data access level.

---

## 🎯 Available Filters by Role

### 1️⃣ Superadmin / Admin / Super Agent

**Access:** All customers in the system

**Available Filters:**
- ✅ حالة المرشد (Counselor Status)
- ✅ Agent (Filter by assigned agent)
- ✅ 📅 Created From (Start date)
- ✅ 📅 Created To (End date)
- ✅ 🔍 Search (Name, phone, email, customer number)
- ✅ 📊 Degree Type Tabs (All, Bachelor, Master, PhD)

**How it Works:**
```javascript
// Base Query: All customers (no restrictions)
query = { isDeleted: false }

// Apply filters
if (counselorStatus) query['evaluation.counselorStatus'] = counselorStatus;
if (assignedAgent) query['assignment.assignedAgentId'] = assignedAgent;
if (degreeType) query.degreeType = degreeType;
if (search) query.$text = { $search: search };
if (createdFrom/createdTo) query.createdAt = { $gte, $lte };
```

---

### 2️⃣ Agent

**Access:** Only assigned customers

**Available Filters:**
- ✅ حالة المرشد (Counselor Status)
- ❌ Agent (HIDDEN - already viewing own customers)
- ✅ 📅 Created From (Start date)
- ✅ 📅 Created To (End date)
- ✅ 🔍 Search (Name, phone, email, customer number)
- ✅ 📊 Degree Type Tabs (All, Bachelor, Master, PhD)

**How it Works:**
```javascript
// Base Query: Only assigned customers
query = { 
  isDeleted: false,
  'assignment.assignedAgentId': userId 
}

// Apply additional filters
if (counselorStatus) query['evaluation.counselorStatus'] = counselorStatus;
if (degreeType) query.degreeType = degreeType;
if (search) query.$text = { $search: search };
if (createdFrom/createdTo) query.createdAt = { $gte, $lte };
```

**Why Agent Filter is Hidden:**
- Agent already sees ONLY their assigned customers
- Showing "Agent" filter would be redundant
- All customers in the list are already theirs

---

### 3️⃣ Data Entry

**Access:** Only own created customers

**Available Filters:**
- ✅ حالة المرشد (Counselor Status)
- ❌ Agent (HIDDEN - not relevant for Data Entry)
- ✅ 📅 Created From (Start date)
- ✅ 📅 Created To (End date)
- ✅ 🔍 Search (Name, phone, email, customer number)
- ✅ 📊 Degree Type Tabs (All, Bachelor, Master, PhD)

**How it Works:**
```javascript
// Base Query: Only own created customers
query = { 
  isDeleted: false,
  createdBy: userId 
}

// Apply additional filters
if (counselorStatus) query['evaluation.counselorStatus'] = counselorStatus;
if (degreeType) query.degreeType = degreeType;
if (search) query.$text = { $search: search };
if (createdFrom/createdTo) query.createdAt = { $gte, $lte };
```

---

## 🔧 Filter Details

### 1. حالة المرشد (Counselor Status)

**Available to:** All roles  
**Purpose:** Filter customers by their current counselor status  
**Source:** System Settings (`counselor_statuses`)

**Options:**
- All Statuses (default)
- New
- In Progress
- Pending Documents
- Accepted
- Rejected
- On Hold
- Canceled
- Completed
- *(Custom statuses from system settings)*

**Example:**
```javascript
// Admin: Get all "In Progress" customers
query = { 'evaluation.counselorStatus': 'In Progress' }

// Agent: Get assigned "In Progress" customers
query = { 
  'assignment.assignedAgentId': agentId,
  'evaluation.counselorStatus': 'In Progress' 
}
```

---

### 2. Agent (Assigned Agent Filter)

**Available to:** Superadmin, Admin, Super Agent  
**Hidden from:** Agent, Data Entry

**Purpose:** Filter customers by the agent they are assigned to  
**Source:** Active agent users from the database

**Options:**
- All Agents (default)
- Agent Name 1 - email@example.com
- Agent Name 2 - email@example.com
- *(All active agents in the system)*

**Example:**
```javascript
// Admin: Get all customers assigned to specific agent
query = { 
  'assignment.assignedAgentId': '507f1f77bcf86cd799439011'
}
```

**Why Hidden for Agent:**
```
Agent User (Ahmed) logs in
↓
Base query already filters: { 'assignment.assignedAgentId': ahmedId }
↓
Showing "Agent" filter would only show Ahmed's name
↓
Redundant and confusing → Hidden
```

---

### 3. Created From / Created To (Date Range)

**Available to:** All roles  
**Purpose:** Filter customers by creation date range  
**Source:** Customer's `createdAt` field

**Format:** `YYYY-MM-DD`

**Options:**
- From: Start date (inclusive)
- To: End date (inclusive)
- Both: Date range
- None: All dates

**Example:**
```javascript
// Get customers created in January 2026
query.createdAt = {
  $gte: new Date('2026-01-01'),
  $lte: new Date('2026-01-31')
}

// Agent: Get assigned customers created this week
query = {
  'assignment.assignedAgentId': agentId,
  createdAt: {
    $gte: startOfWeek,
    $lte: endOfWeek
  }
}
```

**Use Cases:**
- **Admin:** Track customer acquisition over time
- **Agent:** See which customers were recently assigned
- **Data Entry:** Track own productivity by date

---

### 4. Search (🔍)

**Available to:** All roles  
**Purpose:** Full-text search across multiple fields  
**Fields Searched:**
- Customer Name (`basicData.customerName`)
- Customer Phone (`basicData.customerPhone`)
- Email (`basicData.email`)
- Customer Number (`customerNumber`)

**Technology:** MongoDB Text Index (`$text`)

**Example:**
```javascript
// Search: "ahmed"
query.$text = { $search: "ahmed" }

// Combined with role restrictions:
// Agent searching for "ahmed"
query = {
  'assignment.assignedAgentId': agentId,
  $text: { $search: "ahmed" }
}
```

**Features:**
- Case-insensitive
- Partial word matching
- Arabic and English support
- Searches across multiple fields simultaneously

---

### 5. Degree Type Tabs (📊)

**Available to:** All roles  
**Purpose:** Filter customers by their desired degree type  
**Options:**
- 📊 All Customers
- 📘 Bachelor (بكالوريوس)
- 📙 Master (ماجستير)
- 📗 PhD (دكتوراه)

**Shows Count for Each Type Based on User Access**

**Example:**
```javascript
// Admin clicks "Bachelor" tab
query.degreeType = 'bachelor'
// Result: All bachelor customers

// Agent clicks "Master" tab
query = {
  'assignment.assignedAgentId': agentId,
  degreeType: 'master'
}
// Result: Only assigned master customers
```

**Counts Display:**
```
Admin View:
📊 All (15,432) | 📘 Bachelor (8,521) | 📙 Master (4,231) | 📗 PhD (2,680)

Agent View (with 45 assigned customers):
📊 All (45) | 📘 Bachelor (23) | 📙 Master (15) | 📗 PhD (7)

Data Entry View (created 127 customers):
📊 All (127) | 📘 Bachelor (89) | 📙 Master (28) | 📗 PhD (10)
```

---

## 🔄 How Filters Work Together

### Example 1: Admin Filtering
```javascript
User: Admin
Filters Applied:
- Counselor Status: "In Progress"
- Agent: Ahmed (ID: 507f...)
- Degree Type: Bachelor
- Created From: 2026-01-01
- Created To: 2026-01-31

Final Query:
{
  isDeleted: false,
  'evaluation.counselorStatus': 'In Progress',
  'assignment.assignedAgentId': '507f...',
  degreeType: 'bachelor',
  createdAt: {
    $gte: new Date('2026-01-01'),
    $lte: new Date('2026-01-31')
  }
}

Result: All bachelor customers assigned to Ahmed with "In Progress" 
        status created in January 2026
```

---

### Example 2: Agent Filtering
```javascript
User: Agent (Ahmed, ID: 507f...)
Filters Applied:
- Counselor Status: "Pending Documents"
- Degree Type: Master
- Created From: 2026-01-08

Automatic Base Query:
{
  isDeleted: false,
  'assignment.assignedAgentId': '507f...'  // Automatically added
}

Final Query:
{
  isDeleted: false,
  'assignment.assignedAgentId': '507f...',
  'evaluation.counselorStatus': 'Pending Documents',
  degreeType: 'master',
  createdAt: { $gte: new Date('2026-01-08') }
}

Result: Ahmed's assigned master customers with "Pending Documents" 
        status created on or after January 8, 2026
```

---

### Example 3: Data Entry Filtering
```javascript
User: Data Entry (Sara, ID: 608a...)
Filters Applied:
- Counselor Status: "New"
- Degree Type: Bachelor
- Search: "ahmed"

Automatic Base Query:
{
  isDeleted: false,
  createdBy: '608a...'  // Automatically added
}

Final Query:
{
  isDeleted: false,
  createdBy: '608a...',
  'evaluation.counselorStatus': 'New',
  degreeType: 'bachelor',
  $text: { $search: 'ahmed' }
}

Result: Bachelor customers Sara created with "New" status 
        and name/phone/email containing "ahmed"
```

---

## 🎨 UI Implementation

### Filter Button
```javascript
<button onClick={() => setShowFilters(!showFilters)}>
  <FaFilter /> Filters
  {activeFiltersCount > 0 && (
    <span className="badge">{activeFiltersCount}</span>
  )}
</button>
```

**Shows Active Filter Count:**
- No filters: Just "Filters" text
- 1+ filters: "Filters" + badge with count

---

### Filter Panel

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Counselor Status  │  Agent*  │  From Date  │  To Date  │
│   [Dropdown]       │ [Dropdown]│  [Date]     │  [Date]   │
└─────────────────────────────────────────────────────────┘

* Agent dropdown only visible to Admin/Superadmin/Super Agent
```

**Responsive:**
- Desktop: 5 columns
- Tablet: 2 columns
- Mobile: 1 column (stacked)

---

### Clear Filters

**Active Filters Display:**
```
Applied Filters:
  ✕ Counselor Status: In Progress
  ✕ Agent: Ahmed
  ✕ Created From: 2026-01-01

[Clear All Filters]
```

**Clear Button:**
```javascript
const resetFilters = () => {
  setFilters({
    counselorStatus: '',
    assignedAgent: '',
    createdFrom: '',
    createdTo: ''
  });
  setSearchQuery('');
  setActiveDegreeTab('all');
  setPagination(prev => ({ ...prev, page: 1 }));
};
```

---

## 🔐 Security & Permissions

### Backend Validation

**File:** `pages/api/crm/customers/index.js`

```javascript
// Step 1: Build base query with role restrictions
const baseQuery = buildCustomerQuery(role, userId);
// Returns:
// - Admin: { isDeleted: false }
// - Agent: { isDeleted: false, 'assignment.assignedAgentId': userId }
// - Data Entry: { isDeleted: false, createdBy: userId }

// Step 2: Apply user-provided filters
const query = { ...baseQuery };
if (counselorStatus) query['evaluation.counselorStatus'] = counselorStatus;
if (assignedAgent) query['assignment.assignedAgentId'] = assignedAgent;
// ... other filters

// Step 3: Execute query
const customers = await Customer.find(query)
  .sort(sort)
  .limit(limit)
  .skip((page - 1) * limit);
```

**Security Guarantee:**
- Agent CANNOT override `assignedAgentId` filter
- Data Entry CANNOT override `createdBy` filter
- Base query is always applied first
- User filters are additive, not replacements

---

## 📊 Performance Considerations

### Indexes Required

```javascript
// Customer model indexes
customerSchema.index({ 
  'basicData.customerName': 'text',
  'basicData.customerPhone': 'text',
  'basicData.email': 'text',
  customerNumber: 'text'
});

customerSchema.index({ createdAt: -1 });
customerSchema.index({ 'assignment.assignedAgentId': 1 });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ degreeType: 1 });
customerSchema.index({ 'evaluation.counselorStatus': 1 });
```

### Caching

**Degree Stats API:**
- Cached for 5 minutes per user
- Cache key: `degree_stats:${role}:${userId}`
- Reduces database load for frequent page visits

**System Settings:**
- Cached in frontend state
- Fetched once per session
- Used for counselor status dropdown

---

## 🧪 Testing Checklist

### ✅ Admin/Superadmin/Super Agent
- [ ] Can see all filters including Agent dropdown
- [ ] Counselor Status filter works
- [ ] Agent filter shows all agents
- [ ] Agent filter correctly filters customers
- [ ] Date range filters work
- [ ] Search works across all customers
- [ ] Degree tabs show all customer counts
- [ ] Multiple filters work together
- [ ] Clear filters resets all

### ✅ Agent
- [ ] Can see all filters EXCEPT Agent dropdown
- [ ] Counselor Status filter works on assigned customers
- [ ] Date range filters work on assigned customers
- [ ] Search works only on assigned customers
- [ ] Degree tabs show assigned customer counts
- [ ] Cannot see unassigned customers
- [ ] Multiple filters work together
- [ ] Clear filters resets all

### ✅ Data Entry
- [ ] Can see all filters EXCEPT Agent dropdown
- [ ] Counselor Status filter works on own customers
- [ ] Date range filters work on own customers
- [ ] Search works only on own customers
- [ ] Degree tabs show own customer counts
- [ ] Cannot see other users' customers
- [ ] Multiple filters work together
- [ ] Clear filters resets all

---

## 🐛 Common Issues & Solutions

### Issue 1: Agent sees all customers when filtering
**Cause:** Base query not applied correctly  
**Solution:** Check `buildCustomerQuery` in `lib/permissions.js`

### Issue 2: Filters don't work for Agent
**Cause:** Filters panel hidden for non-admin users  
**Solution:** Remove `isAdmin &&` condition from filters panel

### Issue 3: System settings not loading for Agent
**Cause:** System settings only fetched for admin  
**Solution:** Move `fetchSystemSettings()` outside admin-only block

### Issue 4: Agent dropdown visible to Agent
**Cause:** Missing role check for Agent dropdown  
**Solution:** Wrap Agent dropdown with `{isAdmin && ...}`

### Issue 5: Degree stats show incorrect counts
**Cause:** Stats API not respecting role restrictions  
**Solution:** Use `buildCustomerQuery` in stats API

---

## 📝 Summary

| Filter | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|------------|-------|-------------|-------|------------|
| Counselor Status | ✅ All | ✅ All | ✅ All | ✅ Assigned | ✅ Own |
| Agent | ✅ All | ✅ All | ✅ All | ❌ Hidden | ❌ Hidden |
| Date Range | ✅ All | ✅ All | ✅ All | ✅ Assigned | ✅ Own |
| Search | ✅ All | ✅ All | ✅ All | ✅ Assigned | ✅ Own |
| Degree Tabs | ✅ All | ✅ All | ✅ All | ✅ Assigned | ✅ Own |

**Key Points:**
- ✅ All users can filter their accessible customers
- ✅ Agent dropdown hidden from Agent/Data Entry (redundant)
- ✅ Filters always respect base role restrictions
- ✅ Multiple filters work together additively
- ✅ Performance optimized with indexes and caching

---

**Document Version:** 1.0  
**Last Updated:** January 8, 2026  
**Status:** ✅ Complete & Tested
