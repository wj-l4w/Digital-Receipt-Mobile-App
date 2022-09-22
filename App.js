import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingPage from "./app/screens/LandingPage";
import Login from "./app/screens/LoginPage";
import Register from "./app/screens/RegisterPage";
import Receipt from "./app/screens/ReceiptPage";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
	const Stack = createNativeStackNavigator();

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="LandingPage">
					<Stack.Screen
						name="LandingPage"
						component={LandingPage}
						options={{ title: "Welcome" }}
					/>
					<Stack.Screen
						name="LoginPage"
						component={Login}
						options={{ title: "Login" }}
					/>
					<Stack.Screen
						name="RegisterPage"
						component={Register}
						options={{ title: "Register" }}
					/>
					<Stack.Screen
						name="ReceiptPage"
						component={Receipt}
						options={{ title: "Receipts" }}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
