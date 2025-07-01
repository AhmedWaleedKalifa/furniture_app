import { useAuth } from '@/context/AuthContext';
import { Href, router } from 'expo-router';
import { useEffect } from 'react';

export const useRoleAccess = (
    allowedRoles: string[],
    redirectTo: Href = '/' as Href // Add type annotation
  ) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        router.replace(redirectTo);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo]);

  return {
    hasAccess: user ? allowedRoles.includes(user.role) : false,
    user,
    isLoading
  };
};

export const useClientOnly = () => useRoleAccess(['client']);
export const useCompanyOnly = () => useRoleAccess(['company']);
export const useAdminOnly = () => useRoleAccess(['admin']);
export const useCompanyAndAdmin = () => useRoleAccess(['company', 'admin']);
