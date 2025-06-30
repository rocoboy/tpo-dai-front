import theme, { ColorType } from '@/constants/types';
import { Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

interface CustomButtonProps {
    text: string;
    icon?: FontAwesomeIconName;
    variant: ColorType;
    onPress: any;
    disabled: boolean;
    style?: any;
}

export default function CustomButton({text, icon, variant, onPress, disabled, style} : CustomButtonProps) {

    const styles = StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: variant == "primary" ? theme.colors.primary : theme.colors.secondary,
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 15,
            justifyContent: 'center',
        },
        icon: {
            marginRight: 10,
        },
        buttonText: {
            color: variant != "primary" ? theme.colors.primary : theme.colors.secondary,
            fontSize: theme.fontSizes.md,
            fontWeight: theme.fontWeights.medium,
        },
    });

    return <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={disabled}>
        {icon && <FontAwesome name={icon} size={28} color={variant == "primary" ? theme.colors.secondary : theme.colors.primary} style={styles.icon} />}
        <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
}

