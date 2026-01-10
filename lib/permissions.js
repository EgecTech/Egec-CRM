// lib/permissions.js

/**
 * Permission matrix for all roles
 */
const PERMISSIONS = {
  superadmin: {
    customers: ['view_all', 'create', 'edit_all', 'delete', 'assign', 'export_all', 'import'],
    users: ['view_all', 'create', 'edit_all', 'delete', 'assign_roles'],
    followups: ['view_all', 'create', 'edit_all', 'delete'],
    audit: ['view_all', 'export'],
    settings: ['manage'],
    reports: ['view_all', 'export']
  },
  admin: {
    customers: ['view_all', 'create', 'edit_all', 'assign', 'export_all', 'import'],
    users: ['view_all', 'create', 'edit_all', 'assign_roles_limited'], // Cannot create superadmin
    followups: ['view_all', 'create', 'edit_all'],
    audit: [],
    settings: ['view'],
    reports: ['view_all', 'export']
  },
  superagent: {
    customers: ['view_all', 'create', 'edit_all', 'assign', 'export_all', 'import'],
    users: [], // Cannot manage users at all
    followups: ['view_all', 'create', 'edit_all'],
    audit: [],
    settings: ['view'],
    reports: ['view_all', 'export']
  },
  dataentry: {
    customers: ['view_own', 'create', 'edit_own_15min'],
    users: [],
    followups: [],
    audit: [],
    settings: [],
    reports: ['view_own']
  },
  agent: {
    customers: ['view_assigned', 'edit_assigned'], // Removed 'create'
    users: [],
    followups: ['view_own', 'create', 'edit_own'],
    audit: [],
    settings: [],
    reports: ['view_own']
  }
};

/**
 * Check if user has permission for a specific action
 */
export function checkPermission(role, resource, action) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) {
    console.warn(`Unknown role: ${role}`);
    return false;
  }
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) {
    return false;
  }
  
  return resourcePermissions.includes(action);
}

/**
 * Check if user can view a specific customer
 */
export function canViewCustomer(role, userId, customer) {
  if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
    return true;
  }
  
  if (role === 'dataentry') {
    return customer.createdBy?.toString() === userId;
  }
  
  if (role === 'agent') {
    // Check if user is the primary agent
    if (customer.assignment?.assignedAgentId?.toString() === userId) {
      return true;
    }
    
    // Check if user is in the assignedAgents array
    if (customer.assignment?.assignedAgents && Array.isArray(customer.assignment.assignedAgents)) {
      const isAssigned = customer.assignment.assignedAgents.some(
        agent => agent.isActive && agent.agentId?.toString() === userId
      );
      if (isAssigned) {
        return true;
      }
    }
    
    return false;
  }
  
  return false;
}

/**
 * Check if user can edit a specific customer
 */
export function canEditCustomer(role, userId, customer) {
  if (role === 'superadmin' || role === 'admin' || role === 'superagent') {
    return true;
  }
  
  if (role === 'dataentry') {
    // Check 15-minute edit window
    const createdAt = new Date(customer.createdAt);
    const now = new Date();
    const minutesSinceCreation = (now - createdAt) / 1000 / 60;
    
    const isOwner = customer.createdBy?.toString() === userId;
    const withinWindow = minutesSinceCreation <= 15;
    
    return isOwner && withinWindow;
  }
  
  if (role === 'agent') {
    // Check if user is the primary agent
    if (customer.assignment?.assignedAgentId?.toString() === userId) {
      return true;
    }
    
    // Check if user is in the assignedAgents array
    if (customer.assignment?.assignedAgents && Array.isArray(customer.assignment.assignedAgents)) {
      const isAssigned = customer.assignment.assignedAgents.some(
        agent => agent.isActive && agent.agentId?.toString() === userId
      );
      if (isAssigned) {
        return true;
      }
    }
    
    return false;
  }
  
  return false;
}

/**
 * Get edit window remaining time for data entry users
 */
export function getEditWindowRemaining(customer) {
  const createdAt = new Date(customer.createdAt);
  const now = new Date();
  const minutesSinceCreation = (now - createdAt) / 1000 / 60;
  const remainingMinutes = Math.max(0, 15 - minutesSinceCreation);
  
  return {
    canEdit: remainingMinutes > 0,
    remainingMinutes: Math.floor(remainingMinutes),
    remainingSeconds: Math.floor((remainingMinutes % 1) * 60)
  };
}

/**
 * Check if user can create users with a specific role
 */
export function canAssignRole(userRole, targetRole) {
  if (userRole === 'superadmin') {
    return true; // Can assign any role
  }
  
  if (userRole === 'admin') {
    // Admin cannot create superadmin
    return targetRole !== 'superadmin';
  }
  
  return false;
}

/**
 * Get allowed roles for user creation
 */
export function getAllowedRoles(userRole) {
  if (userRole === 'superadmin') {
    return ['superadmin', 'admin', 'superagent', 'agent', 'dataentry'];
  }
  
  if (userRole === 'admin') {
    return ['admin', 'superagent', 'agent', 'dataentry'];
  }
  
  return [];
}

/**
 * Build customer query based on user role
 */
export function buildCustomerQuery(role, userId) {
  const query = { isDeleted: false };
  
  if (role === 'agent') {
    // Agents see customers where they are:
    // 1. The primary assigned agent, OR
    // 2. In the assignedAgents array with isActive=true
    query.$or = [
      { 'assignment.assignedAgentId': userId },
      {
        'assignment.assignedAgents': {
          $elemMatch: {
            agentId: userId,
            isActive: true
          }
        }
      }
    ];
  } else if (role === 'dataentry') {
    // Data entry sees only their created customers
    query.createdBy = userId;
  }
  // Admin and superadmin see all customers (no additional filter)
  
  return query;
}

/**
 * Build followup query based on user role
 */
export function buildFollowupQuery(role, userId) {
  const query = {};
  
  if (role === 'agent') {
    // Agents see only their followups
    query.agentId = userId;
  }
  // Admin and superadmin see all followups (no additional filter)
  
  return query;
}
