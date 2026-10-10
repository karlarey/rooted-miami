"use client";

import { useCallback, useState } from "react";
import { levelOrder } from "@/lib/levels";
import type { LevelId } from "@/lib/types";

/**
 * Detects a level-up between renders so the journey page can celebrate it.
 *
 * - Never fires on first load.
 * - Pass `ready` from `useJourney()` so hydrating from storage (seed → stored
 *   level) is treated as the baseline, not as a level-up.
 * - Only fires when the level goes up; a reset or a drop clears it.
 *
 * Usage:
 *   const { level, ready } = useJourney();
 *   const { celebrating, dismiss } = useLevelUp(level, ready);
 *   {celebrating && <LevelUpCelebration level={celebrating} onClose={dismiss} />}
 */
export function useLevelUp(level: LevelId, ready = true) {
  const [prev, setPrev] = useState({ level, ready });
  const [celebrating, setCelebrating] = useState<LevelId | null>(null);

  // Adjust state during render when inputs change (React's recommended
  // alternative to an effect for "previous value" comparisons).
  if (prev.level !== level || prev.ready !== ready) {
    setPrev({ level, ready });
    const rose = levelOrder.indexOf(level) > levelOrder.indexOf(prev.level);
    if (prev.ready && ready && rose) setCelebrating(level);
    else if (!rose) setCelebrating(null);
  }

  const dismiss = useCallback(() => setCelebrating(null), []);

  return { celebrating, dismiss };
}
