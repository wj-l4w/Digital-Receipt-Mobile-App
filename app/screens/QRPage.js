import { Text, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "../assets/config/colors";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function QRPage({ navigation }) {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);

	useEffect(() => {
		const getBarCodeScannerPermissions = async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === "granted");
		};

		getBarCodeScannerPermissions();
	}, []);

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);
		alert(`Bar code with type ${type} and data ${data} has been scanned!`);
	};

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

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<BarCodeScanner
				onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
				style={StyleSheet.absoluteFillObject}
			/>
		</SafeAreaView>
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
	icons: {
		marginStart: 20,
		marginEnd: 20,
	},
	inputBlur: {
		height: 40,
		flex: 1,
		paddingLeft: 12,
		borderColor: colors.primary,
		borderBottomWidth: 0,
	},
	inputFocus: {
		height: 40,
		flex: 1,
		paddingLeft: 12,
		borderColor: colors.primary,
		borderBottomWidth: 2,
	},
	receiptItem: {
		flex: 1,
		flexDirection: "row",
		width: "150%",
		height: 100,
		left: "40%",
		marginTop: 20,
		justifyContent: "center",
	},
	receiptList: {
		width: "100%",
		backgroundColor: colors.secondary,
	},
	receiptTextView: {
		flex: 1,
		borderRadius: 45,
		paddingStart: 20,
		backgroundColor: colors.primary,
		justifyContent: "center",
	},
	receiptSubText: {
		marginEnd: 20,
	},
	receiptSubTextView: {
		flexDirection: "row",
	},
	searchBar: {
		marginBottom: 20,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
	},
	smol: {
		fontSize: 20,
	},
	text: {
		fontFamily: "PT Sans Regular",
		color: colors.text,
		fontSize: 24,
	},
});
