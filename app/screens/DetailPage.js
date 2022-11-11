import { View, StyleSheet, Text, ScrollView, Image } from "react-native";
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import {
	HeaderButton,
	HeaderButtons,
	Item,
} from "react-navigation-header-buttons";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { useTheme } from "@react-navigation/native";

import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore();
const firebaseAuth = getAuth(firebaseApp);

//Bookmark the receipt
async function bookmark(inputBool, UID, firebaseReceiptID) {
	//Getting the receipt data from firestore
	const userReceiptDocRef = doc(
		firestore,
		"users/" + UID + "/receipts/" + firebaseReceiptID
	);
	const bookmarkData = { "receipt.bookmarked": inputBool ? true : false };
	await updateDoc(userReceiptDocRef, bookmarkData);
}

//Saving picture
async function savePicture(uri) {
	// Requesting camera roll permissions
	const { status } = await MediaLibrary.requestPermissionsAsync();
	if (status === "granted") {
		try {
			// Save image to media library
			await MediaLibrary.saveToLibraryAsync(uri);

			console.log("Image successfully saved to camera roll.");
		} catch (error) {
			console.log(
				"Oops something went wrong when exporting the receipt.\n" + error
			);
		}
	} else {
		console.log(
			"Oops something went wrong when exporting the receipt.\n" +
				"Permission not granted"
		);
	}
}

