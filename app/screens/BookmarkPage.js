import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableHighlight,
	FlatList,
	TouchableOpacity,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Feather } from "@expo/vector-icons";

import colors from "../assets/config/colors";
import { SafeAreaView } from "react-native-safe-area-context";

//Dummy receipt data
const DATA = [
	{
		ID: "abdefg-1010101",
		name: "Lorem Ipsum",
		grandTotal: "1234.56",
		date: "29 Sep 2022",
	},
	{
		ID: "abdefg-1010102",
		name: "McDonald's",
		grandTotal: "420.69",
		date: "1 Apr 2022",
	},
	{
		ID: "abdefg-1010103",
		name: "Apple Inc.",
		grandTotal: "4999.99",
		date: "27 Sep 2022",
	},
	{
		ID: "abdefg-1010104",
		name: "Lorem Ipsum",
		grandTotal: "1234.56",
		date: "29 Sep 2022",
	},
	{
		ID: "abdefg-1010105",
		name: "McDonald's",
		grandTotal: "420.69",
		date: "1 Apr 2022",
	},
	{
		ID: "abdefg-1010106",
		name: "Apple Inc.",
		grandTotal: "4999.99",
		date: "27 Sep 2022",
	},
	{
		ID: "abdefg-1010107",
		name: "Lorem Ipsum",
		grandTotal: "1234.56",
		date: "29 Sep 2022",
	},
	{
		ID: "abdefg-1010108",
		name: "McDonald's",
		grandTotal: "420.69",
		date: "1 Apr 2022",
	},
	{
		ID: "abdefg-1010109",
		name: "Apple Inc.",
		grandTotal: "4999.99",
		date: "27 Sep 2022",
	},
];

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
					RM {receipt.grandTotal}
				</Text>
				<Text
					style={[styles.text, styles.receiptSubText, styles.smol, textColor]}>
					{receipt.date}
				</Text>
			</View>
		</View>
	</TouchableOpacity>
);

export default function BookmarkPage() {
	//TextView states
	const [focus, setFocus] = useState(false);

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
				onPress={() =>
					console.log("Receipt: ReceiptItem - Receipt " + item.ID + " pressed")
				}
				logoSrc={"text.png"}
				backgroundColor={colors.primary}
				textColor={colors.text}
			/>
		);
	};

	return (
		<SafeAreaView style={styles.background} onLayout={onLayoutRootView}>
			<View style={styles.searchBar}>
				<TouchableHighlight
					onPress={() => {
						console.log("Receipt: SearchBar - Search pressed");
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
					onBlur={() => setFocus(false)}
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
				data={DATA}
				renderItem={renderReceipt}
				keyExtractor={(receipt) => receipt.ID}
				style={styles.receiptList}
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
