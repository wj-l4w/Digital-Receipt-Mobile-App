import {
	View,
	StyleSheet,
	Text,
	ScrollView,
	Image,
	FlatList,
} from "react-native";
import React, { useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

import colors from "../assets/config/colors";
import { SafeAreaView } from "react-native-safe-area-context";

//Dummy item data
const ITEMS = [
	{
		key: "1",
		name: "Big Mac",
		quantity: "2",
		price: "15.98",
		desc: [
			"Ala Carte",
			"Extra Cheese",
			"Coupon Code:",
			"WELCOME69",
			"-RM 2.00",
		],
	},
	{
		key: "2",
		name: "Coke",
		quantity: "4",
		price: "11.96",
		desc: ["Large"],
	},
	{
		key: "3",
		name: "Fries",
		quantity: "1",
		price: "4.99",
		desc: null,
	},
	{
		key: "4",
		name: "Happy Meal",
		quantity: "10",
		price: "200.00",
		desc: ["Free Toy", "Buzz Lightyear"],
	},
	{
		key: "5",
		name: "Sundae Cone",
		quantity: "3",
		price: "6.00",
		desc: null,
	},
	{
		key: "6",
		name: "Fillet O Fish",
		quantity: "1",
		price: "7.50",
		desc: ["No Pickles"],
	},
	{
		key: "7",
		name: "Oreo Sundae",
		quantity: "2",
		price: "7.00",
		desc: null,
	},
];

//Render item
const renderItem = (item) => {
	return <Item item={item} textColor={colors.text} key={item.key} />;
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
	const { receiptID, receiptName } = route.params;

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
			<ScrollView>
				<View style={styles.scrollView}>
					<View style={styles.header}>
						<View style={styles.subheader}>
							<Text style={styles.text}>Tax Invoice</Text>
							<Text style={[styles.right, styles.text]}>{receiptID}</Text>
						</View>
						<View>
							<Text style={[styles.bold, styles.title]}>{receiptName}</Text>
						</View>
						<View style={styles.subheader}>
							<Text style={styles.text}>7 Jul 2022</Text>
							<Text style={[styles.right, styles.text]}>Cash</Text>
						</View>
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
						{ITEMS.map((item) => renderItem(item))}
					</View>
					<View style={styles.footer}>
						<View style={styles.subheader}>
							<Text style={styles.text}>Total: </Text>
							<Text style={[styles.right, styles.subtext]}>RM</Text>
							<Text style={[styles.text, styles.price]}>32.93</Text>
						</View>
						<View style={styles.subheader}>
							<Text style={styles.text}>Tax: </Text>
							{/* <Text style={[styles.right, styles.subtext]}>
							INCLUDED IN PRICE
						</Text> */}
							<Text style={[styles.right, styles.subtext]}>RM</Text>
							<Text style={[styles.text, styles.price]}>6.90</Text>
						</View>
						<View style={styles.subheader}>
							<Text style={styles.text}>Rounding: </Text>
							<Text style={[styles.right, styles.subtext]}>RM</Text>
							<Text style={[styles.text, styles.price]}>0.07</Text>
						</View>
						<View style={styles.subheader}>
							<Text style={styles.text}>Grand Total: </Text>
							<Text style={[styles.right, styles.subtext]}>RM</Text>
							<Text style={[styles.bold, styles.title, styles.price]}>
								1234.56
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
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
