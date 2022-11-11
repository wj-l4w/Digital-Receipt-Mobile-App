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
import { Ionicons } from "@expo/vector-icons";
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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore();
const firebaseAuth = getAuth(firebaseApp);

export default function ReceiptPage({ navigation }) {
	//Theme
	const { colors } = useTheme();
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
			var snapshotQuery = query(userReceiptCollection);
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
			receipt.bookmarked = doc.data().receipt.bookmarked;

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
				backgroundColor={colors.disabled}
				textColor={colors.text}
			/>
		);
	};

	//Receipt items
	const Receipt = ({ receipt, onPress, backgroundColor, textColor }) => (
		<TouchableOpacity
			activeOpacity={0.6}
			underlayColor={backgroundColor}
			onPress={onPress}
			style={[styles.receiptItem]}>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				colors={[colors.primary, colors.secondary]}
				style={styles.receiptTextView}>
				<View style={styles.receiptInfo}>
					<Text style={[styles.text]}>{receipt.name}</Text>
					<View style={styles.receiptSubTextView}>
						<Text style={[styles.text, styles.receiptSubText, styles.smol]}>
							RM {receipt.grandTotal.toFixed(2)}
						</Text>
						<Text style={[styles.text, styles.receiptSubText, styles.smol]}>
							{receipt.date}
						</Text>
					</View>
				</View>
				<Ionicons
					name="bookmark-outline"
					size={40}
					color={colors.text}
					style={[
						styles.receiptIcons,
						receipt.bookmarked ? null : styles.invisible,
					]}
				/>
			</LinearGradient>
		</TouchableOpacity>
	);

	const onTextChanged = (text) => {
		//Remove non-numerical chars
		var edittext = text.toString();

		if (edittext != "") {
		}

		setSearchQuery(edittext);
	};

	const styles = StyleSheet.create({
		background: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: colors.darkerBackground,
		},
		bold: {
			fontFamily: "PT Sans Bold",
			marginLeft: 12,
			marginTop: 12,
		},
		emptyView: {
			flex: 1,
			backgroundColor: colors.darkerBackground,
			alignItems: "center",
			justifyContent: "center",
		},
		icons: {
			marginStart: 20,
			marginEnd: 20,
		},
		receiptIcons: {
			marginRight: "auto",
			flex: 4,
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
		invisible: {
			display: "none",
		},
		receiptInfo: {
			flex: 4,
			justifyContent: "center",
			marginRight: "auto",
			height: "100%",
		},
		receiptItem: {
			flex: 1,
			width: "150%",
			height: 100,
			left: "10%",
			marginTop: 20,
			justifyContent: "center",
		},
		receiptList: {
			width: "100%",
			backgroundColor: colors.darkerBackground,
		},
		receiptTextView: {
			flex: 1,
			flexDirection: "row",
			borderRadius: 45,
			paddingStart: 20,
			backgroundColor: colors.primary,
			justifyContent: "center",
			alignItems: "center",
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

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<View style={styles.searchBar}>
				<TouchableHighlight
					onPress={() => {
						fetchReceipts(sortType, searchQuery);
					}}
					activeOpacity={0.6}
					underlayColor={colors.disabled}>
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
					placeholderTextColor={colors.disabled}
				/>
				<TouchableHighlight
					onPress={() => {
						console.log("Receipt: SearchBar - Filter pressed");
						setShowDialog(true);
					}}
					activeOpacity={0.6}
					underlayColor={colors.disabled}>
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
					<Text style={styles.text}>No saved receipts yet...</Text>
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
