import type { Config } from "tailwindcss";

import { color, fontSize, radius, space } from "@familia/tokens";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui-web/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface0: color.light.surface0,
        surface1: color.light.surface1,
        surface2: color.light.surface2,
        textPrimary: color.light.textPrimary,
        textSecondary: color.light.textSecondary,
        textTertiary: color.light.textTertiary,
        statusInfo: color.light.statusInfo,
        statusSuccess: color.light.statusSuccess,
        statusWarning: color.light.statusWarning,
        statusCritical: color.light.statusCritical,
      },
      spacing: Object.fromEntries(
        Object.entries(space).map(([k, v]) => [k, `${v}px`]),
      ),
      borderRadius: Object.fromEntries(
        Object.entries(radius).map(([k, v]) => [k, `${v}px`]),
      ),
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([k, v]) => [k, `${v}px`]),
      ),
    },
  },
  plugins: [],
};

export default config;
