import React from "react";

const CodeContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-hover-light-bg p-4 rounded-lg border border-border-light">
      <code className="text-xs text-primary-dark block whitespace-pre-wrap">
        {children}
      </code>
    </div>
  );
};

export default CodeContainer;
