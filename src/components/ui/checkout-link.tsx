"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getCheckoutHref, type PlanId } from "@/config/checkout";

type CheckoutLinkProps = {
  planId: PlanId;
  className?: string;
  children: ReactNode;
};

export function CheckoutLink({ planId, className, children }: CheckoutLinkProps) {
  const [href, setHref] = useState(() => getCheckoutHref(planId));

  useEffect(() => {
    setHref(getCheckoutHref(planId, window.location.search));
  }, [planId]);

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        const next = getCheckoutHref(planId, window.location.search);
        if (next !== event.currentTarget.getAttribute("href")) {
          event.preventDefault();
          window.location.assign(next);
        }
      }}
    >
      {children}
    </a>
  );
}
