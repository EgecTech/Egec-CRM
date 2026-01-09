# Reassignment History Privacy Update

## Overview
Updated the customer reassignment system to hide reassignment history from regular agents. Only Admin, Superadmin, and Superagent roles can view reassignment information.

## Changes Made

### 1. Customer View Page (`pages/crm/customers/[id].js`)

#### Added Permission Check
```javascript
const canViewReassignmentHistory = role === 'admin' || role === 'superadmin' || role === 'superagent';
```

#### Updated Sections

**A. Reassignment Notice Banner (Top of Page)**
- **Who can see**: Admin, Superadmin, Superagent only
- **Who cannot see**: Regular agents (agent, egecagent, studyagent, edugateagent)
- Shows:
  - Yellow notification banner
  - Previous agent name
  - Reassignment date
  - Previous counselor status (that was reset)

**B. Reassignment History Section (Activity Timeline Tab)**
- **Who can see**: Admin, Superadmin, Superagent only
- **Who cannot see**: Regular agents
- Shows:
  - Full reassignment history timeline
  - All previous assignments
  - Reassignment reasons
  - Who performed the reassignment

## Business Logic

### What Agents See
When an agent logs in and views a customer assigned to them:
- ✅ They can see all customer information
- ✅ They can see their own follow-ups
- ✅ They can update customer status
- ❌ They **CANNOT** see reassignment history
- ❌ They **CANNOT** see who worked on this customer before
- ❌ They **CANNOT** see previous counselor status

This ensures agents:
- Focus on their current customers
- Don't see internal assignment decisions
- Work independently without bias from previous agent's work

### What Admins/Superadmins/Superagents See
When an admin-level user views a customer:
- ✅ All customer information
- ✅ Complete reassignment history
- ✅ Previous agent names
- ✅ Reassignment dates and reasons
- ✅ Previous counselor status that was reset

This allows management to:
- Track customer journey across agents
- Monitor reassignment patterns
- Understand why customers were reassigned
- Make informed decisions about future assignments

## Functionality Still Working

### Reassignment Process
1. Admin/Superadmin/Superagent can reassign customers
2. When reassigned:
   - `evaluation.counselorStatus` is reset to empty
   - All other customer data is preserved
   - History is recorded in `reassignmentHistory` array
   - New agent receives the customer

3. New agent sees:
   - Clean customer record
   - Empty counselor status (ready for them to set)
   - No knowledge of previous agent's work
   - Can start fresh assessment

### Data Preservation
- All reassignment data is still stored in database
- History is preserved for audit purposes
- Data can be accessed by admin roles
- Reporting and analytics can use this data

## Files Modified
- `pages/crm/customers/[id].js` - Added role-based visibility for reassignment history

## Testing Checklist

### As Regular Agent
- [ ] Login as agent
- [ ] View assigned customer
- [ ] Verify NO yellow reassignment notice appears
- [ ] Go to Activity Timeline tab
- [ ] Verify NO reassignment history section appears

### As Admin/Superadmin
- [ ] Login as admin
- [ ] View a reassigned customer
- [ ] Verify yellow reassignment notice appears at top
- [ ] Verify "View Full Reassignment History" button works
- [ ] Go to Activity Timeline tab
- [ ] Verify full reassignment history section appears
- [ ] Verify all reassignment details are visible

### Reassignment Flow
- [ ] Admin can still reassign customers
- [ ] Agent receives newly assigned customer
- [ ] Agent does NOT see who had it before
- [ ] Admin can see complete reassignment history

## Benefits

1. **Privacy**: Agents don't see internal management decisions
2. **Focus**: Agents concentrate on current work, not past history
3. **Independence**: Each agent evaluates customer independently
4. **Accountability**: Management still has full audit trail
5. **Clean Slate**: New agents start fresh with each customer

## Security Note
This is UI-level privacy. The data still exists in the database and API responses. If additional security is needed, the API endpoints can be modified to filter reassignment history based on user role before sending responses.
