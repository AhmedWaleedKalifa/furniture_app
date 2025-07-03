import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export const useRoleAccess = (allowedRoles: string[]) => {
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setHasAccess(allowedRoles.includes(user.role));
    }
  }, [user, isLoading, allowedRoles]);

  return { hasAccess, isLoading };
};

export const useAdminOnly = () => {
  return useRoleAccess(['admin']);
};

export const useCompanyOnly = () => {
  return useRoleAccess(['company']);
};

export const useClientOnly = () => {
  return useRoleAccess(['client']);
};
