import React, { useEffect, useState } from 'react';
import { View, Text, Image, Switch } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/services/auth';
import { useAppContext } from '@/context/Context';
import styles from "./styles";
import componentsStyles from '@/constants/styles';
import InputText from '@/components/InputText';
import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { FontAwesome } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [nickname, setNickname] = useState('');
  const [mail, setMail] = useState('');
  const { modal: { setOpenModal, setType, setDialogData }, userData: { setUserData }, login: { setIsLoggedIn }, register: { student, setRegisterStudent } } = useAppContext();

  const { isPending, mutate } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setType("register");
      setUserData({ email: mail, alias: nickname, token: "", id: data.idUsuario });
      setOpenModal(true);
    },
    onError: (error) => {
      console.log("ERROR", error.message);
      setType("dialog");
      setDialogData({ icon: "exclamation-triangle", title: "Error", subTitle: error.message });
      setOpenModal(true);
      setIsLoggedIn(false);
    },
  });

  const handleRegister = () => {
    if (!nickname || !mail) {
      setType("dialog");
      setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Por favor, revise los campos" });
      setOpenModal(true);
      return;
    }
    mutate({ mail, nickname });
  };
  
  useEffect(() => {
    if (student) {
      setType("dialog");
      setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Vas a registrarte como estudiante, necesitaremos información de tu institución en la próxima pantalla" });
      setOpenModal(true);
    }
  }, [student])

  return (
    <View style={styles.body}>
      <View style={{ width: "100%", alignItems: "flex-start", paddingLeft: 30 }}>
        <View
          onTouchStart={() => navigation.navigate("login")}
          style={{
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
          />
        </View>
      </View>
      <View style={styles.container}>
        <View style={{ width: "100%", height: "30%", alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
          <Image resizeMode='contain' style={{ height: "100%" }} source={require('@/assets/images/bigLogo.png')} />
        </View>
        <Text style={componentsStyles.title}>Registrate</Text>
        <View style={{ width: "100%", gap: 10, paddingTop: 20 }}>
          <Text style={componentsStyles.text}>Correo electrónico</Text>
          <InputText placeHolder="example@gmail.com" value={mail} onChangeText={setMail} toLowerCase={true}></InputText>
        </View>
        <View style={{ width: "100%", gap: 10 }}>
          <Text style={componentsStyles.text}>Alias</Text>
          <InputText placeHolder="ejemploAlias" value={nickname} onChangeText={setNickname}></InputText>
        </View>
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
          <Switch
            trackColor={{ true: "lightgray", false: '#59cacc' }}
            thumbColor={student ? theme.colors.primary : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={setRegisterStudent}
            value={student}
          />
          <Text style={componentsStyles.textPrimary}>Estudiante</Text>
        </View>
        <View style={{ width: "100%", paddingTop: 10 }}>
          <CustomButton text={isPending ? 'Registrando...' : 'Registrarse'} variant={"primary"} onPress={handleRegister} disabled={isPending}></CustomButton>
        </View>
      </View>
    </View>
  );
}
