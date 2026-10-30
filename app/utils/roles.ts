export type AppRole = 'manager' | 'employee';

/**
 * Normalizes any role string received from backend or local storage
 * to a standardized application role.
 */
export const normalizeRole = (role?: string | null): AppRole => {
  if (!role) return 'employee';
  const normalized = role.trim().toLowerCase();
  if (normalized === 'manager' || normalized === 'admin') {
    return 'manager';
  }
  return 'employee';
};

/**
 * Check if the given role has Manager / Admin privileges.
 */
export const isManagerRole = (role?: string | null): boolean => {
  return normalizeRole(role) === 'manager';
};

/**
 * Check if the given role is an Employee / Customer Success associate.
 */
export const isEmployeeRole = (role?: string | null): boolean => {
  return normalizeRole(role) === 'employee';
};
