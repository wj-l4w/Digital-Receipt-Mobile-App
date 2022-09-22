import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import colors from "../assets/config/colors";

export default function LandingPage({ navigation }) {
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

	return (
		<ImageBackground
			style={styles.background}
			source={require("../assets/landing.png")}
			onLayout={onLayoutRootView}>
			<Text style={styles.text}>
				<Text>Transforming{"\n"}</Text>
				<Text style={styles.bold}>Digital Receipts{"\n"}</Text>
				<Text>one at a time.</Text>
			</Text>
			<View style={styles.buttonGroup}>
				<TouchableHighlight
					onPress={() => {
						console.log("Login pressed");
						navigation.navigate("Login");
					}}
					style={styles.buttons}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableHighlight>
				<TouchableHighlight
					onPress={() => {
						console.log("Sign Up pressed");
					}}
					style={styles.buttons}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Text style={styles.buttonText}>Sign Up</Text>
				</TouchableHighlight>
				<TouchableHighlight
					onPress={() => {
						console.log("Continue Without Account pressed");
					}}
					style={styles.buttons}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Text style={styles.buttonText}>Continue Without Account</Text>
				</TouchableHighlight>
			</View>
		</ImageBackground>
	);
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
		justifyContent: "space-between",
		width: "80%",
		height: "24%",
	},
	buttons: {
		height: "28%",
		backgroundColor: colors.primary,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		fontFamily: "PT Sans Regular",
		color: colors.black,
		fontSize: 24,
	},
	text: {
		fontFamily: "PT Sans Regular",
		color: colors.white,
		overflow: "visible",
		fontSize: 40,
		alignItems: "center",
		position: "absolute",
		bottom: "26%",
	},
});
