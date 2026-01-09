# Multi-Agent Workflow - How It Works
## Clear Explanation with Real Business Scenarios

---

## Your Question Answered

**Question:** "How can multiple agents work on same client but with different permissions? One agent can edit, another can only view?"

**Answer:** We use **Agent Roles + Permission System**

---

## Real Business Scenario

### Example: Ahmed Mohamed (Customer)

```
Customer: Ahmed Mohamed
Phone: +20 123 456 789
Status: In Progress

TEAM WORKING ON THIS CUSTOMER:

┌─────────────────────────────────────────────────┐
│ 1. Ali Hassan (Primary Agent)                  │
│    Role: PRIMARY                                │
│    Permissions: FULL ACCESS                     │
│    - Can view all data           ✓              │
│    - Can edit all fields         ✓              │
│    - Can add follow-ups          ✓              │
│    - Can change status           ✓              │
│    - Can complete customer       ✓              │
│    Status: ACTIVE                               │
├─────────────────────────────────────────────────┤
│ 2. Sara Ahmed (Support Agent)                   │
│    Role: SECONDARY                              │
│    Permissions: LIMITED ACCESS                  │
│    - Can view all data           ✓              │
│    - Can edit basic info         ✓              │
│    - Can add follow-ups          ✓              │
│    - Can change status           ✗ (No)         │
│    - Can complete customer       ✗ (No)         │
│    Status: ACTIVE                               │
├─────────────────────────────────────────────────┤
│ 3. Mohamed Sayed (Consultant)                   │
│    Role: CONSULTANT                             │
│    Permissions: VIEW ONLY                       │
│    - Can view all data           ✓              │
│    - Can edit fields             ✗ (No)         │
│    - Can add comments            ✓              │
│    - Can change status           ✗ (No)         │
│    - Can complete customer       ✗ (No)         │
│    Status: ACTIVE                               │
└─────────────────────────────────────────────────┘
```

---

## Permission Matrix

### What Each Role Can Do

| Action | Primary Agent | Secondary Agent | Consultant | View-Only |
|--------|---------------|-----------------|------------|-----------|
| **View customer data** | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| **Edit basic info** | ✓ Yes | ✓ Yes | ✗ No | ✗ No |
| **Edit all fields** | ✓ Yes | ~ Some | ✗ No | ✗ No |
| **Add follow-ups** | ✓ Yes | ✓ Yes | ✓ Yes | ✗ No |
| **Change status** | ✓ Yes | ~ Limited | ✗ No | ✗ No |
| **Complete customer** | ✓ Yes | ✗ No | ✗ No | ✗ No |
| **Delete customer** | ✓ Yes* | ✗ No | ✗ No | ✗ No |
| **Assign other agents** | ✓ Yes | ✗ No | ✗ No | ✗ No |
| **Remove agents** | ✓ Yes | ✗ No | ✗ No | ✗ No |

*Only with admin/superadmin permission

---

## Real Workflow Example

### Scenario 1: New Customer - Multiple Agents Working

**Step 1: Customer Created**
```
Jan 1, 2026 - 10:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer: Ahmed Mohamed
Created by: Admin
Status: NEW

Assigned Team:
  • Ali Hassan (Primary) - Main responsible agent
```

**Step 2: Primary Agent Starts Work**
```
Jan 1, 2026 - 11:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ali Hassan (Primary) opens customer:
  → Sees FULL customer data
  → Can EDIT everything
  → Adds follow-up: "Called customer, interested in Master program"
  → Changes status: NEW → IN PROGRESS
  
Action logged:
  "Ali Hassan updated customer status to In Progress"
```

**Step 3: Primary Agent Needs Help - Adds Secondary Agent**
```
Jan 2, 2026 - 9:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ali Hassan realizes:
  "This customer needs special visa support"
  
Ali clicks: [+ Add Agent]
  → Selects: Sara Ahmed
  → Role: SECONDARY (Support)
  → Reason: "Visa documentation specialist"
  → Commission: 20%
  
System sends notification:
  To Sara Ahmed: "You've been assigned to customer Ahmed Mohamed"

Assigned Team NOW:
  • Ali Hassan (Primary) - Main agent - 80% commission
  • Sara Ahmed (Secondary) - Support - 20% commission
```

