import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const TestAuthComponent: React.FC = () => {
  const { user, isLoading, hasPermission } = useAuth();

  console.log('TestAuthComponent: user:', user);
  console.log('TestAuthComponent: isLoading:', isLoading);
  console.log('TestAuthComponent: hasPermission("view_documents"):', hasPermission('view_documents'));

  if (isLoading) {
    return <div>TestAuthComponent: Chargement de l'authentification...</div>;
  }

  if (user) {
    return <div>TestAuthComponent: Utilisateur connecté: {user.email}</div>;
  }

  return <div>TestAuthComponent: Aucun utilisateur connecté.</div>;
};