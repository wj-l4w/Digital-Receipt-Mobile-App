import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as React from "react";

import LandingPage from "./app/screens/LandingPage";
import Login from "./app/screens/LoginPage";
import Register from "./app/screens/RegisterPage";
import Receipt from "./app/screens/ReceiptPage";
import Bookmark from "./app/screens/BookmarkPage";
import Setting from "./app/screens/SettingPage";
import Detail from "./app/screens/DetailPage";
import AuthContext from "./app/context/authContext";
import colors from "./app/assets/config/colors";

export default function App() {
	const Stack = createNativeStackNavigator();
	const Tab = createBottomTabNavigator();

	const [state, dispatch] = React.useReducer(
		(prevState, action) => {
			switch (action.type) {
				case "RESTORE_TOKEN":
					return {
						...prevState,
						userToken: action.token,
						isLoading: false,
					};
				case "SIGN_IN":
					return {
						...prevState,
						isSignout: false,
						userToken: action.token,
					};
				case "SIGN_OUT":
					return {
						...prevState,
						isSignout: true,
						userToken: null,
					};
			}
		},
		{
			isLoading: true,
			isSignout: false,
			userToken: null,
		}
	);

	React.useEffect(() => {
		// Fetch the token from storage then navigate to our appropriate place
		const bootstrapAsync = async () => {
			let userToken;

			try {
				userToken = await SecureStore.getItemAsync("userToken");
			} catch (e) {
				// Restoring token failed
			}

			// After restoring token, we may need to validate it in production apps

			// This will switch to the App screen or Auth screen and this loading
			// screen will be unmounted and thrown away.
			dispatch({ type: "RESTORE_TOKEN", token: userToken });
		};

		bootstrapAsync();
	}, []);

	const authContext = React.useMemo(
		() => ({
			signIn: async (data) => {
				// In a production app, we need to send some data (usually username, password) to server and get a token
				// We will also need to handle errors if sign in failed
				// After getting token, we need to persist the token using `SecureStore`
				// In the example, we'll use a dummy token

				dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
			},
			signOut: () => dispatch({ type: "SIGN_OUT" }),
			signUp: async (data) => {
				// In a production app, we need to send user data to server and get a token
				// We will also need to handle errors if sign up failed
				// After getting token, we need to persist the token using `SecureStore`
				// In the example, we'll use a dummy token

				dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
			},
		}),
		[]
	);

	function HomeComponent() {
		return (
			<Stack.Navigator>
				<Stack.Screen
					name="ReceiptPage"
					component={Receipt}
					options={{ title: "Receipts" }}
				/>
				<Stack.Screen
					name="DetailPage"
					component={Detail}
					options={({ route }) => ({
						title: route.params.receiptName + " Receipt",
					})}
				/>
			</Stack.Navigator>
		);
	}

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<AuthContext.Provider value={authContext}>
					{state.userToken == null ? (
						<Stack.Navigator>
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
						</Stack.Navigator>
					) : (
						<Tab.Navigator
							screenOptions={({ route }) => ({
								tabBarIcon: ({ focused, color, size }) => {
									let iconName;

									if (route.name === "Home") {
										iconName = focused ? "ios-home" : "ios-home-outline";
									} else if (route.name === "BookmarkPage") {
										iconName = focused ? "ios-list-circle" : "ios-list";
									} else if (route.name === "SettingPage") {
										iconName = focused
											? "ios-settings"
											: "ios-settings-outline";
									}

									return <Ionicons name={iconName} size={28} color={color} />;
								},
								tabBarActiveTintColor: colors.primary,
								tabBarInactiveTintColor: "gray",
							})}>
							<Tab.Screen
								name="Home"
								component={HomeComponent}
								options={{ headerShown: false }}
							/>
							<Tab.Screen
								name="BookmarkPage"
								component={Bookmark}
								options={{ title: "Bookmarks" }}
							/>
							<Tab.Screen
								name="SettingPage"
								component={Setting}
								options={{ title: "Settings" }}
							/>
						</Tab.Navigator>
					)}
				</AuthContext.Provider>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
