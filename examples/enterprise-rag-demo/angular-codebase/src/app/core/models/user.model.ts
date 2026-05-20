/**
 * User and Role Models
 * RetailOps PXM - User Management
 */

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer' | 'supplier';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  supplierId?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export type PermissionResource = 
  | 'products'
  | 'skus'
  | 'categories'
  | 'suppliers'
  | 'channels'
  | 'approvals'
  | 'bulk-upload'
  | 'analytics'
  | 'settings'
  | 'users';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'publish';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'approve', 'publish'] },
    { resource: 'skus', actions: ['create', 'read', 'update', 'delete', 'approve', 'publish'] },
    { resource: 'categories', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'suppliers', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'channels', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'approvals', actions: ['read', 'approve'] },
    { resource: 'bulk-upload', actions: ['create', 'read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
  ],
  manager: [
    { resource: 'products', actions: ['create', 'read', 'update', 'approve'] },
    { resource: 'skus', actions: ['create', 'read', 'update', 'approve'] },
    { resource: 'categories', actions: ['read', 'update'] },
    { resource: 'suppliers', actions: ['read'] },
    { resource: 'channels', actions: ['read'] },
    { resource: 'approvals', actions: ['read', 'approve'] },
    { resource: 'bulk-upload', actions: ['create', 'read'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  editor: [
    { resource: 'products', actions: ['create', 'read', 'update'] },
    { resource: 'skus', actions: ['create', 'read', 'update'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'suppliers', actions: ['read'] },
    { resource: 'channels', actions: ['read'] },
    { resource: 'bulk-upload', actions: ['create', 'read'] },
  ],
  viewer: [
    { resource: 'products', actions: ['read'] },
    { resource: 'skus', actions: ['read'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'channels', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  supplier: [
    { resource: 'products', actions: ['create', 'read', 'update'] },
    { resource: 'skus', actions: ['create', 'read', 'update'] },
    { resource: 'bulk-upload', actions: ['create', 'read'] },
  ],
};