**Step 4: Secondary Agent Works (LIMITED ACCESS)**
```
Jan 2, 2026 - 10:00 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sara Ahmed (Secondary) opens customer:
  
What Sara SEES:
  ✓ Customer name, phone, email
  ✓ All follow-ups history
  ✓ Current status
  ✓ Documents uploaded
  ✓ Who else is working (Ali Hassan - Primary)
  
What Sara CAN DO:
  ✓ Add follow-up: "Reviewed visa documents, need passport copy"
  ✓ Upload documents
  ✓ Add comments
  ✓ Contact customer
  
What Sara CANNOT DO:
  ✗ Change customer status to COMPLETED
  ✗ Delete customer
  ✗ Remove Ali Hassan
  ✗ Change primary agent
  
Sara adds follow-up:
  "Visa documents prepared, sent to customer via email"
  
Action logged:
  "Sara Ahmed (Secondary) added follow-up"
```

**Step 5: Consultant Reviews (VIEW ONLY)**
```
Jan 3, 2026 - 2:00 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ali asks consultant for advice:
Ali clicks: [+ Add Agent]
  → Selects: Mohamed Sayed
  → Role: CONSULTANT
  → Reason: "Need university admission advice"
  
Mohamed Sayed (Consultant) opens customer:
  
What Mohamed SEES:
  ✓ All customer data (read-only)
  ✓ Follow-up history
  ✓ Documents
  
What Mohamed CAN DO:
  ✓ Add comment: "Recommend Cairo University, strong Master program"
  ✓ View only
  
What Mohamed CANNOT DO:
  ✗ Edit customer data
  ✗ Change status
  ✗ Delete anything
  
Mohamed adds comment:
  "Based on GPA 3.8, recommend Cairo University or Alexandria University"
  
Action logged:
  "Mohamed Sayed (Consultant) added comment"
```

**Step 6: Primary Agent Completes Work**
```
Jan 10, 2026 - 4:00 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ali Hassan (Primary) completes customer:
  
Ali clicks: [Complete Customer]
  → Status: IN PROGRESS → COMPLETED
  → Final note: "Customer accepted to Cairo University, paid fees"
  → Commission split:
     • Ali Hassan: 80% (Primary)
     • Sara Ahmed: 20% (Secondary)
     • Mohamed Sayed: Fixed fee (Consultant)
  
System automatically:
  ✓ Sends notification to all agents
  ✓ Locks customer from further editing (optional)
  ✓ Calculates commissions
  ✓ Updates statistics
  
All agents can still VIEW customer for reference
But only Primary can REOPEN if needed

Action logged:
  "Ali Hassan (Primary) completed customer Ahmed Mohamed"
```

---

## Technical Implementation

### How System Controls Permissions

#### 1. Role-Based Access Control (RBAC)

```javascript
// When agent opens customer page
function checkAgentPermissions(customer, currentUserId, currentUserRole) {
  
  // Find this agent's assignment in customer
  const agentAssignment = customer.assignment.assignedAgents.find(
    a => a.agentId === currentUserId && a.isActive === true
  );
  
  // If not assigned to this customer
  if (!agentAssignment) {
    // Check if admin/superadmin (can see all customers)
    if (currentUserRole === 'admin' || currentUserRole === 'superadmin') {
      return {
        canView: true,
        canEdit: true,
        canComplete: true,
        canDelete: true,
        role: 'admin'
      };
    }
    
    // Regular agent not assigned = NO ACCESS
    return {
      canView: false,
      canEdit: false,
      canComplete: false,
      canDelete: false,
      role: null
    };
  }
  
  // Agent IS assigned - check their role
  switch(agentAssignment.role) {
    
    case 'primary':
      return {
        canView: true,
        canEdit: true,           // Can edit everything
        canComplete: true,        // Can mark as completed
        canDelete: false,         // Only admin can delete
        canAssignAgents: true,    // Can add/remove team members
        canChangeStatus: true,    // Can change any status
        role: 'primary'
      };
    
    case 'secondary':
      return {
        canView: true,
        canEdit: true,            // Can edit basic fields only
        canEditBasicOnly: true,   // LIMITED editing
        canComplete: false,       // Cannot complete
        canDelete: false,
        canAssignAgents: false,   // Cannot add agents
        canChangeStatus: 'limited', // Can change to some statuses only
        role: 'secondary'
      };
    
    case 'consultant':
      return {
        canView: true,
        canEdit: false,           // NO editing
        canComment: true,         // Can add comments only
        canComplete: false,
        canDelete: false,
        canAssignAgents: false,
        canChangeStatus: false,
        role: 'consultant'
      };
    
    case 'view-only':
      return {
        canView: true,
        canEdit: false,
        canComment: false,
        canComplete: false,
        canDelete: false,
        canAssignAgents: false,
        canChangeStatus: false,
        role: 'view-only'
      };
  }
}
```

