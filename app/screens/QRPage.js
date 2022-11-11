import { Text, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarCodeScanner } from "expo-barcode-scanner";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getFirestore,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme } from "@react-navigation/native";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore();
const firebaseAuth = getAuth(firebaseApp);

export default function QRPage({ navigation }) {
	//Theme
	const { colors } = useTheme();
	//States
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);
	const [UID, setUID] = useState("");

	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			//User is signed in
			setUID(user.uid);
		}
	});

	useEffect(() => {
		const getBarCodeScannerPermissions = async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === "granted");
		};

		getBarCodeScannerPermissions();
	}, []);

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);
		getReceipt(data);
	};

	async function getReceipt(receiptID) {
		//Accessing receipt
		try {
			const temporaryReceiptDoc = doc(
				firestore,
				"temporaryReceipts/" + receiptID
			);
			const receiptSnapshot = await getDoc(temporaryReceiptDoc);

			var receipt;

			if (receiptSnapshot.exists()) {
				//TODO: figure out undefined with json parse, probs the null stuff
				receipt = receiptSnapshot.data();
				console.log(JSON.stringify(receipt));
			}

			//Move receipt from temporary receipt collections to user specific collection
			const userReceiptDoc = await addDoc(
				collection(firestore, "users/" + UID + "/receipts/"),
				{
					receipt,
				}
			);
			console.log(
				"Successfully added receipt in user/" +
					UID +
					"/receipts/" +
					userReceiptDoc.id
			);

			await deleteDoc(temporaryReceiptDoc);
			console.log("Successfully removed receipt from temporaryReceipts");
			setScanned(false);
			//Done
			navigation.navigate("Home", {
				screen: "DetailPage",
				params: {
					firebaseReceiptID: userReceiptDoc.id,
					receiptName: receipt["name"],
				},
			});
		} catch (e) {
			console.log("Oops an error occured when retrieving the receipt.\n" + e);
		}
	}

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

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const styles = StyleSheet.create({
		background: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
	});

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<BarCodeScanner
				onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
				style={StyleSheet.absoluteFillObject}
			/>
		</SafeAreaView>
	);
}
