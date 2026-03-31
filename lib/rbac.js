// Role definitions and permission helpers

export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
}

// What each role can do
const PERMISSIONS = {
  admin: [
    'machines:create',
    'machines:read',
    'machines:update',
    'machines:delete',
    'alerts:read',
    'alerts:acknowledge',
    'maintenance:create',
    'maintenance:read',
    'maintenance:update',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'ai:read',
  ],
  operator: [
    'machines:read',
    'alerts:read',
    'alerts:acknowledge',
    'maintenance:create',
    'maintenance:read',
    'maintenance:update',
    'ai:read',
  ],
}

export function hasPermission(role, permission) {
  if (!role || !PERMISSIONS[role]) return false
  return PERMISSIONS[role].includes(permission)
}

export function isAdmin(role) {
  return role === ROLES.ADMIN
}

export function isOperator(role) {
  return role === ROLES.OPERATOR
}

export function getRoleLabel(role) {
  return role === ROLES.ADMIN ? 'Administrator' : 'Operator'
}

export function getRoleBadgeColor(role) {
  return role === ROLES.ADMIN
    ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}
