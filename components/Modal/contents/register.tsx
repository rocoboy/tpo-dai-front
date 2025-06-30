import CustomButton from "@/components/Button";
import componentsStyles from "@/constants/styles";
import theme from "@/constants/types";
import { useAppContext } from "@/context/Context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function RegisterModal({ navigation }: { navigation: any }) {
    const { modal: { setOpenModal} } = useAppContext();

    const handleNavigate = () => {
        setOpenModal(false);
        navigation.navigate('validate');
    }

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
                        name="envelope"
                        size={25}
                        color={theme.colors.textDark}
                    />
                </View>
            </View>
            <View style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", width: "80%", gap: 7 }}>
                <Text style={[componentsStyles.subtitle, { width: "100%", color: theme.colors.dark }]}>Valida tu cuenta</Text>
                <Text style={[componentsStyles.text, { width: "100%" }]}>Se ha enviado un email con un código de validación, revisa tu casilla.</Text>
            </View>
        </View>
        <CustomButton text={"Aceptar"} variant={'primary'} onPress={handleNavigate} disabled={false}></CustomButton>
    </View>
}

