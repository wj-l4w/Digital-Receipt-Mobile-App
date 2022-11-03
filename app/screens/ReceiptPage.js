import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableHighlight,
	FlatList,
	TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
	collection,
	endAt,
	getDocs,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	startAt,
	where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import colors from "../assets/config/colors";
import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore();
const firebaseAuth = getAuth(firebaseApp);

//Receipt items
const Receipt = ({ receipt, onPress, logoSrc, backgroundColor, textColor }) => (
	<TouchableOpacity
		activeOpacity={0.6}
		underlayColor={colors.primary}
		onPress={onPress}
		style={[styles.receiptItem, backgroundColor]}>
		<View style={styles.receiptTextView}>
			<Text style={[styles.text, textColor]}>{receipt.name}</Text>
			<View style={styles.receiptSubTextView}>
				<Text
					style={[styles.text, styles.receiptSubText, styles.smol, textColor]}>
					RM {receipt.grandTotal.toFixed(2)}
				</Text>
				<Text
					style={[styles.text, styles.receiptSubText, styles.smol, textColor]}>
					{receipt.date}
				</Text>
			</View>
		</View>
	</TouchableOpacity>
);

export default function ReceiptPage({ navigation }) {
	//TextView states
	const [focus, setFocus] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [UID, setUID] = useState("");
	//Receipts array
	const [receiptList, setReceiptList] = useState([]);

	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			setUID(user.uid);
		}
	});

	useEffect(() => {
		if (UID != "") {
			//Fetch receipt from firebase
			fetchReceipts();

			//onSnapshot listener with unsubscribe function
			var userReceiptCollection = collection(
				firestore,
				"users/" + UID + "/receipts"
			);
			var snapshotQuery = query(userReceiptCollection);
			const unsub = onSnapshot(snapshotQuery, (returnSnapshot) => {
				fetchReceipt(returnSnapshot);
			});
		}
	}, [UID]);

	//Fetch Receipt Data
	async function fetchReceipts(input) {
		var q;

		//If no query
		if (input == null || input == "") {
			const userReceiptCollection = collection(
				firestore,
				"users/" + UID + "/receipts"
			);
			q = query(userReceiptCollection);
		}
		//Got query input
		else {
			const userReceiptCollection = collection(
				firestore,
				"users/" + UID + "/receipts"
			);
			q = query(
				userReceiptCollection,
				where("receipt.bookmarked", "==", false),
				orderBy("receipt.lowercaseName"),
				startAt(input),
				endAt(input + "\uf8ff")
			);
		}

		//Getting the receipts from firestore
		fetchReceipt(await getDocs(q));
	}

	//Set Receipts
	function fetchReceipt(querySnapshot) {
		//Building receipt list
		var tempReceiptList = [];
		querySnapshot.forEach((doc) => {
			let receipt = {};
			receipt.ID = doc.data().receipt.ID;
			receipt.firebaseID = doc.id;
			receipt.name = doc.data().receipt.name;
			receipt.grandTotal = doc.data().receipt.grandTotal;
			receipt.date = doc.data().receipt.date;

			tempReceiptList.push(receipt);
		});

		setReceiptList(tempReceiptList);
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

	//Render receipt
	const renderReceipt = ({ item }) => {
		return (
			<Receipt
				receipt={item}
				onPress={() => {
					console.log("Receipt: ReceiptItem - Receipt " + item.ID + " pressed");
					navigation.navigate("DetailPage", {
						firebaseReceiptID: item.firebaseID,
						receiptName: item.name,
					});
				}}
				logoSrc={"text.png"}
				backgroundColor={colors.primary}
				textColor={colors.text}
			/>
		);
	};

	const onTextChanged = (text) => {
		//Remove non-numerical chars
		var edittext = text.toString();

		if (edittext != "") {
		}

		setSearchQuery(edittext);
	};

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<View style={styles.searchBar}>
				<TouchableHighlight
					onPress={() => {
						fetchReceipts(searchQuery);
					}}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Feather
						name="search"
						size={24}
						color={colors.text}
						style={styles.icons}
					/>
				</TouchableHighlight>
				<TextInput
					style={[
						styles.text,
						styles.smol,
						focus ? styles.inputFocus : styles.inputBlur,
					]}
					onFocus={() => setFocus(true)}
					onBlur={() => {
						setFocus(false);
						fetchReceipts(searchQuery);
					}}
					value={searchQuery}
					onChangeText={(text) => onTextChanged(text)}
					placeholder="Receipt Name"
				/>
				<TouchableHighlight
					onPress={() => {
						console.log("Receipt: SearchBar - Filter pressed");
					}}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<Feather
						name="filter"
						size={24}
						color={colors.text}
						style={styles.icons}
					/>
				</TouchableHighlight>
			</View>
			<FlatList
				data={receiptList}
				renderItem={renderReceipt}
				keyExtractor={(receipt) => receipt.ID}
				style={styles.receiptList}
				extraData={receiptList}
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
