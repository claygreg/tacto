"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";

export function BreadcrumbSetter({ segment, label }: { segment: string; label: string }) {
  const { setSegmentLabel } = useBreadcrumb();

  useEffect(() => {
    if (segment && label) {
      setSegmentLabel(segment, label);
    }
  }, [segment, label, setSegmentLabel]);

  return null;
}
