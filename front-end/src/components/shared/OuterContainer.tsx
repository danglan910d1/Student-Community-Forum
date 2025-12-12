import React from "react";

const OuterContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-container-bg p-8 rounded-2xl shadow-post-shadow border border-border-light space-y-6">
      {children}
    </div>
  );
};

export default OuterContainer;
