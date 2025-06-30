import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, Pressable, Image, Switch } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser, resetPassword } from '@/services/auth';
import { useAppContext } from '@/context/Context';
import styles from "./styles";
import componentsStyles from '@/constants/styles';
import InputText from '@/components/InputText';
import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default function RecoverPassword({ navigation }: { navigation: any }) {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const { userData: { email }, modal: { setDialogData, setOpenModal, setType }, login: { setIsLoggedIn } } = useAppContext();

    const { isPending, mutate } = useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            setType("dialog");
            setDialogData({ title: "Cambio exitoso!", subTitle: "", icon: "info" });
            setOpenModal(true);
            navigation.navigate("login");
        },
        onError: (error) => {
            setType("dialog");
            setDialogData({ icon: "exclamation-triangle", title: "Error", subTitle: error.message });
            setOpenModal(true);
            setIsLoggedIn(false);
        },
    });

    const handleValidate = () => {
        if (!passwordConfirm || !email || !password) {
            setType("dialog");
            setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Por favor, revise los campos" });
            setOpenModal(true);
            return;
        }
        if (password == passwordConfirm) {
            mutate({ email, code, newPassword: password });
        } else {
            setType("dialog");
            setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Las contraseñas no coinciden" });
            setOpenModal(true);
        }
    }

    return (
        <View style={styles.body}>
            <View style={{ width: "100%", alignItems: "flex-start", paddingLeft: 30 }}>
                <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                    backgroundColor: theme.colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingRight: 5,
                    paddingTop: 5,
                }}>
                    <FontAwesome
                        name="chevron-left"
                        size={25}
                        color={theme.colors.primary}
                        onPress={() => navigation.navigate("login")}
                    />
                </View>
            </View>
            <View style={styles.container}>

                <View style={{ width: "100%", height: "30%", alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
                    <Image resizeMode='contain' style={{ height: "100%" }} source={require('@/assets/images/bigLogo.png')} />
                </View>
                <Text style={componentsStyles.title}>Recuperar contraseña</Text>

                <View style={{ width: "100%", gap: 10, paddingTop: 20 }}>
                    <Text style={componentsStyles.text}>Código de seguridad</Text>
                    <InputText placeHolder="CODIGO1234" value={code} onChangeText={setCode} toUpperCase={true}></InputText>
                </View>

                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>Contraseña</Text>
                    <InputText placeHolder="password123" value={password} secureInput={true} onChangeText={setPassword}></InputText>
                </View>

                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>Confirmar Contraseña</Text>
                    <InputText placeHolder="password123" value={passwordConfirm} secureInput={true} onChangeText={setPasswordConfirm}></InputText>
                </View>

                <View style={{ width: "100%", paddingTop: 50 }}>
                    <CustomButton text={isPending ? 'Cambiando...' : 'Cambiar Contraseña'} variant={"primary"} onPress={handleValidate} disabled={isPending}></CustomButton>
                </View>

            </View>
        </View>
    );
}
