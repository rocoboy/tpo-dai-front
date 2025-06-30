import CustomButton from "@/components/Button";
import componentsStyles from "@/constants/styles";
import theme from "@/constants/types";
import { useAppContext } from "@/context/Context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function SimpleDialog() {
    const { modal: { setOpenModal, dialog } } = useAppContext();

    const handleButtonPress = () => {
        if (dialog.onButtonPress) {
            dialog.onButtonPress();
        } else {
            setOpenModal(false);
        }
    };

    return <View style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 15 }}>
            <View style={{ width: "20%", height: "auto", alignItems: "center", justifyContent: "center" }}>
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                    backgroundColor: theme.colors.secondary,
                    borderColor: theme.colors.buttonBorder,
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <FontAwesome5
                        name={dialog.icon}
                        size={25}
                        color={theme.colors.textDark}
                    />
                </View>
            </View>
            <View style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", width: "80%", gap: 7 }}>
                <Text style={[componentsStyles.subtitle, { width: "100%", color: theme.colors.dark }]}>{dialog.title}</Text>
                <Text style={[componentsStyles.text, { width: "100%" }]}>{dialog.subTitle}</Text>
            </View>
        </View>
        {(dialog.showButton !== false || dialog.showCancelButton) && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                {dialog.showCancelButton && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#eee',
                            borderRadius: 8,
                            padding: 14,
                            alignItems: 'center',
                            minWidth: 120,
                        }}
                        onPress={dialog.onCancelPress || (() => setOpenModal(false))}
                    >
                        <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>{dialog.cancelButtonText || 'Cancelar'}</Text>
                    </TouchableOpacity>
                )}
                {dialog.showButton !== false && (
                    <CustomButton 
                        text={dialog.buttonText || "Aceptar"} 
                        variant={'primary'} 
                        onPress={handleButtonPress} 
                        disabled={false}
                        style={dialog.showCancelButton ? { minWidth: 120 } : { flex: 1 }}
                    />
                )}
            </View>
        )}
    </View>
}