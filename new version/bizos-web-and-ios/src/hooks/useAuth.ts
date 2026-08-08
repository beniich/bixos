import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: string, name: string, orgId: string, role: string, email: string } | null>({
    id: 'user-1',
    name: 'Admin BizOS',
    orgId: 'org-1',
    role: 'SUPER_ADMIN',
    email: 'admin@bizos.com'
  });

  return { user };
}
