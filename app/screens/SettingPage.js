import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	Switch,
	TextInput,
	useColorScheme,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);

const PERSISTENCE_KEY_1 = "AUTO_EXPIRY_ON";
const PERSISTENCE_KEY_2 = "AUTO_EXPIRY_DAYS";

export default function SettingPage({ navigation }) {
	//Theme
	const { colors } = useTheme();
	const colorScheme = useColorScheme();
	//Auto expiry state
	const [autoExpiryEnabled, setAutoExpiry] = useState(false);
	const toggleAutoExpiry = () => {
		setAutoExpiry((previousState) => !previousState);
		AsyncStorage.setItem(PERSISTENCE_KEY_1, JSON.stringify(!autoExpiryEnabled));
	};

	//Auto expiry days state
	const [autoExpiryDays, setAutoExpiryDays] = useState("365");

	//Save persistent changes to settings
	//And restore them if they exist
	useEffect(() => {
		async function restoreSettings() {
			//Auto expiry on/off
			const autoExpiryOnState = await AsyncStorage.getItem(PERSISTENCE_KEY_1);
			const autoExpiryOnResult = autoExpiryOnState
				? JSON.parse(autoExpiryOnState)
				: undefined;

			if (autoExpiryOnResult !== undefined) {
				setAutoExpiry(autoExpiryOnResult);
			}

			//Auto expiry days
			const autoExpiryDayState = await AsyncStorage.getItem(PERSISTENCE_KEY_2);
			const autoExpiryDayResult = autoExpiryDayState
				? JSON.parse(autoExpiryDayState)
				: undefined;

			if (autoExpiryDayResult !== undefined) {
				setAutoExpiryDays(autoExpiryDayResult);
			}

			console.log("Auto expiry:  " + autoExpiryOnResult);
			console.log("Auto expiry Days: " + autoExpiryDayResult);
		}

		restoreSettings();
	}, []);

	SplashScreen.preventAutoHideAsync();

	const [fontsLoaded] = useFonts({
		"PT Sans Regular": require("../assets/fonts/ptsans_regular.ttf"),
		"PT Sans Bold": require("../assets/fonts/ptsans_bold.ttf"),
	});

	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded) {
			await SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	const onTextChanged = (text) => {
		//Remove non-numerical chars
		var edittext = text.toString().replace(/[^0-9]/g, "");

		if (edittext == "") {
			edittext = "0";
		}

		console.log("Receipt age limit set to " + edittext + " days.");
		setAutoExpiryDays(edittext);
		AsyncStorage.setItem(PERSISTENCE_KEY_2, JSON.stringify(edittext));
	};

	const styles = StyleSheet.create({
		background: {
			flex: 1,
			alignItems: "center",
		},
		buttons: {
			marginTop: "auto",
			marginBottom: 20,
			height: 50,
			width: 200,
			backgroundColor: colors.lightBlue,
			borderRadius: 10,
			alignItems: "center",
			justifyContent: "center",
		},
		buttonText: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			fontSize: 24,
		},
		disabled: {
			opacity: 0.35,
		},
		enabled: {
			color: colors.text,
		},
		input: {
			borderColor: colors.text,
			borderWidth: 1,
			borderRadius: 4,
			backgroundColor: colors.background,
			paddingHorizontal: 12,
			marginEnd: 5,
		},
		inputView: {
			marginLeft: "auto",
			flexDirection: "row",
		},
		overlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor:
				colorScheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
		},
		settingsRow: {
			flexDirection: "row",
			width: "90%",
			alignItems: "center",
			marginVertical: 15,
		},
		switch: {
			marginLeft: "auto",
			transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
		},
		text: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			overflow: "visible",
			fontSize: 24,
			alignItems: "center",
		},
	});

	return (
		<ImageBackground
			style={{ flex: 1 }}
			source={require("../assets/landing.png")}
			onLayout={onLayoutRootView}>
			<SafeAreaView style={styles.background}>
				<View style={styles.overlay} />
				<View style={styles.settingsRow}>
					<Text style={styles.text}>Auto Receipt Expiry</Text>
					<Switch
						trackColor={{ false: colors.disabled, true: colors.enabled }}
						thumbColor={colors.switches}
						onValueChange={toggleAutoExpiry}
						value={autoExpiryEnabled}
						style={styles.switch}
					/>
				</View>
				<View
					style={[
						styles.settingsRow,
						autoExpiryEnabled ? styles.enabled : styles.disabled,
					]}>
					<Text style={styles.text}>Receipt Age Limit</Text>
					<View style={styles.inputView}>
						<TextInput
							style={[styles.text, styles.input]}
							value={autoExpiryDays}
							editable={autoExpiryEnabled ? true : false}
							onChangeText={(text) => onTextChanged(text)}
							keyboardType="numeric"
						/>

						<Text style={styles.text}>Days</Text>
					</View>
				</View>
				<TouchableHighlight
					onPress={() => {
						console.log("User attempted to sign out.");
						signOut(firebaseAuth).catch((e) => {
							console.log(
								"Something went wrong when signing out the user.\n" + e
							);
						});
					}}
					style={styles.buttons}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Text style={styles.buttonText}>Sign out</Text>
				</TouchableHighlight>
			</SafeAreaView>
		</ImageBackground>
	);
}
