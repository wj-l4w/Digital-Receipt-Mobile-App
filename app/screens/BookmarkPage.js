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
import Dialog from "react-native-dialog";
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

export default function BookmarkPage({ navigation }) {
	//TextView states
	const [focus, setFocus] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [UID, setUID] = useState("");
	const [showDialog, setShowDialog] = useState(false);
	const [sortType, setSortType] = useState(1);
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
			fetchReceipts(1);

			//onSnapshot listener with unsubscribe function
			var userReceiptCollection = collection(
				firestore,
				"users/" + UID + "/receipts"
			);
			var snapshotQuery = query(
				userReceiptCollection,
				where("receipt.bookmarked", "==", true)
			);
			const unsub = onSnapshot(snapshotQuery, (returnSnapshot) => {
				setReceipts(returnSnapshot);
			});
		}
	}, [UID]);

	//Fetch Receipt Data
	async function fetchReceipts(sortType, input) {
		const userReceiptCollection = collection(
			firestore,
			"users/" + UID + "/receipts"
		);

		const queryConditions = [];

		switch (sortType) {
			case 1:
				queryConditions.push(orderBy("receipt.lowercaseName", "asc"));
				break;

			case 2:
				queryConditions.push(orderBy("receipt.lowercaseName", "desc"));
				break;

			case 3:
				queryConditions.push(orderBy("receipt.time", "asc"));
				break;

			case 4:
				queryConditions.push(orderBy("receipt.time", "desc"));
				break;
		}

		//Got query input
		if (!(input == null || input == "")) {
			input = input.toString().toLowerCase();
			if (sortType > 2) {
				queryConditions.push(orderBy("receipt.lowercaseName"));
			}
			queryConditions.push(startAt(input));
			queryConditions.push(endAt(input + "\uf8ff"));
		}

		//Bookmark conditions
		queryConditions.push(where("bookmarked", "==", true));

		//Getting the receipts from firestore
		const q = query(userReceiptCollection, ...queryConditions);
		setReceipts(await getDocs(q));
	}

	//Set Receipts
	function setReceipts(querySnapshot) {
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
						fetchReceipts(sortType, searchQuery);
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
						fetchReceipts(sortType, searchQuery);
					}}
					value={searchQuery}
					onChangeText={(text) => onTextChanged(text)}
					placeholder="Receipt Name"
				/>
				<TouchableHighlight
					onPress={() => {
						console.log("Receipt: SearchBar - Filter pressed");
						setShowDialog(true);
					}}
					activeOpacity={0.6}
					underlayColor={colors.secondary}>
					<View>
						<Feather
							name="filter"
							size={24}
							color={colors.text}
							style={styles.icons}
						/>
						<View>
							<Dialog.Container
								visible={showDialog}
								verticalButtons={true}
								onBackdropPress={() => {
									setShowDialog(false);
								}}
								onRequestClose={() => {
									setShowDialog(false);
								}}>
								<Dialog.Title>Sort by:</Dialog.Title>
								<Dialog.Button
									label="Name (Ascending)"
									onPress={() => {
										setShowDialog(false);
										setSortType(1);
										fetchReceipts(1);
									}}
								/>
								<Dialog.Button
									label="Name (Descending)"
									onPress={() => {
										setShowDialog(false);
										setSortType(2);
										fetchReceipts(2);
									}}
								/>
								<Dialog.Button
									label="Time (Old - New)"
									onPress={() => {
										setShowDialog(false);
										setSortType(3);
										fetchReceipts(3);
									}}
								/>
								<Dialog.Button
									label="Time (New - Old)"
									onPress={() => {
										setShowDialog(false);
										setSortType(4);
										fetchReceipts(4);
									}}
								/>
							</Dialog.Container>
						</View>
					</View>
				</TouchableHighlight>
			</View>
			{receiptList.length <= 0 ? (
				<View style={styles.emptyView}>
					<Text style={styles.text}>No bookmarked receipts...</Text>
				</View>
			) : (
				<FlatList
					data={receiptList}
					renderItem={renderReceipt}
					keyExtractor={(receipt) => receipt.ID}
					style={styles.receiptList}
					extraData={receiptList}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.bg,
	},
	bold: {
		fontFamily: "PT Sans Bold",
		marginLeft: 12,
		marginTop: 12,
	},
	emptyView: {
		flex: 1,
		backgroundColor: colors.bg,
		alignItems: "center",
		justifyContent: "center",
	},
	icons: {
		marginStart: 20,
		marginEnd: 20,
	},
	inputBlur: {
		height: 40,
		flex: 1,
		paddingLeft: 12,
		borderColor: colors.text,
		borderBottomWidth: 2,
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
		backgroundColor: colors.bg,
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
