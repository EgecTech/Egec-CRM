# Customer Reassignment System
## Transfer Customer Between Agents - Preserve Data, Reset Counselor Status

---

## Your Requirement Understood

### What You Need:

```
Customer: Ahmed Mohamed
Currently assigned to: Agent Ali

Admin/SuperAgent/SuperAdmin reassigns to: Agent Sara

What happens:
✓ ALL customer data transferred to Sara
✓ Sara sees everything Ali entered:
  - University choice
  - Program details  
  - Follow-ups history
  - Documents
  - Notes
  - Status
✗ ONLY "counselorStatus" (حالة المرشد) is RESET to empty
  - So Sara can set her own counselor status fresh
```

---

## Current System vs Required System

### Current System Problem:

```
When admin reassigns customer from Ali to Sara:

assignment: {
  assignedAgentId: sara_id,        ← Changed to Sara
  assignedAgentName: "Sara Ahmed",
  assignedAt: NEW DATE,
  assignedBy: admin_id
}

Problem:
✗ Ali's assignment history is LOST
✗ No record of who worked before
✗ Cannot track reassignment history
```

### Required System:

```
When admin reassigns customer from Ali to Sara:

1. Keep ALL customer data:
   ✓ desiredUniversity: "Cairo University" (Ali's choice)
   ✓ desiredCollege: "Engineering" (Ali's choice)
   ✓ desiredProgram: "Computer Science" (Ali's choice)
   ✓ salesStatus: "in_progress" (Ali's status)
   ✓ interestLevel: "high" (Ali's evaluation)
   ✓ agentNotes: "Customer interested..." (Ali's notes)
   ✓ followUps: [...] (All Ali's follow-ups)
   ✓ documents: [...] (All uploaded documents)

2. RESET ONLY counselorStatus:
   ✗ counselorStatus: "" (Reset to empty)
   
3. Update assignment:
   ✓ assignedAgentId: sara_id
   ✓ assignedAgentName: "Sara Ahmed"
   
4. Save history:
   ✓ Log: "Reassigned from Ali to Sara by Admin on Jan 15"
```

---

## Visual Explanation

### Before Reassignment (Ali's Work):

```
Customer: Ahmed Mohamed
Assigned to: Ali Hassan

Marketing Data:
├─ counselorId: ali_id
├─ counselorName: "Ali Hassan"
└─ counselorStatus: "متابع" ← Ali set this

Desired Program:
├─ desiredUniversity: "Cairo University"
├─ desiredCollege: "Engineering"  
└─ desiredProgram: "Computer Science"

Evaluation:
├─ salesStatus: "in_progress"
├─ interestLevel: "high"
├─ agentNotes: "Customer interested in scholarship"
└─ nextFollowupDate: "2026-01-20"

Follow-ups:
├─ Jan 10: "Called customer"
└─ Jan 12: "Meeting in office"
```

### After Reassignment (Transferred to Sara):

```
Customer: Ahmed Mohamed
Assigned to: Sara Ahmed ← CHANGED

Marketing Data:
├─ counselorId: sara_id ← CHANGED
├─ counselorName: "Sara Ahmed" ← CHANGED
└─ counselorStatus: "" ← RESET (EMPTY)

Desired Program:
├─ desiredUniversity: "Cairo University" ← KEPT
├─ desiredCollege: "Engineering" ← KEPT
└─ desiredProgram: "Computer Science" ← KEPT

Evaluation:
├─ salesStatus: "in_progress" ← KEPT
├─ interestLevel: "high" ← KEPT
├─ agentNotes: "Customer interested in scholarship" ← KEPT
└─ nextFollowupDate: "2026-01-20" ← KEPT

Follow-ups: ← ALL KEPT
├─ Jan 10: "Called customer" (by Ali Hassan)
└─ Jan 12: "Meeting in office" (by Ali Hassan)

Reassignment History: ← NEW
└─ Jan 15: "Reassigned from Ali Hassan to Sara Ahmed by Admin"
```

---

## What Sara Sees After Reassignment

### Sara Opens Customer Ahmed:

