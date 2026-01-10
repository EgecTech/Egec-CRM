# 👥 Counselor Status Display - Admin vs Agent View

**Date**: January 10, 2026
**Status**: ✅ FIXED & WORKING CORRECTLY

---

## 📊 **What Each Role Sees in حالة المرشد Column**

### **🔵 AGENTS (agent, superagent)**
**See:** Their **OWN** `counselorStatus` for each customer

### **🔴 ADMINS (admin, superadmin)**
**See:** The **PRIMARY AGENT's** `counselorStatus` for each customer

### **📝 DATA ENTRY (dataentry)**
**See:** Same as admins (primary agent's status)

---

## 🎯 **Complete Logic Flow**

### **For ADMINS:**
```javascript
1. Get the primary agent ID (customer.assignment.assignedAgentId)
2. Find this agent in the assignedAgents[] array
3. Return their counselorStatus
4. If not found, return first active agent's status
5. If no agents, return "-"
```

### **For AGENTS:**
```javascript
1. Get current logged-in agent's ID (session.user.id)
2. Find THIS agent in the assignedAgents[] array
3. Return their counselorStatus
4. If not found in array, return "-"
```

---

## 📋 **Example Scenarios**

### **Scenario 1: Single Agent Customer**

**Customer #001**
- Primary Agent: **Ali Hassan**
- Assigned Agents:
  - Ali Hassan (counselorStatus: "متجاوب")

| Role | User | What They See |
|------|------|---------------|
| Agent | **Ali Hassan** | **متجاوب** (his own status) ✅ |
| Admin | **Admin User** | **متجاوب** (Ali's status, because he's primary) ✅ |

---

### **Scenario 2: Multi-Agent Customer**

**Customer #002**
- Primary Agent: **Ali Hassan**
- Assigned Agents:
  - Ali Hassan (counselorStatus: "متجاوب")
  - Sara Ahmed (counselorStatus: "سلبي")
  - Mohamed Sayed (counselorStatus: "مهتم جدا")

| Role | User | What They See | Why |
|------|------|---------------|-----|
| Agent | **Ali Hassan** | **متجاوب** | His own status ✅ |
| Agent | **Sara Ahmed** | **سلبي** | Her own status ✅ |
| Agent | **Mohamed Sayed** | **مهتم جدا** | His own status ✅ |
| Admin | **Admin User** | **متجاوب** | Primary agent's (Ali's) status ✅ |

**Key Point:**
- Each agent sees **their own status** for the same customer
- Admin sees the **primary agent's status** (Ali's)

---

### **Scenario 3: Customer With No Status Set**

**Customer #003**
- Primary Agent: **Ali Hassan**
- Assigned Agents:
  - Ali Hassan (counselorStatus: "" - empty)

