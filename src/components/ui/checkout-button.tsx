"use client";

import { useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { getCheckoutHref, type PlanId } from "@/config/checkout";
import { Button } from "@/components/ui/button";

type ButtonVariant = ComponentPropsWithoutRef<typeof Button>["variant"];

type CheckoutButtonProps = {
  planId: PlanId;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function CheckoutButton({
  planId,
  variant,
  className,
  children,
}: CheckoutButtonProps) {
  const [href, setHref] = useState(() => getCheckoutHref(planId));

  useEffect(() => {
    setHref(getCheckoutHref(planId, window.location.search));
  }, [planId]);

  return (
    <Button
      href={href}
      variant={variant}
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
    </Button>
  );
}
