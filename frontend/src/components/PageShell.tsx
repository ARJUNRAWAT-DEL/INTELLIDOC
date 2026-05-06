import React from "react";
import { useLocation } from "react-router-dom";
import CosmicBackdrop from "./CosmicBackdrop";

const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname || "";

  if (path === "/") {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#05070D] relative overflow-hidden">
        {children}
      </div>
    );
  }

  const disableAnimationFor = ["/how-it-works"];
  const disableAnim = disableAnimationFor.some(
    (p) => path === p || path.startsWith(p + "/"),
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#05070D] relative overflow-hidden">
      <CosmicBackdrop />

      <div className="absolute inset-0 bg-[#02040A]/90 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        <div className={`${disableAnim ? "" : "enter-slide-up"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageShell;
