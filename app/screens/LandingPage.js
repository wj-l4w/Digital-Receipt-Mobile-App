import { View, Text, StyleSheet, ImageBackground, Button } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

export default function LandingPage() {
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
				<Button
					title="Login"
					onPress={() => {
						console.log("Login pressed");
					}}
					style={styles.buttons}
				/>
				<Button
					title="Sign Up"
					onPress={() => {
						console.log("Sign Up pressed");
					}}
					style={styles.buttons}
				/>
				<Button
					title="Continue Without Account"
					onPress={() => {
						console.log("Continue Without Account");
					}}
					style={styles.buttons}
				/>
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
		justifyContent: "space-evenly",
		width: "80%",
		height: "20%",
	},
	buttons: {
		height: 50,
	},
	text: {
		fontFamily: "PT Sans Regular",
		color: "#fff",
		overflow: "visible",
		fontSize: 40,
		alignItems: "center",
		position: "absolute",
		bottom: "20%",
	},
});
