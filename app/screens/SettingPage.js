import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	Switch,
	TextInput,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "../assets/config/colors";

export default function SettingPage({ navigation }) {
	//Auto expiry state
	const [autoExpiryEnabled, setAutoExpiry] = useState(false);
	const toggleAutoExpiry = () =>
		setAutoExpiry((previousState) => !previousState);
	//Auto expiry days state
	const [autoExpiryDays, setAutoExpiryDays] = useState("365");
	//Dark mode state
	const [darkModeEnabled, setDarkMode] = useState(false);
	const toggleDarkMode = () => setDarkMode((previousState) => !previousState);

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
	};

	return (
		<ImageBackground
			style={{ flex: 1 }}
			source={require("../assets/landing.png")}
			onLayout={onLayoutRootView}>
			<SafeAreaView style={styles.background}>
				<View style={styles.settingsRow}>
					<Text style={styles.text}>Auto Receipt Expiry</Text>
					<Switch
						trackColor={{ false: colors.disabled, true: colors.enabled }}
						thumbColor={colors.switch}
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
				<View style={styles.settingsRow}>
					<Text style={styles.text}>Dark Mode</Text>
					<Switch
						trackColor={{ false: colors.disabled, true: colors.enabled }}
						thumbColor={colors.switch}
						onValueChange={toggleDarkMode}
						value={darkModeEnabled}
						style={styles.switch}
					/>
				</View>
			</SafeAreaView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		//justifyContent: "center",
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
		color: colors.text,
		fontSize: 24,
	},
	disabled: {
		opacity: 0.35,
	},
	enabled: {
		color: colors.black,
	},
	input: {
		borderColor: colors.black,
		borderWidth: 1,
		borderRadius: 4,
		backgroundColor: colors.white,
		paddingHorizontal: 12,
		marginEnd: 5,
	},
	inputView: {
		marginLeft: "auto",
		flexDirection: "row",
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
		color: colors.black,
		overflow: "visible",
		fontSize: 24,
		alignItems: "center",
	},
});
