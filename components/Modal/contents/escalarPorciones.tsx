import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  porcionesActuales: number;
  onCancel: () => void;
  onSubmit?: (targetPortions: number) => void;
}

const EscalarPorcionesModal = ({ porcionesActuales, onCancel, onSubmit }: Props) => {
  const [targetPortions, setTargetPortions] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🍽️</Text>
      </View>
      <Text style={styles.title}>Escalar por Porciones</Text>
      <Text style={styles.subtitle}>Actualmente la receta rinde: {porcionesActuales} Porciones</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nuevas porciones deseadas:</Text>
        <TextInput
          style={styles.input}
          value={targetPortions}
          onChangeText={setTargetPortions}
          keyboardType="numeric"
          placeholder={`Ej: ${porcionesActuales * 2}`}
        />
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
          <Text style={styles.buttonTextCancel}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.accept]}
          onPress={() => {
            if (onSubmit && targetPortions && !isNaN(Number(targetPortions))) {
              onSubmit(Number(targetPortions));
            }
          }}
          disabled={!targetPortions || isNaN(Number(targetPortions)) || Number(targetPortions) <= 0}
        >
          <Text style={styles.buttonTextAccept}>Escalar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center', 
    width: 320 
  },
  iconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#f2f2f2', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  icon: { fontSize: 28 },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#888', 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: { 
    fontSize: 14, 
    color: '#444', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    backgroundColor: '#fff' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between' 
  },
  button: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginHorizontal: 4 
  },
  cancel: { backgroundColor: '#f2f2f2' },
  accept: { backgroundColor: '#4ecdc4' },
  buttonTextCancel: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  buttonTextAccept: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EscalarPorcionesModal; 