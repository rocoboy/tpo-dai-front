import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Ingrediente {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
}

interface Props {
  porciones: number;
  ingredientes: Ingrediente[];
  ingredienteOrigen?: Ingrediente;
  onCancel: () => void;
  onSubmit?: (data: { ingredienteId: string; recetaCantidad: number; nuevaCantidad: number }) => void;
}

const RecalcularIngredientesModal = ({ porciones, ingredientes, ingredienteOrigen, onCancel, onSubmit }: Props) => {
  const [selectedId, setSelectedId] = useState(ingredienteOrigen?.id || ingredientes[0]?.id || '');
  const [recetaCantidad, setRecetaCantidad] = useState(ingredienteOrigen?.cantidad?.toString() || ingredientes[0]?.cantidad?.toString() || '');
  const [nuevaCantidad, setNuevaCantidad] = useState('');

  React.useEffect(() => {
    if (ingredienteOrigen) {
      setSelectedId(ingredienteOrigen.id);
      setRecetaCantidad(ingredienteOrigen.cantidad.toString());
    } else {
      const ing = ingredientes.find(i => i.id === selectedId);
      setRecetaCantidad(ing ? ing.cantidad.toString() : '');
    }
  }, [selectedId, ingredienteOrigen]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🍞</Text>
      </View>
      <Text style={styles.title}>Recalcular Ingredientes</Text>
      <Text style={styles.subtitle}>Actualmente la receta con estos ingredientes rinde: {porciones} Porciones</Text>
      <Text style={styles.label}>Ingrediente Origen</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1, backgroundColor: '#eee' }]}
          value={ingredienteOrigen ? ingredienteOrigen.nombre : (ingredientes.find(i => i.id === selectedId)?.nombre || '')}
          editable={false}
        />
      </View>
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Cantidad Receta</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee' }]}
            value={recetaCantidad}
            editable={false}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Cantidad a recalcular</Text>
          <TextInput
            style={styles.input}
            value={nuevaCantidad}
            onChangeText={setNuevaCantidad}
            keyboardType="numeric"
            placeholder="Ej: 4"
          />
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
          <Text style={styles.buttonTextCancel}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.accept]}
          onPress={() => {
            if (onSubmit) {
              onSubmit({ ingredienteId: selectedId, recetaCantidad: Number(recetaCantidad), nuevaCantidad: Number(nuevaCantidad) });
            }
            onCancel();
          }}
          disabled={!nuevaCantidad || isNaN(Number(nuevaCantidad))}
        >
          <Text style={styles.buttonTextAccept}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: 320 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, color: '#444', marginBottom: 4, marginTop: 8 },
  inputRow: { flexDirection: 'row', width: '100%', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 15, backgroundColor: '#fff' },
  buttonRow: { flexDirection: 'row', width: '100%', marginTop: 16, justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancel: { backgroundColor: '#f2f2f2' },
  accept: { backgroundColor: '#4ecdc4' },
  buttonTextCancel: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  buttonTextAccept: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default RecalcularIngredientesModal; 