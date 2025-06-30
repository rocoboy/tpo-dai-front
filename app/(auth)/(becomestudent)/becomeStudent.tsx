import CustomButton from '@/components/Button';
import CameraModal from '@/components/CameraModal/camera';
import InputText from '@/components/InputText';
import componentsStyles from '@/constants/styles';
import { useAppContext } from '@/context/Context';
import { upgradeAccount, upgradeUser } from '@/services/auth';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { handleUploadPhoto } from '../../../helpers/uploadPhotos';
import styles from "./styles";

export default function BecomeStudentScreen({ navigation }: { navigation: any }) {
    const [showCamera, setShowCamera] = useState(false);
    const [dni, setDni] = useState('');
    const [numeroTramite, setNumeroTramite] = useState('');
    const [medioPago, setMedioPago] = useState('');
    const [tarjetaCredito, setTarjetaCredito] = useState('');
    const [vto, setVto] = useState('');
    const [cvv, setCvv] = useState('');
    const [loadingIdImages, setLoadingIdImages] = useState(false);

    const { modal: { setOpenModal, setType, setDialogData }, userData: { id }, login: { isLoggedIn, setIsLoggedIn }, camera: { setCameraData, frontURI, backURI } } = useAppContext();

    // Determinar si hay sesión iniciada
    const hasSession = isLoggedIn && id > 0;

    const mutationFn = hasSession ? upgradeUser : upgradeAccount;
    const { isPending, mutate } = useMutation({
        mutationFn,
        onSuccess: (data) => {
            setType("dialog");
            if (hasSession) {
                setDialogData({ icon: "check-circle", title: "¡Éxito!", subTitle: "Ya sos alumno. Podés inscribirte a cursos ahora." });
            } else {
                setDialogData({ icon: "exclamation-triangle", title: "Actualización exitosa", subTitle: "Ya sos alumno, inicia sesión" });
            }
            setOpenModal(true);
            if (hasSession) {
                navigation.goBack();
            } else {
                navigation.navigate("login");
            }
        },
        onError: (error) => {
            setType("dialog");
            setDialogData({ icon: "exclamation-triangle", title: "Error", subTitle: error.message });
            setOpenModal(true);
            if (!hasSession) {
                setIsLoggedIn(false);
            }
        },
    });

    const handleUpgrade = async () => {
        setLoadingIdImages(true);
        const { pathBack, pathFront } = await handleUploadPhoto(frontURI, backURI, id);
        setLoadingIdImages(false)
        const data = {
            dni,
            frente: pathFront,
            dorso: pathBack,
            numeroTramite,
            medioPago,
            tarjetaCredito,
            vto,
            cvv
        }
        if (data.tarjetaCredito.length > 12 || data.dni === "" || data.frente === "" || data.dorso === "" || data.numeroTramite === "" || data.medioPago === "" || data.tarjetaCredito === "" || data.vto === "" || data.cvv === "") {
            setType("dialog");
            setDialogData({ icon: "info", title: "¡Alerta!", subTitle: "Por favor, revise los campos" });
            setOpenModal(true);
            return;
        }
        mutate({ id: id, userData: { dni: Number(dni), numeroTarjeta: tarjetaCredito, dniFrente: pathFront ?? "", dniFondo: pathBack ?? "", tramite: numeroTramite, tipoTarjeta: medioPago } }
        );
    };

    return (
        <View style={styles.body}>
            <View style={styles.container}>
                <Text style={componentsStyles.title}>
                    {hasSession ? 'Convertite en alumno' : 'Registrate'}
                </Text>
                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>DNI</Text>
                    <InputText
                        type='numeric'
                        placeHolder="CODIGO1234"
                        value={dni}
                        onChangeText={setDni}
                        toUpperCase={true}
                    />
                </View>

                <View style={{ width: "100%", gap: 10, flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ width: "45%", gap: 10 }}>
                        <Text style={componentsStyles.text}>Frente</Text>
                        <Pressable style={{ display: "flex", flexDirection: "row" }} onPress={() => { setShowCamera(!showCamera); setCameraData({ frontURI, backURI, actualIdSide: "front" }) }}>
                            <InputText
                                value={frontURI.length > 0 ? "listo" : "cargar imagen"}
                                onChangeText={() => { }}
                                toUpperCase={true}
                                icon='camera'
                            />
                        </Pressable>
                    </View>
                    <View style={{ width: "45%", gap: 10 }}>
                        <Text style={componentsStyles.text}>Dorso</Text>
                        <Pressable onPress={() => { setShowCamera(!showCamera); setCameraData({ frontURI, backURI, actualIdSide: "back" }) }}>
                            <InputText
                                value={backURI.length > 0 ? "listo" : "cargar imagen"}
                                onChangeText={() => { }}
                                toUpperCase={true}
                                icon='camera'
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>Numero de Trámite</Text>
                    <InputText
                        placeHolder="111111111111"
                        value={numeroTramite}
                        onChangeText={setNumeroTramite}
                        toUpperCase={true}
                        type='numeric'
                    />
                </View>

                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>Medio de Pago</Text>
                    <InputText
                        placeHolder="VISA / Mastercard"
                        value={medioPago}
                        onChangeText={setMedioPago}
                        toUpperCase={true}
                        type='default'
                    />
                </View>

                <View style={{ width: "100%", gap: 10 }}>
                    <Text style={componentsStyles.text}>Tarjeta de Crédito</Text>
                    <InputText
                        placeHolder="XXXX XXXX XXXX XXXX"
                        value={tarjetaCredito}
                        onChangeText={setTarjetaCredito}
                        toUpperCase={true}
                        type='numeric'
                    />
                </View>

                <View style={{ width: "100%", gap: 10, flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ width: "45%", gap: 10 }}>
                        <Text style={componentsStyles.text}>VTO</Text>
                        <InputText
                            placeHolder="03/25"
                            value={vto}
                            onChangeText={setVto}
                            toUpperCase={true}
                        />
                    </View>
                    <View style={{ width: "45%", gap: 10 }}>
                        <Text style={componentsStyles.text}>CVV</Text>
                        <InputText
                            placeHolder="***"
                            value={cvv}
                            onChangeText={setCvv}
                            toUpperCase={true}
                            type='numeric'
                        />
                    </View>
                </View>

                <View style={{ width: "100%", paddingTop: 30 }}>
                    <CustomButton
                        text={isPending || loadingIdImages ? 'Procesando...' : (hasSession ? 'Convertite en alumno' : 'Registrarse')}
                        variant={"primary"}
                        onPress={handleUpgrade}
                        disabled={isPending || loadingIdImages}
                    />
                </View>
            </View>
            <CameraModal isOpen={showCamera} toogleOpen={() => setShowCamera(!showCamera)}></CameraModal>
        </View>
    );
}
