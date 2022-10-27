import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	TouchableHighlight,
	TextInput,
	Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import colors from "../assets/config/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(firebaseApp);

export default function RegisterPage() {
	//States
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [cPassword, setcPassword] = useState("");

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
			style={{ flex: 1 }}
			source={require("../assets/landing.png")}
			onLayout={onLayoutRootView}>
			<SafeAreaView style={styles.background}>
				<View style={styles.formView}>
					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Name:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							placeholder="Name"
							autoComplete="name"
							onChangeText={(text) => setName(text)}
						/>
					</View>

					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Email:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							placeholder="Email"
							autoComplete="email"
							onChangeText={(text) => setEmail(text)}
						/>
					</View>

					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Password:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							autoComplete="password"
							secureTextEntry={true}
							placeholder="Min. 8 Characters"
							onChangeText={(text) => setPassword(text)}
						/>
					</View>

					<View style={styles.formItem}>
						<Text style={[styles.text, styles.bold]}>Confirm Password:</Text>
						<TextInput
							style={[styles.text, styles.input]}
							autoComplete="password"
							secureTextEntry={true}
							placeholder="Confirm Password"
							onChangeText={(text) => setcPassword(text)}
						/>
					</View>
				</View>

				<TouchableHighlight
					onPress={() => {
						console.log("User attempted to create account.");
						console.log("Name: " + name);
						console.log("Email: " + email);
						console.log("Password: " + password);
						console.log("Confirm Password: " + cPassword);

						//Validating data
						const emailregex = new RegExp(
							/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
						);
						if (name == "") {
							Alert.alert("Please enter a name");
							return;
						} else if (!emailregex.test(email)) {
							Alert.alert("Inavlid email");
							return;
						} else if (password.length < 8) {
							Alert.alert("Password must be at least 8 characters long.");
							return;
						} else if (password != cPassword) {
							Alert.alert("Password and confirm password does not match.");
							return;
						}

						//Creating account
						console.log("Creating account with Firebase.");
						createUserWithEmailAndPassword(firebaseAuth, email, password)
							.then((userCredential) => {
								// Signed in
								const user = userCredential.user;
								user.updateProfile({ displayName: { name } });
								console.log("User created successfully!");
							})
							.catch((error) => {
								const errorCode = error.code;
								const errorMessage = error.message;
								console.log("User creation unsuccessful!");
								console.log("Error Code " + errorCode + ": " + errorMessage);
								if (errorCode == "auth/email-already-in-use") {
									Alert.alert("This email is already registered!");
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
		backgroundColor: colors.primary,
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
});
