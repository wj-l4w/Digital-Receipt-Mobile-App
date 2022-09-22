import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingPage from "./app/screens/LandingPage";
import Login from "./app/screens/Login";

export default function App() {
	const Stack = createNativeStackNavigator();

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="LandingPage">
				<Stack.Screen
					name="LandingPage"
					component={LandingPage}
					options={{ title: "Welcome" }}
				/>
				<Stack.Screen
					name="Login"
					component={Login}
					options={{ title: "Login" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