#### 2. UI Rendering Based on Permissions

```javascript
// In customer edit page
function CustomerEditPage({ customer }) {
  const { data: session } = useSession();
  
  // Get permissions for current user
  const permissions = checkAgentPermissions(
    customer, 
    session.user.id, 
    session.user.role
  );
  
  // If no access, redirect
  if (!permissions.canView) {
    return <div>You don't have access to this customer</div>;
  }
  
  return (
    <div>
      <h1>Customer: {customer.basicData.customerName}</h1>
      
      {/* Show team working on this customer */}
      <div className="assigned-agents">
        <h3>Team Working on This Customer:</h3>
        {customer.assignment.assignedAgents
          .filter(a => a.isActive)
          .map(agent => (
            <div key={agent.agentId}>
              <span>{agent.agentName}</span>
              <span>({agent.role})</span>
              {agent.agentId === session.user.id && (
                <span className="badge">YOU</span>
              )}
            </div>
          ))
        }
      </div>
      
      {/* Customer data fields */}
      <div>
        <label>Customer Name:</label>
        <input 
          value={customer.basicData.customerName}
          disabled={!permissions.canEdit} // Disabled if no edit permission
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Phone:</label>
        <input 
          value={customer.basicData.customerPhone}
          disabled={!permissions.canEdit}
          onChange={handleChange}
        />
      </div>
      
      {/* Status - only if can change */}
      {permissions.canChangeStatus && (
        <div>
          <label>Status:</label>
          <select 
            value={customer.evaluation.salesStatus}
            onChange={handleStatusChange}
          >
            <option value="prospect">Prospect</option>
            <option value="in_progress">In Progress</option>
            {permissions.canComplete && (
              <option value="completed">Completed</option>
            )}
          </select>
        </div>
      )}
      
      {/* Follow-ups - everyone can add */}
      <div>
        <h3>Follow-ups:</h3>
        <button onClick={addFollowup}>Add Follow-up</button>
      </div>
      
      {/* Complete button - only primary */}
      {permissions.canComplete && (
        <button 
          onClick={completeCustomer}
          className="btn-success"
        >
          Complete Customer
        </button>
      )}
      
      {/* Add agent - only primary or admin */}
      {permissions.canAssignAgents && (
        <button onClick={openAddAgentModal}>
          + Add Team Member
        </button>
      )}
      
      {/* Save button */}
      {permissions.canEdit && (
        <button onClick={saveCustomer}>
          Save Changes
        </button>
      )}
      
      {/* Read-only message for consultants */}
      {permissions.role === 'consultant' && (
        <div className="alert-info">
          You have view-only access. You can add comments but cannot edit customer data.
        </div>
      )}
    </div>
  );
}
```

#### 3. API Permission Check

```javascript
// In API: pages/api/crm/customers/[id].js
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;
  
  if (req.method === 'PUT') { // UPDATE customer
    
    // Get customer
    const customer = await Customer.findById(id);
    
    // Check permissions
    const permissions = checkAgentPermissions(
      customer, 
      session.user.id, 
      session.user.role
    );
    
    // If cannot edit, reject
    if (!permissions.canEdit) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to edit this customer',
        yourRole: permissions.role
      });
    }
    
    // If secondary agent (limited editing)
    if (permissions.canEditBasicOnly) {
      // Only allow editing specific fields
      const allowedFields = [
        'basicData.customerPhone',
        'basicData.email',
        'basicData.anotherContactNumber'
      ];
      
      const requestedChanges = Object.keys(req.body);
      const forbiddenChanges = requestedChanges.filter(
        field => !allowedFields.includes(field)
      );
      
      if (forbiddenChanges.length > 0) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only edit basic contact information',
          forbiddenFields: forbiddenChanges
        });
      }
    }
    
    // Proceed with update
    // ...
  }
}
```

