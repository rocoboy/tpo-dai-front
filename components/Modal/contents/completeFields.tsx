import CustomButton from "@/components/Button";
import componentsStyles from "@/constants/styles";
import { useAppContext } from "@/context/Context";
import { Text, View } from "react-native";

export default function CompleteFields(){
    const { modal: { setOpenModal } } = useAppContext();
    
    return <View style={{gap: 20}}>
        <Text style={componentsStyles.text}>Por favor revise los campos</Text>
        <CustomButton text={"Entiendo"} variant={'primary'} onPress={() => setOpenModal(false)} disabled={false}></CustomButton>
    </View>
}