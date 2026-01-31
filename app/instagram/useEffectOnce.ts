"use client";

import { useEffect, useRef } from "react";

/**
 * @deprecated Use useEffect with proper dependency array instead.
 * This hook is no longer recommended as it can cause stale closures.
 *
 * Before: useEffectOnce(() => { setup code })
 * After: useEffect(() => { setup code }, [])
 */
export function useEffectOnce(effect: () => void | (() => void)) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return effect();
  }, [effect]);
}
