// Design tokens — single source of truth for native + web.
// Light + dark equivalents per token. See docs/12_COMPONENT_INVENTORY.md.

export const color = {
  light: {
    surface0: "#FFFFFF",
    surface1: "#F8F9FB",
    surface2: "#EFF1F4",
    surface3: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textTertiary: "#94A3B8",
    textInverse: "#FFFFFF",
    textSensitive: "#3B2F63",
    borderSubtle: "#E2E8F0",
    borderStrong: "#CBD5E1",
    statusInfo: "#0EA5E9",
    statusSuccess: "#16A34A",
    statusWarning: "#D97706",
    statusCritical: "#DC2626",
    tierStandard: "#64748B",
    tierSensitive: "#5E5BBE",
    tierHighlySensitive: "#7C5BBE",
    sharePrivate: "#64748B",
    shareShared: "#0EA5E9",
    shareEmergency: "#DC2626",
  },
  dark: {
    surface0: "#0B1020",
    surface1: "#111729",
    surface2: "#1A2138",
    surface3: "#1E2640",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    textInverse: "#0F172A",
    textSensitive: "#C7BFFF",
    borderSubtle: "#1F273D",
    borderStrong: "#334155",
    statusInfo: "#38BDF8",
    statusSuccess: "#4ADE80",
    statusWarning: "#FBBF24",
    statusCritical: "#F87171",
    tierStandard: "#94A3B8",
    tierSensitive: "#A8A6F2",
    tierHighlySensitive: "#C4A6F2",
    sharePrivate: "#94A3B8",
    shareShared: "#38BDF8",
    shareEmergency: "#F87171",
  },
} as const;

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 48,
  s10: 64,
  s11: 80,
  s12: 96,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  display: 36,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  bodySmall: 14,
  label: 13,
  legal: 12,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: 1.15,
  body: 1.45,
  loose: 1.6,
} as const;

export const motion = {
  // Default: calm, not bouncy.
  default: { duration: 200, easing: "ease-out" },
  // Sensitive moments: deliberately slower.
  sensitive: { duration: 300, easing: "ease-in-out" },
  // Emergency: snappy.
  emergency: { duration: 150, easing: "ease-out" },
} as const;

// Touch targets — minimums for AA accessibility.
export const touch = {
  minMobile: 44,
  minWeb: 32,
} as const;

export type ColorScheme = keyof typeof color;
export type ColorToken = keyof typeof color.light;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
export type FontSizeToken = keyof typeof fontSize;
