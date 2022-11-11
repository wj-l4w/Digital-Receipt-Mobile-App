import {
	NavigationContainer,
	DefaultTheme,
	DarkTheme,
	useTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
	collection,
	deleteDoc,
	getDocs,
	getFirestore,
	query,
	where,
} from "firebase/firestore";

import LandingPage from "./app/screens/LandingPage";
import Login from "./app/screens/LoginPage";
import Register from "./app/screens/RegisterPage";
import Receipt from "./app/screens/ReceiptPage";
import Bookmark from "./app/screens/BookmarkPage";
import Setting from "./app/screens/SettingPage";
import Detail from "./app/screens/DetailPage";
import QR from "./app/screens/QRPage";
import firebaseConfig from "./app/assets/config/firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore();

const PERSISTENCE_KEY_1 = "AUTO_EXPIRY_ON";
const PERSISTENCE_KEY_2 = "AUTO_EXPIRY_DAYS";

//Themes
const myLightTheme = {
	...DefaultTheme,
	dark: false,
	colors: {
		...DefaultTheme.colors,
		lightBlue: "rgb(72, 202, 228)",
		primary: "rgb(72, 202, 228)",
		secondary: "rgb(173, 232, 244)",
		background: "rgb(255, 255, 255)",
		darkerBackground: "rgb(238, 238, 238)",
		text: "rgb(0, 0, 0)",
		disabled: "rgb(150, 150, 150)",
		enabled: "rgb(95, 221, 88)",
		switches: "rgb(255, 240, 240)",
	},
};
const myDarkTheme = {
	...DarkTheme,
	dark: true,
	colors: {
		...DarkTheme.colors,
		lightBlue: "rgb(72, 202, 228)",
		primary: "rgb(0,94,179)",
		secondary: "rgb(0,171,217)",
		background: "rgb(24, 24, 24)",
		darkerBackground: "rgb(12, 12, 12)",
		text: "rgb(255, 255, 255)",
		disabled: "rgb(217, 217, 217)",
		enabled: "rgb(95, 221, 88)",
		switches: "rgb(255, 240, 240)",
	},
};

export default function App() {
	const Stack = createNativeStackNavigator();
	const Tab = createBottomTabNavigator();

	//States
	const [isLoggedIn, setLogin] = useState(false);
	const colorScheme = useColorScheme();

	//Theme
	var colors;
	if (colorScheme === "dark") {
		colors = myDarkTheme.colors;
	} else {
		colors = myLightTheme.colors;
	}
	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			//User is signed in
			setLogin(true);

			async function deleteReceipts() {
				//Get settings if they exist
				//Auto expiry on/off
				const autoExpiryOnState = await AsyncStorage.getItem(PERSISTENCE_KEY_1);
				const autoExpiryOnResult = autoExpiryOnState
					? JSON.parse(autoExpiryOnState)
					: undefined;

				//Auto expiry days
				const autoExpiryDayState = await AsyncStorage.getItem(
					PERSISTENCE_KEY_2
				);
				const autoExpiryDayResult = autoExpiryDayState
					? JSON.parse(autoExpiryDayState)
					: undefined;

				//Auto delete if auto delete was set to on and auto expiry days was set
				if (
					autoExpiryOnResult !== undefined &&
					autoExpiryDayResult !== undefined
				) {
					if (autoExpiryOnResult == true) {
						//Is auto expiry days >0?
						if (autoExpiryDayResult > 0) {
							//Now
							const now = Date.now();

							//Old Receipt Threshold
							const diff = autoExpiryDayResult * (1000 * 60 * 60 * 24); //Millisecs in a day
							const thresholdTime = now - diff;

							//Get all receipts that are older than (Less millisecs since epoch) the threshold
							const userReceiptCollection = collection(
								firestore,
								"users/" + user.uid + "/receipts"
							);
							const q = query(
								userReceiptCollection,
								where("receipt.time", "<=", thresholdTime)
							);

							//Deleting old receipts
							try {
								const querySnapshot = await getDocs(q);
								if (querySnapshot.size > 0) {
									querySnapshot.forEach((doc) => {
										console.log("Attempting to delete receipt " + doc.id);

										deleteDoc(doc.ref);
									});
								} else {
									console.log("No old receipts to delete.");
								}
							} catch (e) {
								console.log(
									"Something went wrong when deleting old receipts\n" + e
								);
							}
						}
					}
				} else {
					console.log("Auto delete is not turned on.");
				}
			}

			deleteReceipts();
		} else {
			setLogin(false);
		}
	});

	function HomeComponent() {
		return (
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: colors.background,
					},
				}}>
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
			<NavigationContainer
				theme={colorScheme === "dark" ? myDarkTheme : myLightTheme}>
				{!isLoggedIn ? (
					<Stack.Navigator
						screenOptions={{
							headerStyle: {
								backgroundColor: colors.background,
							},
						}}>
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
								let iconSize;

								if (route.name === "Home") {
									iconName = focused ? "ios-home" : "ios-home-outline";
								} else if (route.name === "BookmarkPage") {
									iconName = focused ? "bookmark" : "bookmark-outline";
								} else if (route.name === "SettingPage") {
									iconName = focused ? "ios-settings" : "ios-settings-outline";
								} else if (route.name === "QRPage") {
									iconName = "qr-code";
								}
								iconSize = focused ? 32 : 24;

								return (
									<Ionicons name={iconName} size={iconSize} color={color} />
								);
							},
							tabBarActiveTintColor: colors.lightBlue,
							tabBarInactiveTintColor: colors.disabled,
							tabBarShowLabel: false,
							headerStyle: {
								backgroundColor: colors.background,
							},
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
