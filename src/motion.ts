export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_SMOOTH = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT_SMOOTH = [0.4, 0, 0.2, 1] as const;

export const OVERLAY_TRANSITION = {
  duration: 0.26,
  ease: EASE_IN_OUT_SMOOTH,
} as const;

export const PANEL_TRANSITION = {
  duration: 0.34,
  ease: EASE_OUT_SMOOTH,
} as const;

export const PANEL_EXIT_TRANSITION = {
  duration: 0.24,
  ease: EASE_IN_OUT_SMOOTH,
} as const;

export const SHEET_TRANSITION = {
  duration: 0.42,
  ease: EASE_OUT_SMOOTH,
} as const;

export const SURFACE_ENTER_TRANSITION = {
  duration: 0.52,
  ease: EASE_OUT_EXPO,
} as const;

export const TOAST_TRANSITION = {
  duration: 0.34,
  ease: EASE_OUT_SMOOTH,
} as const;
