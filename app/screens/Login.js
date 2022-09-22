import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	TextInput,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import colors from "../assets/config/colors";

export default function Login() {
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
			<View style={styles.formView}>
				<View style={styles.formItem}>
					<Text style={[styles.text, styles.bold]}>Email:</Text>
					<TextInput style={[styles.text, styles.input]} placeholder="Email" />
				</View>

				<View style={styles.formItem}>
					<Text style={[styles.text, styles.bold]}>Password:</Text>
					<TextInput
						style={[styles.text, styles.input]}
						autoComplete="password"
						secureTextEntry={true}
						placeholder="Password"
					/>
				</View>
			</View>

			<TouchableHighlight
				onPress={() => {
					console.log("Submit pressed");
				}}
				style={styles.buttons}
				activeOpacity={0.6}
				underlayColor={colors.secondary}>
				<Text style={styles.buttonText}>Submit</Text>
			</TouchableHighlight>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	bold: {
		fontFamily: "PT Sans Bold",
		marginLeft: 12,
		marginTop: 6,
	},
	buttons: {
		top: 20,
		width: "80%",
		height: "8%",
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
	formItem: {
		height: 120,
	},
	formView: {
		width: "80%",
		justifyContent: "center",
	},
	input: {
		borderColor: colors.primary,
		borderWidth: 4,
		borderRadius: 20,
		backgroundColor: colors.secondary,
		height: 70,
		width: "100%",
		padding: 12,
		marginTop: 50,
	},
	text: {
		fontFamily: "PT Sans Regular",
		color: colors.black,
		overflow: "visible",
		fontSize: 32,
		alignItems: "center",
		position: "absolute",
	},
});
