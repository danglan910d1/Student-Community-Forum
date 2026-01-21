// components/about/AboutView.tsx
"use client";

import React from "react";
import { HeroSection } from "./HeroSection";
import { TechCoreSection } from "./TechCoreSection";
import { FoundersSection } from "./FoundersSection";
import { AboutCTA } from "./AboutCTA";

export const AboutView = () => {
  return (
    <div className="flex flex-col space-y-10">
      <HeroSection />

      {/* Divider dùng biến border của hệ thống */}
      {/* <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="h-px bg-border" />
      </div> */}

      <TechCoreSection />
      <FoundersSection />
      <AboutCTA />
    </div>
  );
};
