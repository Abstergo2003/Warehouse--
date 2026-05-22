'use client'

import { AppTheme } from 'react-windows-ui';
import { useEffect, useState } from 'react';

export default function WindowsAppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppTheme scheme="system" />
      {children}
    </>
  );
}
