import React from "react"; // React is needed for JSX

const EmptyState = ({ children }) => { 
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {children}
    </div>
  );
};

export default EmptyState;