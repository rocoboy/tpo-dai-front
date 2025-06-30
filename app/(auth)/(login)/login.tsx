import CustomButton from '@/components/Button';
import InputText from '@/components/InputText';
import componentsStyles from '@/constants/styles';
import theme from '@/constants/types';
import { useAppContext } from '@/context/Context';
import { loginUser, recoverAccount } from '@/services/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Switch, Text, View } from 'react-native';
import styles from "./styles";

import * as SecureStore from 'expo-secure-store';

async function save(value: any) {
  const jsonValue = JSON.stringify(value);
  await SecureStore.setItemAsync("userSession", jsonValue);
}

async function getValueFor(key:any) {
  let result = await SecureStore.getItemAsync(key);
  return result ? JSON.parse(result) : null;
}

export default function LoginScreen({navigation} : {navigation: any}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const queryClient = useQueryClient();
  const { login: { setIsLoggedIn }, modal: { setOpenModal, setType, setDialogData }, userData: {setUserData, alias}, loading: {setIsLoading}, register: {setRegisterStudent} } = useAppContext();

  useEffect(() => {
    async function getUserSession(){
      const sessionUser = await getValueFor("userSession");

      if (sessionUser){
        setUserData(sessionUser);
        setIsLoggedIn(true);
      }
    }
    getUserSession();
  },[]);

  const { isPending: isPendingLogin, mutate } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setIsLoading(false);
      queryClient.setQueryData(["userSession"], data);
      const userData = {email: data.user.mail, alias: data.user.nickname, token: data.access_token, id: data.user.id};
      setUserData(userData);
      if (remember){
        save(userData);
      } else {
        SecureStore.deleteItemAsync("userSession");
      }
      setIsLoggedIn(true);
    },
    onError: (error: any) => {
      console.log("ERRROR", error);
      if (error.validated == false){
        navigation.navigate('validate');
      }
      setType("dialog");
      setDialogData({icon: "exclamation-triangle", title: "Error", subTitle: error.message});
      setOpenModal(true);
      setIsLoggedIn(false);
    },
  });

  const { isPending: isPendingRecover, mutate: mutateRecover } = useMutation({
    mutationFn: recoverAccount,
    onSuccess: (data) => {
      setIsLoading(false);
      setType("dialog");
      setDialogData({icon: "info", title: "Cambiar contraseña", subTitle: "Te enviamos un email de recuperacion, revisa tu casilla"})
      setOpenModal(true);
      navigation.navigate('recover');
    },
    onError: (error) => {
      setType("dialog");
      setDialogData({icon: "exclamation-triangle", title: "Error", subTitle: error.message});
      setOpenModal(true);
      setIsLoggedIn(false);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      setType("dialog");
      setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Por favor, revise los campos" });
      setOpenModal(true);
    } else {
      console.log("logueando con:", { email, password });
      mutate({ email, password });
    }
  };


  const handleRecover = () => {
    if (email != "") {
      setUserData({alias, email, token: "", id: 1})
      mutateRecover({mail: email});
    } else {
      setType("dialog");
      setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Para poder recuperar tu contraseña, escribí tu email" });
      setOpenModal(true);
    }
  };

  useEffect(() => {
    if (isPendingLogin || isPendingRecover){
      setIsLoading(true);
    }
  },[isPendingLogin, isPendingRecover]);

  return (
    <View style={styles.body}>
      <View style={{ width: "100%", height: "20%", alignItems: "center", justifyContent: "center", paddingBottom: 40 }}>
        <Image resizeMode='contain' style={{ height: "100%" }} source={require('@/assets/images/bigLogo.png')} />
      </View>

      <View style={styles.container}>
        <View style={{ display: "flex", flexDirection: "row", paddingBottom: 20 }}>
          <Text style={componentsStyles.title}>Bienvenido a </Text>
          <Text style={componentsStyles.titlePrimary}>NutriApp</Text>
          <Text style={componentsStyles.title}>!</Text>
        </View>

        <View style={{ width: "100%", alignItems: "center", paddingBottom: 20 }}>
          <Text style={componentsStyles.subtitle}>Inicie su cuenta para continuar</Text>
        </View>

        <View style={{ width: "95%", gap: 10, paddingBottom: 30 }}>
          <View style={{ width: "100%", gap: 10 }}>
            <Text style={componentsStyles.text}>Nombre de usuario o email</Text>
            <InputText placeHolder="Correo electrónico" value={email} onChangeText={setEmail} toLowerCase={false}></InputText>
          </View>

          <View style={{ width: "100%", gap: 10 }}>
            <Text style={componentsStyles.text}>Contraseña</Text>
            <InputText placeHolder="Contraseña" value={password} onChangeText={setPassword} secureInput={true}></InputText>
          </View>

          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", height: "100%", gap: 10 }}>
              <Switch
                trackColor={{ true: "lightgray", false: '#59cacc' }}
                thumbColor={remember ? theme.colors.primary : '#f4f3f4'}
                ios_backgroundColor="#ccc"
                onValueChange={setRemember}
                value={remember}
              />
              <Text style={componentsStyles.textPrimary}>Recuerdame</Text>
            </View>
            <View>
              <Pressable onPress={handleRecover}><Text style={componentsStyles.textPrimary}>¿Olvidaste tu contraseña?</Text></Pressable>
            </View>
          </View>
        </View>

        {!isPendingLogin && <Pressable onPress={() => {setRegisterStudent(false); navigation.navigate("register" as never)}} style={{ display: "flex", flexDirection: "row", gap: 5, padding: 10 }}>
          <Text style={componentsStyles.textPrimary}>No tenes cuenta?</Text>
          <Text style={componentsStyles.text}>Registrate</Text>
        </Pressable>
        }
        
        <View style={{ width: "100%", paddingBottom: 20 }}>
          <CustomButton text={isPendingLogin ? 'Cargando...' : 'Iniciar Sesión'} variant="primary" onPress={handleLogin} disabled={isPendingLogin} ></CustomButton>
        </View>

        <Text style={componentsStyles.text}>Ingresar como visitante</Text>

        {isPendingLogin && <ActivityIndicator size="large" color="#4A90E2" />}
      </View>
    </View>
  );
}
