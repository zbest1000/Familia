import { color, radius, space } from "@familia/tokens";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.light.surface1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.light.borderSubtle,
    padding: space.s4,
  },
});
