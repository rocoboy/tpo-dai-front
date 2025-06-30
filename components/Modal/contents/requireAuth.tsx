import CustomButton from "@/components/Button";
import componentsStyles from "@/constants/styles";
import theme from "@/constants/types";
import { useAppContext } from "@/context/Context";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export default function RequireAuthModal({ navigation }: { navigation: any }) {
    const { modal: { setOpenModal } } = useAppContext();

    const handleGoToLogin = () => {
        setOpenModal(false);
        navigation.navigate('login');
    };

    const handleGoToRegister = () => {
        setOpenModal(false);
        navigation.navigate('register');
    };

    return (
        <View style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
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
                            name="user-lock"
                            size={25}
                            color={theme.colors.textDark}
                        />
                    </View>
                </View>
                <View style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", width: "80%", gap: 7 }}>
                    <Text style={[componentsStyles.subtitle, { width: "100%", color: theme.colors.dark }]}>Acceso Requerido</Text>
                    <Text style={[componentsStyles.text, { width: "100%" }]}>Necesitas iniciar sesión o registrarte para acceder a esta funcionalidad.</Text>
                </View>
            </View>
            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                <CustomButton text={"Iniciar Sesión"} variant={'primary'} onPress={handleGoToLogin} disabled={false} style={{ flex: 1 }} />
                <CustomButton text={"Registrarse"} variant={'secondary'} onPress={handleGoToRegister} disabled={false} style={{ flex: 1 }} />
            </View>
        </View>
    );
} 