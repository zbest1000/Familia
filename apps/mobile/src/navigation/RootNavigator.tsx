import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { color } from "@familia/tokens";

import { bootstrapSession, onAuthChange } from "../lib/api";
import { AuthStack } from "./AuthStack";
import { FamilyScreen } from "../screens/FamilyScreen";
import { HealthScreen } from "../screens/HealthScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

// Five tabs per docs/02 §2.

const Tab = createBottomTabNavigator();

function MainTabs() {
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

export function RootNavigator() {
  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void (async () => {
      const { accessToken } = await bootstrapSession();
      setSignedIn(Boolean(accessToken));
      setHydrated(true);
    })();
    const unsub = onAuthChange((token) => setSignedIn(Boolean(token)));
    return () => unsub();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: color.light.surface0 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return signedIn ? <MainTabs /> : <AuthStack />;
}
