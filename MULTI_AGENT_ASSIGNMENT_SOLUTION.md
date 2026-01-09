# Multi-Agent Assignment & Duplicate Prevention Solution
## Business Requirements Analysis & Implementation Plan

---

## Current System Analysis

### What You Have Now

**Assignment Structure:**
```javascript
assignment: {
  assignedAgentId: Single Agent Only,
  assignedAgentName: String,
  assignedAt: Date,
  assignedBy: ObjectId,
  assignedByName: String
}
```

**Problems:**
1. Only ONE agent can be assigned to a customer
2. If reassigned, previous agent history is lost
3. No duplicate phone number detection
4. No collaboration tracking between agents
5. Difficult to manage workload distribution

---

## Business Needs Analysis

### Your Google Sheets Workflow Issues

| Problem | Impact | Business Need |
|---------|--------|---------------|
| Duplicate phone numbers | Multiple records for same customer | Prevent duplicates, merge existing |
| Multiple agents per customer | No clear ownership | Track all agents working on customer |
| Agent changes not tracked | Lost history of who did what | Complete audit trail |
| No collaboration visibility | Agents duplicate work | See who else is working on customer |
| Manual assignment conflicts | Confusion and errors | Automated conflict detection |

---

## Recommended Solutions

### Solution 1: Multi-Agent Assignment System (RECOMMENDED)

**Concept:** Allow multiple agents to work on same customer with clear roles and history.

#### Database Schema Changes

```javascript
// NEW: Multi-Agent Assignment Array
assignment: {
  // Keep current primary agent for backward compatibility
  primaryAgentId: ObjectId,
  primaryAgentName: String,
  
  // NEW: Array of all assigned agents
  assignedAgents: [
    {
      agentId: ObjectId,
      agentName: String,
      agentEmail: String,
      role: String, // 'primary', 'secondary', 'support', 'consultant'
      assignedAt: Date,
      assignedBy: ObjectId,
      assignedByName: String,
      isActive: Boolean, // Can be deactivated without deleting history
      deactivatedAt: Date,
      deactivatedBy: ObjectId,
      notes: String // Why this agent was assigned
    }
  ],
  
  // Assignment history
  assignmentHistory: [
    {
      action: String, // 'assigned', 'removed', 'role_changed'
      agentId: ObjectId,
      agentName: String,
      previousRole: String,
      newRole: String,
      timestamp: Date,
      performedBy: ObjectId,
      performedByName: String,
      reason: String
    }
  ]
}
```

#### Benefits

```
Benefits of Multi-Agent Assignment:

Collaboration      |████████████████████████████| 100%
  - Multiple agents can work together
  - Clear role definition (primary/secondary)
  - No confusion about ownership

History Tracking   |████████████████████████████| 100%
  - Complete audit trail
  - See who worked when
  - Never lose agent history

Workload Balance   |██████████████████████      | 85%
  - Distribute customers across agents
  - Support agent can help primary
  - Flexible reassignment

Reporting          |████████████████████████    | 90%
  - Track agent performance
  - Commission calculation accurate
  - Management visibility
```

---

### Solution 2: Duplicate Prevention System (CRITICAL)

**Concept:** Prevent duplicate customers by phone number before creation.

#### Implementation Strategy

**A. Phone Number Uniqueness (Recommended)**

```javascript
// Add unique index on phone number
customerSchema.index({ 'basicData.customerPhone': 1 }, { 
  unique: true, 
  sparse: true,
  name: 'unique_phone_number'
});

// Alternative: Allow duplicates but warn
customerSchema.index({ 'basicData.customerPhone': 1 }, { 
  name: 'phone_search_index'
});
```

**B. Pre-Creation Duplicate Check**

```javascript
// Before creating customer, check for duplicates
const duplicateCheck = await Customer.findOne({
  $or: [
    { 'basicData.customerPhone': phoneNumber },
    { 'basicData.email': email },
    { customerNumber: customerNumber }
  ],
  isDeleted: false
});

if (duplicateCheck) {
  return {
    isDuplicate: true,
    existingCustomer: duplicateCheck,
    matchedFields: ['phone', 'email'],
    assignedTo: duplicateCheck.assignment.assignedAgents
  };
}
```

**C. Smart Duplicate Detection**

