// /gaia-brain/types.ts

export interface BrainContext {
  user: any | null;
  timeline: {
    phase: number;
  };
  health: Record<string, any>;
  wealth: Record<string, any>;
  flags: {
    isLocked?: boolean;
    isBanned?: boolean;
  };
  now: Date;
}