---

## Data Visibility Rules

### Who Can See What?

```
ADMIN/SUPERADMIN:
├─ All customers in system (360° view)
├─ Can see all agents' work
└─ Full access to everything

PRIMARY AGENT (Ali):
├─ Own assigned customers (full access)
├─ Can see other team members
├─ Can see all follow-ups
└─ Can edit everything

SECONDARY AGENT (Sara):
├─ Customers where assigned (view + limited edit)
├─ Can see other team members
├─ Can see all follow-ups
└─ Can edit basic info only

CONSULTANT (Mohamed):
├─ Customers where assigned (view only)
├─ Can see other team members
├─ Can see all follow-ups
└─ Cannot edit, can comment

UNASSIGNED AGENT (Ahmed):
├─ Cannot see this customer at all
└─ Only sees own assigned customers
```

---

## Common Scenarios Explained

### Scenario A: Agent Wants to See Customer

```
Question: Can Sara Ahmed see customer "Ahmed Mohamed"?

System checks:
1. Is Sara assigned to this customer?
   └─ YES → Sara is Secondary Agent
   
2. Is Sara's assignment active?
   └─ YES → isActive = true
   
3. What's Sara's role?
   └─ SECONDARY → Limited edit access
   
Answer: YES, Sara can see customer
Access level: View all + Edit basic fields + Add follow-ups
```

### Scenario B: Agent Wants to Edit Customer

```
Question: Can Mohamed Sayed edit customer "Ahmed Mohamed"?

System checks:
1. Is Mohamed assigned to this customer?
   └─ YES → Mohamed is Consultant
   
2. What's Mohamed's role?
   └─ CONSULTANT → View only
   
3. Can consultant edit?
   └─ NO → Consultants cannot edit
   
Answer: NO, Mohamed cannot edit customer
Access level: View only + Add comments
```

### Scenario C: Primary Agent Completes Work

```
Question: Ali completes customer. What happens to Sara and Mohamed?

When Ali clicks "Complete Customer":

1. Customer status → COMPLETED
2. Primary agent (Ali) → Can still access
3. Secondary agent (Sara) → Can still VIEW (no more edits)
4. Consultant (Mohamed) → Can still VIEW
5. All agents get notification
6. Customer locked from further status changes
7. Commission calculated and logged

Sara can:
  ✓ View customer history
  ✓ See final outcome
  ✓ Reference for future
  ✗ No longer edit

Mohamed can:
  ✓ View customer history
  ✗ No longer add comments
```

### Scenario D: Remove Agent from Customer

```
Question: Ali removes Sara from customer. What happens?

When Ali clicks "Remove Sara Ahmed":

1. Sara's assignment → isActive = FALSE
2. Sara's assignment → deactivatedAt = NOW
3. Sara's assignment → deactivatedBy = Ali
4. History logged: "Sara Ahmed removed from customer"
5. Sara gets notification
6. Sara NO LONGER sees this customer in her list

Sara's assignment NOT deleted (for history):
  {
    agentId: sara_id,
    agentName: "Sara Ahmed",
    role: "secondary",
    assignedAt: "Jan 2, 2026",
    isActive: FALSE, ← Deactivated
    deactivatedAt: "Jan 8, 2026",
    deactivatedBy: ali_id
  }

Result:
  • Sara cannot access customer anymore
  • But history shows Sara worked on it
  • Admin can see Sara was involved
  • Audit trail preserved
```

---

## Database Structure Example

### Customer Document in MongoDB

