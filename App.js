import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
	getAuth,
	onAuthStateChanged,
	setPersistence,
	browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import LandingPage from "./app/screens/LandingPage";
import Login from "./app/screens/LoginPage";
import Register from "./app/screens/RegisterPage";
import Receipt from "./app/screens/ReceiptPage";
import Bookmark from "./app/screens/BookmarkPage";
import Setting from "./app/screens/SettingPage";
import Detail from "./app/screens/DetailPage";
import QR from "./app/screens/QRPage";
import colors from "./app/assets/config/colors";
import firebaseConfig from "./app/assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);
//Setting firebase persistence
// setPersistence(firebaseAuth, browserLocalPersistence);
//Initialize Firestore
const firebaseDB = getFirestore(firebaseApp);

export default function App() {
	const Stack = createNativeStackNavigator();
	const Tab = createBottomTabNavigator();

	//States
	const [isLoggedIn, setLogin] = React.useState(false);

	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			//User is signed in
			setLogin(true);
		} else {
			setLogin(false);
		}
	});

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
				{!isLoggedIn ? (
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
									iconName = focused ? "ios-settings" : "ios-settings-outline";
								} else if (route.name === "QRPage") {
									iconName = "qr-code";
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
							name="QRPage"
							component={QR}
							options={{ title: "Scan" }}
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
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
