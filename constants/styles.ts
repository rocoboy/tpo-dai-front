import { StyleSheet } from 'react-native';
import theme from './types';

const componentsStyles = StyleSheet.create({
    text: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.regular,
        color: theme.colors.dark,
    },
    textPrimary: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.primary,
    },
    textSecondary: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.secondary,
    },
    title: {
        fontSize: theme.fontSizes.xxl,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.dark,
    },
    titlePrimary: {
        fontSize: theme.fontSizes.xxl,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.primary,
    },
    subtitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.textDark,
    },
    body: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.regular,
        color: theme.colors.textDark,
    },
    small: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.light,
        color: theme.colors.muted,
    },
    input: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.buttonBorder,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: theme.colors.buttonFill,
    },
});

export default componentsStyles;