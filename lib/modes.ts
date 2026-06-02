export interface Mode {
  time: number; // seconds
  minLen: number; // minimum allowed word length
}

export const DEFAULT_MODE: Mode = { time: 60, minLen: 2 };

export const TIME_OPTIONS: number[] = [30, 60, 120];

export const DIFFICULTY_OPTIONS: { label: string; minLen: number }[] = [
  { label: 'Easy', minLen: 2 },
  { label: 'Normal', minLen: 3 },
  { label: 'Hard', minLen: 4 },
];

export function modeLabel(mode: Mode): string {
  return `${mode.time}s · ${mode.minLen}+`;
}

export function isDefaultMode(mode: Mode): boolean {
  return mode.time === DEFAULT_MODE.time && mode.minLen === DEFAULT_MODE.minLen;
}