```
┌──────────────────────────────────────────────────┐
│ Customer: Ahmed Mohamed                          │
│ Customer #: CUS-2026-00001                       │
│                                                  │
│ ⓘ REASSIGNMENT NOTICE                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ This customer was reassigned to you from:        │
│   • Ali Hassan (worked Jan 10 - Jan 15)         │
│   • Reassigned by: Admin on Jan 15, 2026        │
│ [View Previous Agent's Work History]             │
│                                                  │
├──────────────────────────────────────────────────┤
│ MARKETING DATA                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                  │
│ Counselor: Sara Ahmed (YOU)                      │
│                                                  │
│ Counselor Status: [_______________] ← EMPTY      │
│   ⓘ Reset for you to set your own status        │
│                                                  │
│ Previous counselor (Ali) had set: "متابع"       │
│                                                  │
├──────────────────────────────────────────────────┤
│ DESIRED PROGRAM (From previous agent)           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                  │
│ University: [Cairo University         ▼]        │
│ College:    [Engineering              ▼]        │
│ Program:    [Computer Science         ▼]        │
│                                                  │
│ ⓘ These were set by Ali Hassan                  │
│   You can keep or change them                    │
│                                                  │
├──────────────────────────────────────────────────┤
│ EVALUATION & STATUS                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                  │
│ Sales Status: [In Progress            ▼]        │
│ Interest Level: [High                 ▼]        │
│                                                  │
│ Agent Notes: (From Ali Hassan)                  │
│ ┌────────────────────────────────────────────┐ │
│ │ Customer interested in scholarship         │ │
│ │ Good GPA, strong candidate                 │ │
│ │                                            │ │
│ │ [You can add your notes here...]           │ │
│ └────────────────────────────────────────────┘ │
│                                                  │
├──────────────────────────────────────────────────┤
│ FOLLOW-UP HISTORY                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                  │
│ Jan 12, 2026 - by Ali Hassan                    │
│ Meeting in office, showed campus photos          │
│                                                  │
│ Jan 10, 2026 - by Ali Hassan                    │
│ Called customer, discussed Cairo University      │
│                                                  │
│ [Add New Follow-up]                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Add Reassignment History to Customer Model

**File: `models/Customer.js`**

```javascript
// Add this new section to Customer schema

const customerSchema = new mongoose.Schema({
  
  // ... existing fields ...
  
  // ========== ASSIGNMENT ==========
  assignment: {
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
      default: null,
    },
    assignedAgentName: String,
    assignedAt: Date,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    assignedByName: String,
    
    // NEW: Reassignment history
    reassignmentHistory: [
      {
        fromAgentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile"
        },
        fromAgentName: String,
        toAgentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile"
        },
        toAgentName: String,
        reassignedAt: { type: Date, default: Date.now },
        reassignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile"
        },
        reassignedByName: String,
        reason: String,
        
        // Snapshot of counselorStatus before reset
        previousCounselorStatus: String
      }
    ]
  },
  
  // ... rest of schema ...
});
```

---

## API Implementation

### Update Reassignment API

**File: `pages/api/crm/customers/[id]/reassign.js`** (NEW FILE)

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { Profile } from '@/models/Profile';
import { checkPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  try {
    // Check permission (only admin, superadmin, superagent can reassign)
    const canReassign = ['admin', 'superadmin', 'superagent'].includes(role);
    
    if (!canReassign) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to reassign customers' 
      });
    }
    
    const { newAgentId, reason } = req.body;
    
    if (!newAgentId) {
      return res.status(400).json({ error: 'New agent ID is required' });
    }
    
    // Validate new agent exists and is active
    const newAgent = await Profile.findOne({
      _id: newAgentId,
      isActive: true,
      role: { $in: ['agent', 'egecagent', 'studyagent', 'edugateagent'] }
    }).select('name email role').lean();
    
    if (!newAgent) {
      return res.status(404).json({ error: 'New agent not found or inactive' });
    }
    
    // Find customer
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get current assignment details
    const oldAgentId = customer.assignment?.assignedAgentId;
    const oldAgentName = customer.assignment?.assignedAgentName;
    const oldCounselorStatus = customer.evaluation?.counselorStatus;
    
    // Cannot reassign to same agent
    if (oldAgentId && oldAgentId.toString() === newAgentId) {
      return res.status(400).json({ 
        error: 'Customer is already assigned to this agent' 
      });
    }
    
    // Update assignment
    customer.assignment = customer.assignment || {};
    customer.assignment.assignedAgentId = newAgentId;
    customer.assignment.assignedAgentName = newAgent.name;
    customer.assignment.assignedAt = new Date();
    customer.assignment.assignedBy = userId;
    customer.assignment.assignedByName = userName;
    
    // Initialize reassignment history if doesn't exist
    if (!customer.assignment.reassignmentHistory) {
      customer.assignment.reassignmentHistory = [];
    }
    
    // Add to reassignment history
    customer.assignment.reassignmentHistory.push({
      fromAgentId: oldAgentId,
      fromAgentName: oldAgentName || 'Unassigned',
      toAgentId: newAgentId,
      toAgentName: newAgent.name,
      reassignedAt: new Date(),
      reassignedBy: userId,
      reassignedByName: userName,
      reason: reason || 'Reassignment by admin',
      previousCounselorStatus: oldCounselorStatus
    });
    
    // Update marketingData counselor
    if (customer.marketingData) {
      customer.marketingData.counselorId = newAgentId;
      customer.marketingData.counselorName = newAgent.name;
      
      // RESET counselorStatus (حالة المرشد)
      customer.marketingData.counselorStatus = '';
    }
    
    // RESET ONLY counselorStatus in evaluation (if exists there)
    if (customer.evaluation) {
      customer.evaluation.counselorStatus = '';
    }
    
    // Mark as modified to ensure save
    customer.markModified('assignment');
    customer.markModified('marketingData');
    customer.markModified('evaluation');
    
    await customer.save();
    
    // Log audit
    await logAudit({
      userId,
      userEmail,
      userName,
      userRole: role,
      action: 'REASSIGN',
      entityType: 'customer',
      entityId: customer._id,
      entityName: customer.basicData?.customerName,
      oldValues: {
        assignedAgentId: oldAgentId,
        assignedAgentName: oldAgentName,
        counselorStatus: oldCounselorStatus
      },
      newValues: {
        assignedAgentId: newAgentId,
        assignedAgentName: newAgent.name,
        counselorStatus: '' // Reset
      },
      description: `Reassigned customer from ${oldAgentName || 'Unassigned'} to ${newAgent.name}. Counselor status reset.`,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestMethod: 'POST',
      requestPath: `/api/crm/customers/${id}/reassign`
    });
    
    return res.status(200).json({
      success: true,
      data: customer,
      message: `Customer reassigned to ${newAgent.name} successfully. Counselor status has been reset.`,
      reassignmentDetails: {
        from: oldAgentName || 'Unassigned',
        to: newAgent.name,
        counselorStatusReset: true,
        reassignedBy: userName,
        reassignedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error reassigning customer:', error);
    return res.status(500).json({ 
      error: 'Failed to reassign customer',
      details: error.message
    });
  }
}
```

