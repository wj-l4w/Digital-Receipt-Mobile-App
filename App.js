import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
import colors from "./app/assets/config/colors";
import firebaseConfig from "./app/assets/config/firebaseconfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore();

const PERSISTENCE_KEY_1 = "AUTO_EXPIRY_ON";
const PERSISTENCE_KEY_2 = "AUTO_EXPIRY_DAYS";
const PERSISTENCE_KEY_3 = "DARK_MODE";

export default function App() {
	const Stack = createNativeStackNavigator();
	const Tab = createBottomTabNavigator();

	//States
	const [isLoggedIn, setLogin] = useState(false);

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

				//Dark Mode
				const darkModeState = await AsyncStorage.getItem(PERSISTENCE_KEY_3);
				const darkModeResult = darkModeState
					? JSON.parse(darkModeState)
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
									console.log("Auto delete found no old receipts to delete.");
								}
							} catch (e) {
								console.log(
									"Something went wrong when deleting old receipts\n" + e
								);
							}
						}
					}
				}
			}

			deleteReceipts();
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
							tabBarActiveTintColor: colors.primary,
							tabBarInactiveTintColor: "gray",
							tabBarShowLabel: false,
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