```javascript
// Fuzzy matching for similar names and phones
const similarCustomers = await Customer.aggregate([
  {
    $match: {
      isDeleted: false,
      $or: [
        // Exact phone match
        { 'basicData.customerPhone': phoneNumber },
        
        // Phone without country code (050 vs +20050)
        { 'basicData.customerPhone': { $regex: phoneNumber.slice(-9) } },
        
        // Similar name (soundex/metaphone algorithm)
        { 'basicData.customerName': { $regex: namePattern, $options: 'i' } }
      ]
    }
  },
  {
    $project: {
      customerNumber: 1,
      'basicData.customerName': 1,
      'basicData.customerPhone': 1,
      'basicData.email': 1,
      'assignment.assignedAgents': 1,
      similarity: { $literal: 1 } // Calculate similarity score
    }
  }
]);
```

---

### Solution 3: Agent Collaboration Workflow

**Concept:** Clear workflow for multiple agents working on same customer.

#### Workflow Rules

```
Agent Assignment Rules:

1. Primary Agent (Main Owner)
   - Full edit permissions
   - Receives notifications
   - Commission: 60-80%
   - Can add secondary agents

2. Secondary Agent (Support)
   - Can view and add follow-ups
   - Limited edit permissions
   - Commission: 20-30%
   - Assists primary agent

3. Consultant Agent (Specialist)
   - View and comment only
   - Provides technical advice
   - Commission: 10% or fixed fee
   - Subject matter expert

4. Handoff Agent (Temporary)
   - During vacation/leave
   - Full permissions temporarily
   - History tracked
   - Automatically removed after period
```

#### UI Changes Needed

```
Customer Card Display:

┌─────────────────────────────────────────────────┐
│ Customer: Ahmed Mohamed                         │
│ Phone: +20 123 456 7890                         │
│ Status: In Progress                             │
│                                                 │
│ Assigned Agents:                                │
│   👤 Ali Hassan (Primary)    [Active]          │
│   👥 Sara Ahmed (Secondary)  [Active]          │
│   💼 Mohamed Ali (Consultant) [Active]         │
│                                                 │
│ Assignment History:                             │
│   ✓ Mohamed Ali added as consultant (Jan 8)    │
│   ✓ Sara Ahmed added as secondary (Jan 5)      │
│   ✓ Ali Hassan assigned as primary (Jan 1)     │
│                                                 │
│ [+ Add Agent] [Manage Team] [View Full History]│
└─────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Critical (Week 1-2)

**Priority: HIGH - Prevent Data Issues**

1. **Duplicate Prevention**
   ```
   Tasks:
   - Add phone number uniqueness check in API
   - Create duplicate detection before save
   - Show warning UI when duplicate found
   - Merge duplicate customers tool (admin only)
   ```

2. **Basic Multi-Agent Support**
   ```
   Tasks:
   - Update Customer schema with assignedAgents array
   - Migration script to convert existing assignments
   - Update customer creation API
   - Update customer display to show all agents
   ```

### Phase 2: Enhanced Features (Week 3-4)

**Priority: MEDIUM - Improve Workflow**

3. **Agent Management Interface**
   ```
   Tasks:
   - Add/remove agent functionality
   - Agent role assignment (primary/secondary)
   - Agent search and filter
   - Notification system for new assignments
   ```

4. **Duplicate Detection Dashboard**
   ```
   Tasks:
   - Admin page to find duplicates
   - Merge customers tool
   - Bulk duplicate resolution
   - Duplicate prevention reports
   ```

### Phase 3: Advanced Features (Month 2)

**Priority: LOW - Nice to Have**

5. **Commission & Reporting**
   ```
   Tasks:
   - Commission split calculator
   - Agent performance reports
   - Workload distribution analytics
   - Customer-per-agent metrics
   ```

6. **Collaboration Tools**
   ```
   Tasks:
   - Internal agent notes (not visible to customer)
   - Agent-to-agent messaging
   - Task assignment within team
   - Customer handoff wizard
   ```

---

## Detailed Implementation Plan

### 1. Duplicate Prevention Implementation

#### Step 1.1: Update Customer Model

**File:** `models/Customer.js`

```javascript
// Add unique sparse index for phone number
customerSchema.index({ 
  'basicData.customerPhone': 1 
}, { 
  unique: true, 
  sparse: true,
  name: 'unique_customer_phone'
});

