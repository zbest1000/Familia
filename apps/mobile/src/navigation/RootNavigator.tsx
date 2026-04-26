import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { color } from "@familia/tokens";

import { FamilyScreen } from "../screens/FamilyScreen";
import { HealthScreen } from "../screens/HealthScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

// Five tabs per docs/02 §2.

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: color.light.surface0 },
        headerTitleStyle: { color: color.light.textPrimary },
        tabBarActiveTintColor: color.light.textPrimary,
        tabBarInactiveTintColor: color.light.textTertiary,
        tabBarStyle: { backgroundColor: color.light.surface0 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Family" component={FamilyScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
