import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	useColorScheme,
} from "react-native";
import React, { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { useTheme } from "@react-navigation/native";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default function LandingPage({ navigation }) {
	//Theme
	const { colors } = useTheme();
	const colorScheme = useColorScheme();

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

	const styles = StyleSheet.create({
		background: {
			flex: 1,
			justifyContent: "flex-end",
			alignItems: "center",
		},
		bold: {
			fontFamily: "PT Sans Bold",
		},
		buttonGroup: {
			justifyContent: "space-around",
			width: "80%",
			height: "20%",
		},
		buttons: {
			height: 55,
			backgroundColor: colors.lightBlue,
			borderRadius: 5,
			alignItems: "center",
			justifyContent: "center",
		},
		buttonText: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			fontSize: 24,
		},
		text: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			overflow: "visible",
			fontSize: 40,
			alignItems: "center",
			position: "absolute",
			bottom: "22%",
		},
		overlay: {
			...StyleSheet.absoluteFillObject,
			backgroundColor:
				colorScheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
		},
	});

	return (
		<ImageBackground
			style={{ flex: 1 }}
			source={require("../assets/landing.png")}
			onLayout={onLayoutRootView}>
			<SafeAreaView style={styles.background}>
				<View style={styles.overlay} />
				<Text style={styles.text}>
					<Text>Transforming{"\n"}</Text>
					<Text style={styles.bold}>Digital Receipts{"\n"}</Text>
					<Text>one at a time.</Text>
				</Text>
				<View style={styles.buttonGroup}>
					<TouchableHighlight
						onPress={() => {
							navigation.navigate("LoginPage");
						}}
						style={styles.buttons}
						activeOpacity={0.6}
						underlayColor={colors.secondary}>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableHighlight>
					<TouchableHighlight
						onPress={() => {
							navigation.navigate("RegisterPage");
						}}
						style={styles.buttons}
						activeOpacity={0.6}
						underlayColor={colors.secondary}>
						<Text style={styles.buttonText}>Sign Up</Text>
					</TouchableHighlight>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}