// Add method to check duplicates
customerSchema.statics.checkDuplicates = async function(phoneNumber, email, excludeId = null) {
  const query = {
    isDeleted: false,
    $or: [
      { 'basicData.customerPhone': phoneNumber }
    ]
  };
  
  if (email) {
    query.$or.push({ 'basicData.email': email });
  }
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const duplicates = await this.find(query)
    .select('customerNumber basicData.customerName basicData.customerPhone basicData.email assignment')
    .lean();
  
  return duplicates;
};
```

#### Step 1.2: Update Create Customer API

**File:** `pages/api/crm/customers/index.js`

```javascript
// Before creating customer
if (req.method === 'POST') {
  const { basicData } = req.body;
  
  // Check for duplicates
  const duplicates = await Customer.checkDuplicates(
    basicData.customerPhone,
    basicData.email
  );
  
  if (duplicates.length > 0) {
    return res.status(409).json({
      error: 'Duplicate customer found',
      code: 'DUPLICATE_CUSTOMER',
      duplicates: duplicates.map(d => ({
        id: d._id,
        customerNumber: d.customerNumber,
        name: d.basicData.customerName,
        phone: d.basicData.customerPhone,
        email: d.basicData.email,
        assignedTo: d.assignment?.assignedAgents || []
      })),
      message: 'A customer with this phone number already exists'
    });
  }
  
  // Continue with customer creation
  // ...
}
```

#### Step 1.3: Update Create Customer UI

**File:** `pages/crm/customers/create.js`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/crm/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    // Handle duplicate error
    if (response.status === 409 && data.code === 'DUPLICATE_CUSTOMER') {
      setDuplicateError({
        show: true,
        duplicates: data.duplicates
      });
      return;
    }
    
    if (response.ok) {
      alert('Customer created successfully!');
      router.push(`/crm/customers/${data.data._id}`);
    }
    
  } catch (error) {
    console.error('Error creating customer:', error);
  }
};

// Duplicate warning modal
{duplicateError.show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl">
      <h3 className="text-xl font-bold text-red-600 mb-4">
        Duplicate Customer Found!
      </h3>
      <p className="mb-4">
        A customer with this phone number already exists:
      </p>
      
      {duplicateError.duplicates.map(dup => (
        <div key={dup.id} className="border p-4 mb-2 rounded">
          <p><strong>Name:</strong> {dup.name}</p>
          <p><strong>Phone:</strong> {dup.phone}</p>
          <p><strong>Customer #:</strong> {dup.customerNumber}</p>
          <p><strong>Assigned to:</strong> {dup.assignedTo.map(a => a.agentName).join(', ')}</p>
          <button 
            onClick={() => router.push(`/crm/customers/${dup.id}`)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            View Existing Customer
          </button>
        </div>
      ))}
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => setDuplicateError({ show: false, duplicates: [] })}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            // Force create anyway (admin only)
            if (confirm('Are you sure? This will create a duplicate.')) {
              // Set force flag and retry
              createCustomerForce();
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Create Anyway (Admin Only)
        </button>
      </div>
    </div>
  </div>
)}
```

---

### 2. Multi-Agent Assignment Implementation

#### Step 2.1: Update Customer Schema

**File:** `models/Customer.js`

```javascript
// Replace single assignment with multi-agent structure
assignment: {
  // Keep primary for backward compatibility and quick queries
  primaryAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    index: true,
    default: null
  },
  primaryAgentName: String,
  
  // Multi-agent array
  assignedAgents: [
    {
      agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
      },
      agentName: { type: String, required: true },
      agentEmail: String,
      role: {
        type: String,
        enum: ['primary', 'secondary', 'support', 'consultant'],
        default: 'primary'
      },
      assignedAt: { type: Date, default: Date.now },
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      },
      assignedByName: String,
      isActive: { type: Boolean, default: true },
      deactivatedAt: Date,
      deactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      },
      notes: String,
      commissionPercentage: Number
    }
  ],
  
  // Assignment history
  assignmentHistory: [
    {
      action: {
        type: String,
        enum: ['assigned', 'removed', 'role_changed', 'deactivated', 'reactivated']
      },
      agentId: mongoose.Schema.Types.ObjectId,
      agentName: String,
      previousRole: String,
      newRole: String,
      timestamp: { type: Date, default: Date.now },
      performedBy: mongoose.Schema.Types.ObjectId,
      performedByName: String,
      reason: String
    }
  ]
}
```

#### Step 2.2: Create Migration Script

**File:** `scripts/migrateToMultiAgent.js`

