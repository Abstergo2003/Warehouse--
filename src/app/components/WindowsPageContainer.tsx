'use client'

import { NavPageContainer } from 'react-windows-ui';

export default function WindowsPageContainer({ children }: { children: React.ReactNode }) {
  return (
    <NavPageContainer hasPadding={true}>
      {children}
    </NavPageContainer>
  );
}
