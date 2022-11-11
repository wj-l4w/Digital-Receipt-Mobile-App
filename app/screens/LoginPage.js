import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	TextInput,
	Alert,
	useColorScheme,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "@react-navigation/native";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);

export default function LoginPage() {
	//Theme
	const { colors } = useTheme();
	const colorScheme = useColorScheme();
	//States
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

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
			justifyContent: "center",
			alignItems: "center",
		},
		bold: {
			fontFamily: "PT Sans Bold",
			marginLeft: 12,
			marginTop: 12,
		},
		buttons: {
			top: 20,
			width: "80%",
			height: "8%",
			backgroundColor: colors.lightBlue,
			borderRadius: 5,
			alignItems: "center",
			justifyContent: "center",
		},
		buttonText: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			fontSize: 32,
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
			color: colors.text,
			overflow: "visible",
			fontSize: 28,
			alignItems: "center",
			position: "absolute",
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
				<View style={styles.formView}>
					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Email:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							placeholder="Email"
							placeholderTextColor={colors.disabled}
							onChangeText={(text) => setEmail(text)}
							autoCorrect={false}
						/>
					</View>

					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Password:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							autoComplete="password"
							secureTextEntry={true}
							placeholder="Password"
							placeholderTextColor={colors.disabled}
							onChangeText={(text) => setPassword(text)}
						/>
					</View>
				</View>

				<TouchableHighlight
					onPress={() => {
						console.log("User attempted to login.");
						signInWithEmailAndPassword(firebaseAuth, email, password)
							.then((userCredential) => {
								// Signed in
								const user = userCredential.user;
								user.reload();
								console.log(
									"User " + user.displayName + " logged in successfully!"
								);
							})
							.catch((error) => {
								const errorCode = error.code;
								const errorMessage = error.message;
								console.log("User login unsuccessful!");
								console.log("Error Code " + errorCode + ": " + errorMessage);
								if (errorCode == "auth/wrong-password") {
									Alert.alert("Wrong password!");
									return;
								} else if (errorCode == "auth/user-not-found") {
									Alert.alert("User not found!");
									return;
								} else {
									Alert.alert(
										"Oops something went wrong!",
										"Error Code " + errorCode + ": " + errorMessage
									);
									return;
								}
							});
					}}
					style={styles.buttons}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Text style={styles.buttonText}>Submit</Text>
				</TouchableHighlight>
			</SafeAreaView>
		</ImageBackground>
	);
}