export default function DetailPage({ route, navigation }) {
	//Theme
	const { colors } = useTheme();
	//States
	const { firebaseReceiptID, receiptName } = route.params;
	const [UID, setUID] = useState("");
	const [itemList, setItemList] = useState([]);
	const [receiptID, setReceiptID] = useState("");
	const [receiptTotal, setReceiptTotal] = useState(0.0);
	const [isTaxIncluded, setIsTaxIncluded] = useState(false);
	const [receiptTax, setReceiptTax] = useState(0.0);
	const [receiptRounding, setReceiptRounding] = useState(0.0);
	const [receiptGrandTotal, setReceiptGrandTotal] = useState(0.0);
	const [receiptDate, setReceiptDate] = useState("");
	const [receiptPaymentType, setReceiptPaymentType] = useState("");
	const [isReceiptBookmarked, setIsReceiptBookmarked] = useState(false);
	const [buttonsEnabled, setButtonsEnabled] = useState(false);

	//ScrollView Ref
	const scrollViewRef = useRef();

	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			setUID(user.uid);
		}
	});

	useEffect(() => {
		//Once UID is set (since there is a delay for state variables in React Native)
		if (UID != "") {
			//Fetch receipt from firebase
			fetchReceipt();

			//Enable the top header buttons
			setButtonsEnabled(true);
		}
	}, [UID]);

	//Fetch Receipt Data
	async function fetchReceipt() {
		//Getting the receipt data from firestore
		const userReceiptDocRef = doc(
			firestore,
			"users/" + UID + "/receipts/" + firebaseReceiptID
		);
		await getDoc(userReceiptDocRef)
			.then((receiptSnapshot) => {
				if (receiptSnapshot.exists()) {
					var receipt = receiptSnapshot.data();

					//Setting item list
					setItemList(receipt.receipt.items);

					//Setting the rest of the data
					if (receipt.receipt.tax == "Included in price") {
						setIsTaxIncluded(true);
						setReceiptTax("Included in price");
					} else {
						setIsTaxIncluded(false);
						setReceiptTax(receipt.receipt.tax);
					}
					setReceiptID(receipt.receipt.ID);
					setReceiptDate(receipt.receipt.date);
					setReceiptPaymentType(receipt.receipt.paymentType);
					setReceiptGrandTotal(receipt.receipt.grandTotal);
					setReceiptTotal(receipt.receipt.total);
					setReceiptRounding(receipt.receipt.rounding);
					setIsReceiptBookmarked(receipt.receipt.bookmarked);
				} else {
					console.log("Receipt not found!");
				}
			})
			.catch((error) => {
				console.log(
					"Oops an error occured while loading the receipt\n" + error
				);
				navigation.navigate("Home");
			});
	}

	const IoniconsHeaderButton = (props) => (
		<HeaderButton IconComponent={Ionicons} iconSize={28} {...props} />
	);

	//Set Header Buttons
	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<HeaderButtons HeaderButtonComponent={IoniconsHeaderButton}>
					<Item
						title="Bookmark"
						iconName={isReceiptBookmarked ? "bookmark" : "bookmark-outline"}
						color={buttonsEnabled ? colors.lightBlue : colors.disabled}
						onPress={() => {
							console.log("Bookmark pressed");
							bookmark(!isReceiptBookmarked, UID, firebaseReceiptID);
							setIsReceiptBookmarked(!isReceiptBookmarked);
						}}
					/>
					<Item
						title="Export"
						iconName={"share-outline"}
						color={buttonsEnabled ? colors.lightBlue : colors.disabled}
						onPress={() => {
							console.log("Export pressed");
							captureRef(scrollViewRef, {
								format: "jpg",
								quality: 1.0,
								result: "tmpfile",
							}).then(
								(uri) => {
									savePicture(uri);
								},
								(error) => console.error("Oops, snapshot failed \n", error)
							);
						}}
					/>
				</HeaderButtons>
			),
		});
	}, [navigation, isReceiptBookmarked, buttonsEnabled]);

	//Render item
	const renderItem = (item, index) => {
		return <Items item={item} textColor={colors.text} key={index} />;
	};

	//Receipt items
	const Items = ({ item }) => (
		<View style={styles.itemRow}>
			<View style={[styles.itemColumn1]}>
				<Text style={[styles.text]}>{item.name}</Text>
				{renderDesc(item.desc)}
			</View>
			<View style={[styles.itemColumn2]}>
				<Text style={[styles.text]}>{item.quantity}</Text>
			</View>
			<View style={[styles.itemColumn3]}>
				<Text style={[styles.subtext]}>RM</Text>
			</View>
			<View style={[styles.itemColumn4]}>
				<Text style={[styles.text, styles.price]}>{item.price}</Text>
			</View>
		</View>
	);

	//Render Description
	const renderDesc = (array, textColor) => {
		var returnComponent;
		if (array != null) {
			returnComponent = array.map((i, index) => (
				<Text style={[styles.subtext, styles.itemDesc]} key={index}>
					{i}
				</Text>
			));
		} else {
			return;
		}

		return returnComponent;
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

	const styles = StyleSheet.create({
		background: {
			flex: 1,
			width: "100%",
			alignItems: "center",
			backgroundColor: colors.background,
		},
		bold: {
			fontFamily: "PT Sans Bold",
		},
		content: {
			width: "100%",
			marginVertical: 30,
		},
		footer: {
			width: "100%",
		},
		header: {
			width: "100%",
		},
		itemColumn1: {
			width: "45%",
			alignItems: "baseline",
		},
		itemColumn2: {
			width: "15%",
			justifyContent: "flex-end",
			flexDirection: "row",
			alignItems: "baseline",
		},
		itemColumn3: {
			justifyContent: "flex-end",
			width: "10%",
			flexDirection: "row",
			alignItems: "baseline",
		},
		itemColumn4: {
			justifyContent: "flex-end",
			width: "30%",
			flexDirection: "row",
			alignItems: "baseline",
		},
		itemColumn5: {
			justifyContent: "flex-end",
			width: "40%",
			flexDirection: "row",
			alignItems: "baseline",
		},
		itemRow: {
			flexDirection: "row",
			alignItems: "baseline",
			marginBottom: 10,
		},
		itemDesc: {
			marginLeft: 10,
		},
		logo: {
			width: 150,
			height: 150,
			opacity: 0.2,
			zIndex: -1,
			top: 0,
			right: 0,
			position: "absolute",
		},
		price: {
			paddingLeft: 8,
		},
		right: {
			marginLeft: "auto",
		},
		scrollView: {
			width: "100%",
			alignSelf: "center",
			marginBottom: 10,
		},
		subtext: {
			fontFamily: "PT Sans Regular",
			opacity: 0.65,
			fontSize: 16,
			color: colors.text,
		},
		subheader: {
			flexDirection: "row",
			alignItems: "baseline",
		},
		text: {
			fontFamily: "PT Sans Regular",
			color: colors.text,
			fontSize: 24,
		},
		title: {
			fontSize: 40,
			color: colors.text,
		},
		viewShot: {
			padding: "5%",
			backgroundColor: colors.background,
		},
	});

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<View style={styles.scrollView}>
				<ScrollView>
					<View ref={scrollViewRef} collapsable={false} style={styles.viewShot}>
						<View style={styles.header}>
							<View style={styles.subheader}>
								<Text style={styles.text}>Tax Invoice</Text>
							</View>
							<View>
								<Text style={[styles.bold, styles.title]}>{receiptName}</Text>
							</View>
							<View style={styles.subheader}>
								<Text style={styles.text}>{receiptDate}</Text>
								<Text style={[styles.right, styles.text]}>
									{receiptPaymentType}
								</Text>
							</View>
							<Text style={[styles.subtext]}>ID: {receiptID}</Text>
							<Image
								style={styles.logo}
								source={require("../assets/landing.png")}
							/>
						</View>
						<View style={styles.content}>
							<View style={styles.subheader}>
								<Text style={[styles.text, styles.itemColumn1, styles.bold]}>
									Order
								</Text>
								<View style={[styles.itemColumn2]}>
									<Text style={[styles.text, styles.bold]}>Qty</Text>
								</View>
								<View style={[styles.itemColumn5]}>
									<Text style={[styles.text, styles.bold]}>Price</Text>
								</View>
							</View>
							{itemList.map((item, index) => renderItem(item, index))}
						</View>
						<View style={styles.footer}>
							<View style={styles.subheader}>
								<Text style={styles.text}>Total: </Text>
								<Text style={[styles.right, styles.subtext]}>RM</Text>
								<Text style={[styles.text, styles.price]}>
									{receiptTotal.toFixed(2)}
								</Text>
							</View>
							<View style={styles.subheader}>
								<Text style={styles.text}>Tax: </Text>
								{isTaxIncluded ? (
									<Text style={[styles.right, styles.subtext]}>
										{receiptTax}
									</Text>
								) : (
									<View style={[styles.subheader, styles.right]}>
										<Text style={[styles.right, styles.subtext]}>RM</Text>
										<Text style={[styles.text, styles.price]}>
											{receiptTax.toFixed(2)}
										</Text>
									</View>
								)}
							</View>
							<View style={styles.subheader}>
								<Text style={styles.text}>Rounding: </Text>
								<Text style={[styles.right, styles.subtext]}>RM</Text>
								<Text style={[styles.text, styles.price]}>
									{receiptRounding.toFixed(2)}
								</Text>
							</View>
							<View style={styles.subheader}>
								<Text style={styles.text}>Grand Total: </Text>
								<Text style={[styles.right, styles.subtext]}>RM</Text>
								<Text style={[styles.bold, styles.title, styles.price]}>
									{receiptGrandTotal.toFixed(2)}
								</Text>
							</View>
						</View>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
