"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
  active: boolean;
};

/** Renders global overlays at document.body (escapes card overflow/transform stacking). */
export function AppOverlayPortal({ children, active }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !active) return null;
  return createPortal(children, document.body);
}
