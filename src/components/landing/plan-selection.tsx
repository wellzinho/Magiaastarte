"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { PlanId } from "@/config/checkout";

type PlanSelection = {
  selected: PlanId;
  select: (planId: PlanId) => void;
};

const PlanSelectionContext = createContext<PlanSelection | null>(null);

/** Shared "which version is chosen" state for the offer block, sticky bar and version-specific CTAs. */
export function PlanSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<PlanId>("practice");

  return (
    <PlanSelectionContext.Provider value={{ selected, select: setSelected }}>
      {children}
    </PlanSelectionContext.Provider>
  );
}

export function usePlanSelection(): PlanSelection {
  const context = useContext(PlanSelectionContext);
  if (!context) {
    throw new Error("usePlanSelection must be used inside PlanSelectionProvider");
  }
  return context;
}
