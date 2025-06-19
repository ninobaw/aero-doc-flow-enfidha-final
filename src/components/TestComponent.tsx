import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-md text-blue-800">
      <h2 className="text-xl font-bold">Test Component</h2>
      <p>If you see this, JSX compilation is working!</p>
    </div>
  );
};