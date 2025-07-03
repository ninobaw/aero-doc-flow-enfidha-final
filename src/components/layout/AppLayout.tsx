import React, { useEffect } from 'react'; // Import useEffect
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, resetActivityTimer } = useAuth();

  useEffect(() => {
    if (user) {
      const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
      const handleActivity = () => {
        console.log('AppLayout: User activity detected. Resetting timer.'); // ADDED LOG
        resetActivityTimer();
      };

      // Add event listeners
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      console.log('AppLayout: Initial timer reset on mount for logged-in user.'); // ADDED LOG
      resetActivityTimer(); // Initial reset when component mounts and user is logged in

      // Cleanup event listeners on component unmount
      return () => {
        console.log('AppLayout: Cleaning up activity event listeners.'); // ADDED LOG
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    } else {
      console.log('AppLayout: No user, not setting up activity listeners.'); // ADDED LOG
    }
  }, [user, resetActivityTimer]); // Re-run effect if user or resetActivityTimer changes

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};