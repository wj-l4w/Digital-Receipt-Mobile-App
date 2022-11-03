import { View, StyleSheet, Text, ScrollView, Image } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import colors from "../assets/config/colors";
import firebaseConfig from "../assets/config/firebaseconfig";

// Initialize Firebase
const firebaseApp =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore();
const firebaseAuth = getAuth(firebaseApp);

//Render item
const renderItem = (item, index) => {
	return <Item item={item} textColor={colors.text} key={index} />;
};

//Receipt items
const Item = ({ item, textColor }) => (
	<View style={styles.itemRow}>
		<View style={[styles.itemColumn1]}>
			<Text style={[styles.text, textColor]}>{item.name}</Text>
			{renderDesc(item.desc, textColor)}
		</View>
		<View style={[styles.itemColumn2]}>
			<Text style={[styles.text, textColor]}>{item.quantity}</Text>
		</View>
		<View style={[styles.itemColumn3]}>
			<Text style={[styles.subtext, textColor]}>RM</Text>
		</View>
		<View style={[styles.itemColumn4]}>
			<Text style={[styles.text, styles.price, textColor]}>{item.price}</Text>
		</View>
	</View>
);

//Render Description
const renderDesc = (array, textColor) => {
	var returnComponent;
	if (array != null) {
		returnComponent = array.map((i, index) => (
			<Text
				style={[styles.subtext, styles.itemDesc, { textColor }]}
				key={index}>
				{i}
			</Text>
		));
	} else {
		return;
	}

	return returnComponent;
};

export default function DetailPage({ route, navigation }) {
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

	// Check if user login exists
	onAuthStateChanged(firebaseAuth, (user) => {
		if (user) {
			setUID(user.uid);
		}
	});

	useEffect(() => {
		if (UID != "") {
			//Fetch receipt from firebase
			fetchReceipt();
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
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<View style={styles.scrollView}>
				<ScrollView>
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
								<Text style={[styles.right, styles.subtext]}>{receiptTax}</Text>
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
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		alignItems: "center",
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
		width: "90%",
		alignSelf: "center",
		marginBottom: 10,
	},
	subtext: {
		fontFamily: "PT Sans Regular",
		opacity: 0.65,
		fontSize: 16,
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
	},
});
