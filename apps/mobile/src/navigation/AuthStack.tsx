import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn">
        {({ navigation }) => (
          <SignInScreen onSwitchToSignUp={() => navigation.navigate("SignUp")} />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen onSwitchToSignIn={() => navigation.navigate("SignIn")} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
