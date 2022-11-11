import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";

const getGlobalStyles = (props) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: props.colors.backgroundColor,
		},
	});

function useGlobalStyles() {
	const { colors } = useTheme();

	// We only want to recompute the stylesheet on changes in color.
	const styles = React.useMemo(() => getGlobalStyles({ colors }), [colors]);

	return styles;
}

export default useGlobalStyles;