```javascript
import mongoose from 'mongoose';
import { mongooseConnect } from '../lib/mongoose';
import Customer from '../models/Customer';

async function migrateAssignments() {
  await mongooseConnect();
  
  console.log('Starting assignment migration...');
  
  const customers = await Customer.find({
    'assignment.assignedAgentId': { $exists: true, $ne: null }
  });
  
  console.log(`Found ${customers.length} customers with assignments`);
  
  let migrated = 0;
  
  for (const customer of customers) {
    // Convert old assignment to new structure
    const oldAssignment = customer.assignment;
    
    const newAssignment = {
      primaryAgentId: oldAssignment.assignedAgentId,
      primaryAgentName: oldAssignment.assignedAgentName,
      assignedAgents: [
        {
          agentId: oldAssignment.assignedAgentId,
          agentName: oldAssignment.assignedAgentName,
          role: 'primary',
          assignedAt: oldAssignment.assignedAt || customer.createdAt,
          assignedBy: oldAssignment.assignedBy,
          assignedByName: oldAssignment.assignedByName,
          isActive: true,
          notes: 'Migrated from old assignment system'
        }
      ],
      assignmentHistory: [
        {
          action: 'assigned',
          agentId: oldAssignment.assignedAgentId,
          agentName: oldAssignment.assignedAgentName,
          newRole: 'primary',
          timestamp: oldAssignment.assignedAt || customer.createdAt,
          performedBy: oldAssignment.assignedBy,
          performedByName: oldAssignment.assignedByName,
          reason: 'Initial migration'
        }
      ]
    };
    
    customer.assignment = newAssignment;
    await customer.save();
    
    migrated++;
    if (migrated % 100 === 0) {
      console.log(`Migrated ${migrated}/${customers.length}`);
    }
  }
  
  console.log(`Migration complete! Migrated ${migrated} customers`);
  process.exit(0);
}

migrateAssignments().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

#### Step 2.3: Create Agent Management API

**File:** `pages/api/crm/customers/[id]/agents.js`

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { Profile } from '@/models/Profile';
import { checkPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';

export default async function handler(req, res) {
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  // GET: List all agents assigned to customer
  if (req.method === 'GET') {
    try {
      const customer = await Customer.findOne({ _id: id, isDeleted: false })
        .select('assignment basicData.customerName customerNumber')
        .lean();
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          customerNumber: customer.customerNumber,
          customerName: customer.basicData?.customerName,
          primaryAgent: {
            id: customer.assignment?.primaryAgentId,
            name: customer.assignment?.primaryAgentName
          },
          assignedAgents: customer.assignment?.assignedAgents || [],
          history: customer.assignment?.assignmentHistory || []
        }
      });
      
    } catch (error) {
      console.error('Error fetching agents:', error);
      return res.status(500).json({ error: 'Failed to fetch agents' });
    }
  }
  
  // POST: Add new agent to customer
  if (req.method === 'POST') {
    try {
      // Check permission
      if (!checkPermission(role, 'customers', 'assign')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { agentId, agentRole, notes, commissionPercentage } = req.body;
      
      // Validate agent exists
      const agent = await Profile.findOne({
        _id: agentId,
        isActive: true
      }).select('name email role').lean();
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found or inactive' });
      }
      
      // Find customer
      const customer = await Customer.findOne({ _id: id, isDeleted: false });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check if agent already assigned
      const existingAgent = customer.assignment?.assignedAgents?.find(
        a => a.agentId.toString() === agentId && a.isActive
      );
      
      if (existingAgent) {
        return res.status(409).json({ 
          error: 'Agent already assigned to this customer',
          existingRole: existingAgent.role
        });
      }
      
      // Add new agent
      if (!customer.assignment) {
        customer.assignment = { assignedAgents: [], assignmentHistory: [] };
      }
      
      const newAgent = {
        agentId,
        agentName: agent.name,
        agentEmail: agent.email,
        role: agentRole || 'secondary',
        assignedAt: new Date(),
        assignedBy: userId,
        assignedByName: userName,
        isActive: true,
        notes,
        commissionPercentage
      };
      
      customer.assignment.assignedAgents.push(newAgent);
      
      // If this is primary agent, update primary fields
      if (agentRole === 'primary') {
        customer.assignment.primaryAgentId = agentId;
        customer.assignment.primaryAgentName = agent.name;
      }
      
      // Add to history
      customer.assignment.assignmentHistory.push({
        action: 'assigned',
        agentId,
        agentName: agent.name,
        newRole: agentRole || 'secondary',
        timestamp: new Date(),
        performedBy: userId,
        performedByName: userName,
        reason: notes
      });
      
      await customer.save();
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'ASSIGN_AGENT',
        entityType: 'customer',
        entityId: customer._id,
        entityName: customer.basicData?.customerName,
        description: `Added ${agent.name} as ${agentRole} agent`,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(200).json({
        success: true,
        data: customer.assignment,
        message: `${agent.name} added as ${agentRole} agent`
      });
      
    } catch (error) {
      console.error('Error adding agent:', error);
      return res.status(500).json({ error: 'Failed to add agent' });
    }
  }
  
  // DELETE: Remove agent from customer
  if (req.method === 'DELETE') {
    try {
      // Check permission
      if (!checkPermission(role, 'customers', 'assign')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { agentId, reason } = req.body;
      
      const customer = await Customer.findOne({ _id: id, isDeleted: false });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Find and deactivate agent
      const agentIndex = customer.assignment?.assignedAgents?.findIndex(
        a => a.agentId.toString() === agentId && a.isActive
      );
      
      if (agentIndex === -1) {
        return res.status(404).json({ error: 'Agent not assigned to this customer' });
      }
      
      const agent = customer.assignment.assignedAgents[agentIndex];
      
      // Don't delete, just deactivate for history
      customer.assignment.assignedAgents[agentIndex].isActive = false;
      customer.assignment.assignedAgents[agentIndex].deactivatedAt = new Date();
      customer.assignment.assignedAgents[agentIndex].deactivatedBy = userId;
      
      // Add to history
      customer.assignment.assignmentHistory.push({
        action: 'removed',
        agentId: agent.agentId,
        agentName: agent.agentName,
        previousRole: agent.role,
        timestamp: new Date(),
        performedBy: userId,
        performedByName: userName,
        reason
      });
      
      await customer.save();
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'REMOVE_AGENT',
        entityType: 'customer',
        entityId: customer._id,
        entityName: customer.basicData?.customerName,
        description: `Removed ${agent.agentName} from customer`,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(200).json({
        success: true,
        message: `${agent.agentName} removed from customer`
      });
      
    } catch (error) {
      console.error('Error removing agent:', error);
      return res.status(500).json({ error: 'Failed to remove agent' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

## Quick Start Guide

### For Immediate Implementation (Today)

**1. Add Duplicate Check (30 minutes)**

```bash
# Add this to pages/api/crm/customers/index.js before creating customer

