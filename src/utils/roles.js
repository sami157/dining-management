export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const isSuperAdminRole = (role) => role === ROLES.SUPER_ADMIN;
