import { useMemo } from 'react';
import { UserRole, getAvailableRoutes, getRolePermissions } from '@/types/roles';
import { Permission } from '@/types/permission';
import { useAuth } from '@/contexts/AuthContext';

export const useRoleBasedRoutes = () => {
    const { user } = useAuth();

    const availableRoutes = useMemo(() => {
        if (!user) return [];
        
        // Если у пользователя нет прав в массиве, используем права по умолчанию для роли
        const userPermissions = user.permissions && user.permissions.length > 0 
            ? user.permissions 
            : getRolePermissions(user.role);
        
        return getAvailableRoutes(user.role, userPermissions);
    }, [user]);

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        
        // Используем права по умолчанию для роли, если у пользователя нет прав в массиве
        const userPermissions = user.permissions && user.permissions.length > 0 
            ? user.permissions 
            : getRolePermissions(user.role);
            
        return userPermissions.includes(permission);
    };

    const hasRole = (role: UserRole): boolean => {
        if (!user) return false;
        return user.role === role;
    };

    const canAccessRoute = (routePath: string): boolean => {
        if (!user) return false;
        
        const route = availableRoutes.find(r => r.path === routePath);
        return !!route;
    };

    const getUserRole = (): UserRole | null => {
        return user?.role || null;
    };

    const isAdmin = (): boolean => {
        return user?.role === UserRole.ADMIN;
    };

    const isStoreOwner = (): boolean => {
        return user?.role === UserRole.STORE_OWNER;
    };

    const isManager = (): boolean => {
        return user?.role === UserRole.MANAGER;
    };

    const isCustomer = (): boolean => {
        return user?.role === UserRole.CUSTOMER;
    };

    const getUserStoreId = (): number | null => {
        return user?.storeId || null;
    };

    return {
        availableRoutes,
        hasPermission,
        hasRole,
        canAccessRoute,
        getUserRole,
        isAdmin,
        isStoreOwner,
        isManager,
        isCustomer,
        getUserStoreId,
        user
    };
};
