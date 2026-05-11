export const allRoles = ['ADMIN', 'WAREHOUSE_MANAGER', 'SAFETY_OFFICER', 'INSPECTOR', 'GENERAL_USER'];

export const routeRoles: Record<string, string[]> = {
  '/dashboard': allRoles,
  '/cylinders': ['ADMIN', 'WAREHOUSE_MANAGER'],
  '/flow': ['ADMIN', 'WAREHOUSE_MANAGER'],
  '/inspections': ['ADMIN', 'SAFETY_OFFICER', 'INSPECTOR'],
  '/maintenance': ['ADMIN', 'SAFETY_OFFICER'],
  '/warnings': ['ADMIN', 'SAFETY_OFFICER'],
  '/trace': allRoles,
  '/approvals': ['ADMIN', 'WAREHOUSE_MANAGER', 'SAFETY_OFFICER'],
  '/users': ['ADMIN'],
  '/profile': allRoles,
};

export const canAccess = (role: string | undefined, path: string) => {
  if (!role) return false;
  const roles = routeRoles[path] || allRoles;
  return roles.includes(role);
};