// Check for duplicate phone
const duplicate = await Customer.findOne({
  'basicData.customerPhone': req.body.basicData.customerPhone,
  isDeleted: false
});

if (duplicate) {
  return res.status(409).json({
    error: 'Customer with this phone already exists',
    existingCustomer: {
      id: duplicate._id,
      name: duplicate.basicData.customerName,
      customerNumber: duplicate.customerNumber
    }
  });
}
```

**2. Show Duplicate Warning in UI (15 minutes)**

```javascript
// In create customer form, check response status 409
if (response.status === 409) {
  alert(`Duplicate found! Customer already exists: ${data.existingCustomer.name}`);
  if (confirm('View existing customer?')) {
    router.push(`/crm/customers/${data.existingCustomer.id}`);
  }
  return;
}
```

---

## Testing Checklist

### Duplicate Prevention Tests

- [ ] Try to create customer with same phone number
- [ ] Try to create customer with same email
- [ ] Verify duplicate warning shows with existing customer details
- [ ] Test phone variations (+20 vs 00 vs without code)
- [ ] Test admin override to force create duplicate

### Multi-Agent Tests

- [ ] Assign primary agent to customer
- [ ] Add secondary agent to customer
- [ ] Remove agent from customer
- [ ] Change agent role (primary to secondary)
- [ ] View assignment history
- [ ] Check permissions for different roles

---

## Estimated Timeline

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Duplicate prevention | 2-3 days | CRITICAL |
| **Phase 2** | Multi-agent schema update | 3-4 days | HIGH |
| **Phase 3** | Agent management UI | 4-5 days | HIGH |
| **Phase 4** | Migration script | 1-2 days | MEDIUM |
| **Phase 5** | Testing & refinement | 2-3 days | HIGH |
| **Total** | | **12-17 days** | |

---

## Summary & Recommendations

### Immediate Actions (This Week)

1. **Implement duplicate phone check** (Critical - prevents data issues)
2. **Add duplicate warning UI** (User experience)
3. **Test with your team** (Validate solution)

### Next Month

4. **Update schema for multi-agent** (Business workflow)
5. **Create agent management interface** (User productivity)
6. **Run migration script** (Convert existing data)

### Future Enhancements

7. **Commission calculator** (Business metrics)
8. **Agent collaboration tools** (Team efficiency)
9. **Workload analytics** (Management visibility)

---

## Questions for You

Before implementing, please clarify:

1. **Agent Roles:** What roles do you need? (primary/secondary/support?)
2. **Commission Split:** Do you need automatic commission calculation?
3. **Duplicate Policy:** Should duplicates be:
   - Completely blocked?
   - Warned but allowed?
   - Admin-only override?
4. **Assignment Rules:** Can agents add other agents themselves?
5. **Historical Data:** Should we migrate your current assignments?

---

**Ready to implement? Start with duplicate prevention today, then multi-agent next week!**