---

## Frontend UI Updates

### 1. Add Reassign Button in Customer List

**File: `pages/crm/customers/index.js`**

```javascript
// In the customer list table, add reassign button for admin/superadmin/superagent

{(role === 'admin' || role === 'superadmin' || role === 'superagent') && (
  <button
    onClick={() => openReassignModal(customer)}
    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
    title="Reassign to another agent"
  >
    Reassign
  </button>
)}
```

### 2. Reassignment Modal

**File: `pages/crm/customers/index.js`**

```javascript
// Add state for reassignment modal
const [reassignModal, setReassignModal] = useState({
  show: false,
  customer: null,
  selectedAgentId: '',
  reason: ''
});

// Function to open modal
const openReassignModal = (customer) => {
  setReassignModal({
    show: true,
    customer: customer,
    selectedAgentId: '',
    reason: ''
  });
};

// Function to handle reassignment
const handleReassign = async () => {
  if (!reassignModal.selectedAgentId) {
    alert('Please select an agent');
    return;
  }
  
  try {
    const response = await fetch(
      `/api/crm/customers/${reassignModal.customer._id}/reassign`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAgentId: reassignModal.selectedAgentId,
          reason: reassignModal.reason
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`✓ ${data.message}`);
      setReassignModal({ show: false, customer: null, selectedAgentId: '', reason: '' });
      // Refresh customer list
      fetchCustomers();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error reassigning:', error);
    alert('Failed to reassign customer');
  }
};

// Reassignment modal UI
{reassignModal.show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">
        Reassign Customer
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Customer:</strong> {reassignModal.customer?.basicData?.customerName}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Currently assigned to:</strong> {reassignModal.customer?.assignment?.assignedAgentName || 'Unassigned'}
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Reassign to Agent:
        </label>
        <select
          value={reassignModal.selectedAgentId}
          onChange={(e) => setReassignModal(prev => ({
            ...prev,
            selectedAgentId: e.target.value
          }))}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select Agent...</option>
          {agents.map(agent => (
            <option key={agent._id} value={agent._id}>
              {agent.name} - {agent.email}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Reason (optional):
        </label>
        <textarea
          value={reassignModal.reason}
          onChange={(e) => setReassignModal(prev => ({
            ...prev,
            reason: e.target.value
          }))}
          className="w-full px-3 py-2 border rounded"
          rows="3"
          placeholder="Why reassigning this customer?"
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Note:</strong> When reassigned:
        </p>
        <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
          <li>All customer data will be kept</li>
          <li><strong>Counselor Status (حالة المرشد) will be RESET</strong></li>
          <li>New agent can set their own counselor status</li>
          <li>Follow-up history will be preserved</li>
        </ul>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => setReassignModal({ show: false, customer: null, selectedAgentId: '', reason: '' })}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleReassign}
          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Reassign Customer
        </button>
      </div>
    </div>
  </div>
)}
```

### 3. Show Reassignment History in Customer View

**File: `pages/crm/customers/[id].js` or `pages/crm/customers/[id]/edit.js`**