| Role | User | What They See |
|------|------|---------------|
| Agent | **Ali Hassan** | **-** (not set yet) |
| Admin | **Admin User** | **-** (Ali hasn't set it) |

---

### **Scenario 4: Customer Not Assigned to Current Agent**

**Customer #004**
- Primary Agent: **Sara Ahmed**
- Assigned Agents:
  - Sara Ahmed (counselorStatus: "مهتم جدا")

| Role | User | Can See Customer? | What They See |
|------|------|-------------------|---------------|
| Agent | **Ali Hassan** | ❌ NO | (Customer not in his list) |
| Agent | **Sara Ahmed** | ✅ YES | **مهتم جدا** (her status) |
| Admin | **Admin User** | ✅ YES | **مهتم جدا** (Sara's status) |

**Note:** Agents only see customers assigned to them!

---

## 🔄 **Complete Function Logic**

```javascript
const getCounselorStatusForDisplay = (customer) => {
  // 1. Safety check
  if (!customer?.assignment?.assignedAgents || customer.assignment.assignedAgents.length === 0) {
    return '-';
  }
  
  // 2. For ADMINS: Show primary agent's status
  if (isAdmin) {
    const primaryAgentId = customer.assignment?.assignedAgentId?.toString();
    
    // 2a. Try to find primary agent
    if (primaryAgentId) {
      const primaryAgent = customer.assignment.assignedAgents.find(
        agent => agent.agentId?.toString() === primaryAgentId && agent.isActive
      );
      if (primaryAgent) {
        return primaryAgent.counselorStatus || '-';
      }
    }
    
    // 2b. Fallback: Get first active agent's status
    const firstActiveAgent = customer.assignment.assignedAgents.find(agent => agent.isActive);
    return firstActiveAgent?.counselorStatus || '-';
  }
  
  // 3. For AGENTS: Show their own status
  if (!userId) {
    return '-';
  }
  
  const currentAgentEntry = customer.assignment.assignedAgents.find(
    agent => agent.agentId?.toString() === userId.toString() && agent.isActive
  );
  
  return currentAgentEntry?.counselorStatus || '-';
};
```

---

## 🎨 **Visual Representation**

### **Agent Ali's View:**
```
┌──────────────────────────────────────────────────────────┐
│ Customers - Agent Ali                                    │
├──────────────┬───────────┬─────────┬──────────────┬──────┤
│ Customer #   │ Name      │ Phone   │ حالة المرشد  │ Actions│
├──────────────┼───────────┼─────────┼──────────────┼──────┤
│ #001         │ Ahmed     │ +201... │ متجاوب       │ View │
│ #002         │ Sara      │ +201... │ سلبي         │ Edit │
│ #003         │ Mohamed   │ +201... │ -            │ View │
└──────────────┴───────────┴─────────┴──────────────┴──────┘
        ↑                                  ↑
        └──────── Ali's customers ─────────┘
                 Ali's own statuses for each
```

### **Admin's View:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│ All Customers - Admin                                                     │
├──────┬───────┬───────┬──────────────┬─────────────┬──────────────┬───────┤
│ Cust │ Name  │ Phone │ حالة المرشد  │ Primary Agt │ Assigned Agt │ Action│
├──────┼───────┼───────┼──────────────┼─────────────┼──────────────┼───────┤
│ #001 │ Ahmed │ +20.. │ متجاوب       │ Ali         │ Ali          │ View  │
│ #002 │ Sara  │ +20.. │ مهتم جدا     │ Sara        │ Sara, Ali    │ Edit  │
│ #003 │ Moh.  │ +20.. │ سلبي         │ Mohamed     │ Mohamed,Ali  │ View  │
└──────┴───────┴───────┴──────────────┴─────────────┴──────────────┴───────┘
                          ↑
                          └─── Primary agent's status for each customer
```

---

## ✅ **Why This Design?**

### **For Agents:**
✅ **Privacy**: Each agent only sees their own status
✅ **Independence**: Agents can't see what other agents are doing with shared customers
✅ **Clarity**: "This is MY status for MY work with this customer"

### **For Admins:**
✅ **Overview**: See the primary agent's progress at a glance
✅ **Management**: Can quickly assess which customers need attention
✅ **Reporting**: Can filter by status to see overall team performance
✅ **Detailed View**: Can click into customer to see ALL agents' statuses

---

## 🧪 **How to Test**

### **Test 1: Agent View**
1. Login as **Agent Ali**
2. Go to **Customers** page
3. Look at "حالة المرشد" column
4. ✅ Should see **Ali's own status** for each customer
5. Filter by "متجاوب"
6. ✅ Should see only customers where Ali's status = "متجاوب"

### **Test 2: Admin View**
1. Login as **Admin**
2. Go to **Customers** page
3. Look at "حالة المرشد" column
4. ✅ Should see **primary agent's status** for each customer
5. Look at "Primary Agent" column to verify who the primary is
6. Status should match the primary agent's status

### **Test 3: Multi-Agent Customer**
1. Assign Customer #001 to **both Ali and Sara**
2. Set Ali as primary agent
3. **Ali** sets status to "متجاوب"
4. **Sara** sets status to "سلبي"
5. Login as **Ali** → See "متجاوب" ✅
6. Login as **Sara** → See "سلبي" ✅
7. Login as **Admin** → See "متجاوب" (Ali is primary) ✅

### **Test 4: Admin Filter**
1. Login as **Admin**
2. Filter by "متجاوب" in "حالة المرشد"
3. ✅ Should see all customers where **any agent** has status = "متجاوب"
4. This includes customers from different agents

---

## 📊 **Data Structure Reference**

```javascript
Customer Document:
{
  _id: "...",
  customerNumber: "001",
  basicData: { customerName: "Ahmed Ali" },
  assignment: {
    assignedAgentId: "ali_id",  // ← Primary agent
    assignedAgents: [           // ← All agents working on this customer
      {
        agentId: "ali_id",
        agentName: "Ali Hassan",
        counselorStatus: "متجاوب",  // ← Ali's status
        isActive: true
      },
      {
        agentId: "sara_id",
        agentName: "Sara Ahmed",
        counselorStatus: "سلبي",    // ← Sara's status
        isActive: true
      }
    ]
  }
}

Display Logic:
- Agent Ali sees: "متجاوب" (his status)
- Agent Sara sees: "سلبي" (her status)
- Admin sees: "متجاوب" (primary agent Ali's status)
```

---

## 🎯 **Summary**

### **✅ AGENTS:**
- See their **OWN** `counselorStatus`
- Filter shows only their own statuses
- Privacy maintained between agents

### **✅ ADMINS:**
- See **PRIMARY AGENT's** `counselorStatus`
- Filter shows any agent's statuses
- Full visibility for management

### **✅ COLOR CODING:**
- **Blue (text-blue-700)**: Status is set
- **Gray (text-slate-400)**: Status not set (shows "-")

---

**System now works correctly for both Admins and Agents!** 🎉

---

**Last Updated**: January 10, 2026
**Status**: Production Ready ✅
