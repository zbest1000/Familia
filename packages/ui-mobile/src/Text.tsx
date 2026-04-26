import { color, fontSize, fontWeight, lineHeight } from "@familia/tokens";
import type { ReactNode } from "react";
import { Text as RNText, StyleSheet, type TextStyle } from "react-native";

type Variant = "display" | "h1" | "h2" | "h3" | "body" | "bodySmall" | "label" | "legal";

type Props = {
  variant?: Variant;
  children: ReactNode;
  style?: TextStyle;
  emphasis?: "primary" | "secondary" | "tertiary";
};

export function Text({ variant = "body", emphasis = "primary", children, style }: Props) {
  return (
    <RNText style={[styles[variant], styles[emphasis], style]}>{children}</RNText>
  );
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, lineHeight: fontSize.display * lineHeight.tight, fontWeight: fontWeight.bold },
  h1: { fontSize: fontSize.h1, lineHeight: fontSize.h1 * lineHeight.tight, fontWeight: fontWeight.semibold },
  h2: { fontSize: fontSize.h2, lineHeight: fontSize.h2 * lineHeight.tight, fontWeight: fontWeight.semibold },
  h3: { fontSize: fontSize.h3, lineHeight: fontSize.h3 * lineHeight.tight, fontWeight: fontWeight.semibold },
  body: { fontSize: fontSize.body, lineHeight: fontSize.body * lineHeight.body, fontWeight: fontWeight.regular },
  bodySmall: { fontSize: fontSize.bodySmall, lineHeight: fontSize.bodySmall * lineHeight.body, fontWeight: fontWeight.regular },
  label: { fontSize: fontSize.label, lineHeight: fontSize.label * lineHeight.body, fontWeight: fontWeight.medium },
  legal: { fontSize: fontSize.legal, lineHeight: fontSize.legal * lineHeight.body, fontWeight: fontWeight.regular },
  primary: { color: color.light.textPrimary },
  secondary: { color: color.light.textSecondary },
  tertiary: { color: color.light.textTertiary },
});
