"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[] | null;
  setBreadcrumbs: (items: BreadcrumbItem[] | null) => void;
  segmentMap: Record<string, string>;
  setSegmentLabel: (segment: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[] | null>(null);
  const [segmentMap, setSegmentMap] = useState<Record<string, string>>({});

  const setSegmentLabel = useCallback((segment: string, label: string) => {
    setSegmentMap((prev) => (prev[segment] === label ? prev : { ...prev, [segment]: label }));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs, segmentMap, setSegmentLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}

