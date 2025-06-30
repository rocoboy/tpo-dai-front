import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useMutation} from '@tanstack/react-query';
import { validateUser } from '@/services/auth';
import { useAppContext } from '@/context/Context';
import styles from "./styles";
import componentsStyles from '@/constants/styles';
import InputText from '@/components/InputText';
import CustomButton from '@/components/Button';

export default function ValidateScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { modal: { setOpenModal, setType, setDialogData }, login: { setIsLoggedIn }, register: { student, setRegisterStudent}, camera: {setCameraData} } = useAppContext();

  const { isPending, mutate } = useMutation({
    mutationFn: validateUser,
    onSuccess: () => {
      setType("dialog");
      let message;
      if (student){
        message = "Tu cuenta ya se encuentra activa, continúa con tu registro para ser estudiante";
      } else {
        message = "Tu cuenta ya se encuentra activa, inicia sesión para usar la App"
      }
      setDialogData({ icon: "exclamation-triangle", title: "Cuenta Validada", subTitle: message });
      setOpenModal(true);
      if (student){
        setCameraData({actualIdSide: "front", frontURI: "", backURI: "" })
        navigation.navigate("becomeStudent");
      } else {
        navigation.navigate("login");
      }
    },
    onError: (error) => {
      setType("dialog");
      setDialogData({ icon: "exclamation-triangle", title: "Error", subTitle: error.message });
      setOpenModal(true);
      setIsLoggedIn(false);
    },
  });

  const handleValidate = () => {
    if (!username || !code || !password) {
      setType("dialog");
      setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Por favor, revise los campos" });
      setOpenModal(true);
      return;
    }
    mutate({ username, code, password });
  };

  return (
    <View style={styles.body}>
      <View style={styles.container}>

        <View style={{ width: "100%", height: "30%", alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
          <Image resizeMode='contain' style={{ height: "100%" }} source={require('@/assets/images/bigLogo.png')} />
        </View>
        <Text style={componentsStyles.title}>Validar Cuenta</Text>

        <View style={{ width: "100%", gap: 10, paddingTop: 20 }}>
          <Text style={componentsStyles.text}>Alias</Text>
          <InputText placeHolder="ejemploAlias" value={username} onChangeText={setUsername}></InputText>
        </View>

        <View style={{ width: "100%", gap: 10 }}>
          <Text style={componentsStyles.text}>Código</Text>
          <InputText placeHolder="XXXXXX" value={code} onChangeText={setCode} type='numeric'></InputText>
        </View>

        <View style={{ width: "100%", gap: 10 }}>
          <Text style={componentsStyles.text}>Contraseña</Text>
          <InputText placeHolder="Contraseña" value={password} secureInput={true} onChangeText={setPassword}></InputText>
        </View>

        <View style={{ width: "100%", paddingTop: 10 }}>
          <CustomButton text={isPending ? 'Validando...' : 'Validar'} variant={"primary"} onPress={handleValidate} disabled={isPending}></CustomButton>
        </View>

      </View>
    </View>
  );
}
