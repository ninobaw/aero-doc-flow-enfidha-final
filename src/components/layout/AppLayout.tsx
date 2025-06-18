import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="temp-app-layout">
      {children}
    </div>
  );
};