```javascript
{
  _id: "customer_12345",
  customerNumber: "CUS-2026-00001",
  basicData: {
    customerName: "Ahmed Mohamed",
    customerPhone: "+20 123 456 789",
    email: "ahmed@example.com"
  },
  
  // MULTI-AGENT ASSIGNMENT
  assignment: {
    
    // Quick reference to primary agent
    primaryAgentId: "ali_id",
    primaryAgentName: "Ali Hassan",
    
    // Array of ALL agents working on customer
    assignedAgents: [
      {
        agentId: "ali_id",
        agentName: "Ali Hassan",
        agentEmail: "ali@company.com",
        role: "primary",              // PRIMARY = Full access
        assignedAt: "2026-01-01T10:00:00Z",
        assignedBy: "admin_id",
        assignedByName: "Admin",
        isActive: true,               // Currently active
        commissionPercentage: 80
      },
      {
        agentId: "sara_id",
        agentName: "Sara Ahmed",
        agentEmail: "sara@company.com",
        role: "secondary",            // SECONDARY = Limited access
        assignedAt: "2026-01-02T09:00:00Z",
        assignedBy: "ali_id",
        assignedByName: "Ali Hassan",
        isActive: true,               // Currently active
        notes: "Visa documentation specialist",
        commissionPercentage: 20
      },
      {
        agentId: "mohamed_id",
        agentName: "Mohamed Sayed",
        agentEmail: "mohamed@company.com",
        role: "consultant",           // CONSULTANT = View only
        assignedAt: "2026-01-03T14:00:00Z",
        assignedBy: "ali_id",
        assignedByName: "Ali Hassan",
        isActive: true,               // Currently active
        notes: "University admission advisor"
      }
    ],
    
    // Complete history of all assignment changes
    assignmentHistory: [
      {
        action: "assigned",
        agentId: "ali_id",
        agentName: "Ali Hassan",
        newRole: "primary",
        timestamp: "2026-01-01T10:00:00Z",
        performedBy: "admin_id",
        performedByName: "Admin",
        reason: "Initial assignment"
      },
      {
        action: "assigned",
        agentId: "sara_id",
        agentName: "Sara Ahmed",
        newRole: "secondary",
        timestamp: "2026-01-02T09:00:00Z",
        performedBy: "ali_id",
        performedByName: "Ali Hassan",
        reason: "Need visa specialist support"
      },
      {
        action: "assigned",
        agentId: "mohamed_id",
        agentName: "Mohamed Sayed",
        newRole: "consultant",
        timestamp: "2026-01-03T14:00:00Z",
        performedBy: "ali_id",
        performedByName: "Ali Hassan",
        reason: "Need university selection advice"
      }
    ]
  },
  
  evaluation: {
    salesStatus: "in_progress"
  }
}
```

---

## Summary

### How System Achieves Your Needs

```
Your Need: Multiple agents work on same client
Solution:  assignedAgents array allows unlimited agents
Result:    ✓ Ali, Sara, Mohamed all work on same customer

Your Need: Different permissions per agent
Solution:  Role field (primary/secondary/consultant)
Result:    ✓ Ali edits, Sara limited edit, Mohamed views only

Your Need: One agent completes, others see result
Solution:  Permissions checked on each action
Result:    ✓ Ali completes, Sara/Mohamed still view history

Your Need: Track who did what
Solution:  assignmentHistory array + audit logs
Result:    ✓ Complete trail of all actions

Your Need: No data conflicts
Solution:  Role-based permissions + API validation
Result:    ✓ Each agent can only do what they're allowed
```

---

## Visual Flow Chart

```
Agent Opens Customer Page
          |
          ↓
  Is agent assigned?
     /         \
   NO           YES
   |            |
   ↓            ↓
BLOCK      Get agent role
ACCESS          |
          ______|_______
         /      |       \
    PRIMARY  SECONDARY  CONSULTANT
        |       |          |
        ↓       ↓          ↓
    FULL    LIMITED     VIEW
    EDIT     EDIT       ONLY
        |       |          |
        ↓       ↓          ↓
    Show    Hide some  Hide all
    all     buttons   edit buttons
    buttons
```

---

## Questions?

**Q: Can two PRIMARY agents work on same customer?**  
A: Yes! You can have multiple primary agents with full access.

**Q: What if agent leaves company?**  
A: Mark as isActive=false, keep history, reassign customers.

**Q: Can agent see customers they're not assigned to?**  
A: No, unless they're admin/superadmin.

**Q: How to handle commission split?**  
A: Store commissionPercentage per agent, auto-calculate on completion.

**Q: What if agents edit at same time?**  
A: Last save wins. Or add real-time locking (advanced feature).

---

**Ready to implement? This is exactly how it will work!**