```javascript
// Add this section to show reassignment history

{customer?.assignment?.reassignmentHistory?.length > 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-bold text-blue-900 mb-3">
      📋 Reassignment History
    </h3>
    
    <div className="space-y-2">
      {customer.assignment.reassignmentHistory
        .sort((a, b) => new Date(b.reassignedAt) - new Date(a.reassignedAt))
        .map((history, index) => (
          <div key={index} className="bg-white rounded p-3 text-sm">
            <p className="font-semibold">
              {new Date(history.reassignedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-gray-700">
              Reassigned from <strong>{history.fromAgentName}</strong> to <strong>{history.toAgentName}</strong>
            </p>
            <p className="text-gray-600">
              By: {history.reassignedByName}
            </p>
            {history.previousCounselorStatus && (
              <p className="text-gray-600">
                Previous Counselor Status: <span className="font-semibold">{history.previousCounselorStatus}</span> (was reset)
              </p>
            )}
            {history.reason && (
              <p className="text-gray-600">
                Reason: {history.reason}
              </p>
            )}
          </div>
        ))
      }
    </div>
  </div>
)}
```

### 4. Highlight Reset Counselor Status Field

**File: `pages/crm/customers/[id]/edit.js`**

```javascript
// In the marketing data section, highlight counselor status field

<div className="md:col-span-1">
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    حالة المرشد (Counselor Status)
    {customer.assignment?.reassignmentHistory?.length > 0 && (
      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
        Reset after reassignment
      </span>
    )}
  </label>
  <select
    name="counselorStatus"
    value={customer.marketingData?.counselorStatus || ''}
    onChange={(e) => setCustomer(prev => ({
      ...prev,
      marketingData: {
        ...prev.marketingData,
        counselorStatus: e.target.value
      }
    }))}
    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select status...</option>
    <option value="متابع">متابع</option>
    <option value="قيد الدراسة">قيد الدراسة</option>
    <option value="موافق">موافق</option>
    <option value="غير موافق">غير موافق</option>
    {/* Add more options as needed */}
  </select>
  
  {/* Show previous counselor status from last reassignment */}
  {customer.assignment?.reassignmentHistory?.length > 0 && 
   customer.assignment.reassignmentHistory[0].previousCounselorStatus && (
    <p className="text-xs text-gray-500 mt-1">
      Previous agent had set: <strong>{customer.assignment.reassignmentHistory[0].previousCounselorStatus}</strong>
    </p>
  )}
</div>
```

---

## Summary

### What Happens When Admin Reassigns Customer:

```
1. Admin clicks "Reassign" button
   ↓
2. Selects new agent from dropdown
   ↓
3. Enters reason (optional)
   ↓
4. System performs:
   ✓ Updates assignedAgentId → New agent
   ✓ Updates counselorId → New agent
   ✓ RESETS counselorStatus → Empty string
   ✓ Keeps ALL other data (university, program, notes, etc.)
   ✓ Saves reassignment to history
   ✓ Logs audit trail
   ↓
5. New agent sees:
   ✓ All previous agent's work
   ✓ Empty counselor status field (can set their own)
   ✓ Reassignment notice showing previous agent
   ✓ All follow-up history
```

### Data Preservation:

```
KEPT (Transferred to new agent):
✓ Desired university
✓ Desired college
✓ Desired program
✓ Sales status
✓ Interest level
✓ Agent notes
✓ Follow-ups history
✓ Documents
✓ All other fields

RESET (Cleared for new agent):
✗ counselorStatus (حالة المرشد)
   → New agent sets their own

UPDATED (New agent info):
↻ assignedAgentId
↻ assignedAgentName
↻ counselorId
↻ counselorName
↻ assignedAt
```

---

## Implementation Steps

### Step 1: Update Customer Model (5 minutes)
- Add `reassignmentHistory` array to assignment object

### Step 2: Create Reassign API (30 minutes)
- Create new file: `pages/api/crm/customers/[id]/reassign.js`
- Implement reassignment logic with counselor status reset

### Step 3: Update Frontend (1 hour)
- Add Reassign button to customer list
- Create reassignment modal
- Show reassignment history in customer view
- Highlight reset counselor status field

### Step 4: Testing (30 minutes)
- Test reassignment flow
- Verify counselor status resets
- Verify other data is kept
- Check reassignment history is saved

**Total Time: ~2 hours**

---

## Is This Correct?

**Your requirement:**
1. ✅ Admin/SuperAdmin/SuperAgent can reassign customer to another agent
2. ✅ ALL customer data is transferred (university, program, notes, etc.)
3. ✅ ONLY "counselorStatus" (حالة المرشد) is reset to empty
4. ✅ New agent can set their own counselor status
5. ✅ Reassignment history is tracked

**Should I implement this?** 🚀
