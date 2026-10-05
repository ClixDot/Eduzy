'use client';

import { FlowButton } from "@/components/ui/flow-button";

export const FlowButtonDemo = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '1rem' }}>
      <FlowButton text="Flow Button" />
    </div>
  );
};

export default FlowButtonDemo;
