import componentsStyles from "@/constants/styles";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardTypeOptions, TextInput, TouchableOpacity, View } from "react-native";

interface CustomInputProps {
  value: string;
  onChangeText: any;
  secureInput?: boolean;
  placeHolder?: string;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  icon?: keyof typeof FontAwesome.glyphMap; 
  type?: KeyboardTypeOptions;
}

export default function InputText({ value, onChangeText, secureInput = false, placeHolder = "", toLowerCase, toUpperCase, icon, type = "default" }: CustomInputProps) {

  const [show, setShow] = useState(false);
  return <View style={componentsStyles.input}>
    <TextInput
      keyboardType={type}
      placeholder={placeHolder}
      value={value}
      onChangeText={(text) => {
        if (toLowerCase) {
          onChangeText(text.toLowerCase());
        } else if (toUpperCase) {
          onChangeText(text.toUpperCase());
        } else {
          onChangeText(text);
        }
      }}
      secureTextEntry={secureInput && !show}
      style={{ flex: 1, height: 40 }}
    />
    {icon && (
      <FontAwesome
        name={icon}
        size={20}
        color="#999"
        style={{ marginRight: 10 }}
      />)}
    {secureInput && <TouchableOpacity onPress={() => setShow(prev => !prev)}>
      <FontAwesome
        name={show ? 'eye-slash' : 'eye'}
        size={24}
        color="#999"
        style={{ paddingRight: 10 }}
      />
    </TouchableOpacity>}
  </View>;
}