import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import InputText from '@/components/InputText';
import CustomButton from '@/components/Button';
import theme from '@/constants/types';
import { getAllIngredientes, getAllUnidades } from '@/services/receta';
import { Ingrediente, Unidad, IngredienteUtilizado } from '@/models/recipe';
import { useAppContext } from '@/context/Context';

interface AddIngredientProps {
  onSubmit: (ingredient: any) => void;
  onCancel: () => void;
  initial?: any;
  idsYaAgregados?: string[];
}

const AddIngredientContent: React.FC<AddIngredientProps> = ({ onSubmit, onCancel, initial, idsYaAgregados = [] }) => {
  const { userData, modal, setRecipeDraft, recipeDraft } = useAppContext();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [ingrediente, setIngrediente] = useState<string>(initial?.ingrediente?.idIngrediente || initial?.idIngrediente || '');
  const [cantidad, setCantidad] = useState<string>(initial?.cantidad?.toString() || '');
  const [unidad, setUnidad] = useState<string>(initial?.unidad?.idUnidad || initial?.idUnidad || '');
  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [ingredDropdownOpen, setIngredDropdownOpen] = useState(false);
  const [unidadDropdownOpen, setUnidadDropdownOpen] = useState(false);
  const [ingredSearch, setIngredSearch] = useState('');
  const [unidadSearch, setUnidadSearch] = useState('');

  const ingredInputRef = useRef<TextInput>(null);
  const unidadInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllIngredientes(userData.token, { userData, modal }),
      getAllUnidades(userData.token, { userData, modal }),
    ]).then(([ingreds, unids]) => {
      setIngredientes(ingreds);
      setUnidades(unids);
      setLoading(false);
    });
  }, []);

  // Filtrado: primero quitamos los ya agregados, luego aplicamos búsqueda
  const filteredIngredientes = ingredientes
    .filter(i => !idsYaAgregados.includes(i.idIngrediente))
    .filter(i => i.nombre.toLowerCase().includes(ingredSearch.toLowerCase()));
  const filteredUnidades = unidades.filter(u => u.descripcion.toLowerCase().includes(unidadSearch.toLowerCase()));

  const handleSubmit = () => {
    const ingredienteObj = ingredientes.find(i => i.idIngrediente === ingrediente);
    const unidadObj = unidades.find(u => u.idUnidad === unidad);
    if (ingredienteObj && unidadObj && cantidad && !isNaN(Number(cantidad))) {
      const nuevoIngrediente = {
        idIngrediente: ingredienteObj.idIngrediente,
        idUnidad: unidadObj.idUnidad,
        cantidad: cantidad.toString(),
        observaciones: '', // o podrías agregar un input para observaciones
        nombre: ingredienteObj.nombre,
        descripcionUnidad: unidadObj.descripcion
      };
      console.log("nuevo ing", nuevoIngrediente);
      setRecipeDraft(d => ({ ...d, utilizados: [...d.utilizados, nuevoIngrediente] }));
      onCancel();
    }
  };

  // Cerrar dropdowns al tocar fuera
  useEffect(() => {
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setIngredDropdownOpen(false);
      setUnidadDropdownOpen(false);
    });
    return () => hide.remove();
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>{initial ? 'Editar Ingrediente' : 'Agregar Ingrediente'}</ThemedText>
      {loading ? <Text>Cargando...</Text> : <>
        <ThemedText>Ingrediente</ThemedText>
        <TouchableOpacity style={styles.dropdownBox} onPress={() => setIngredDropdownOpen(v => !v)}>
          <Text style={{ color: ingrediente ? '#222' : '#888' }}>
            {ingredientes.find(i => i.idIngrediente === ingrediente)?.nombre || 'Seleccionar...'}
          </Text>
        </TouchableOpacity>
        {ingredDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <TextInput
              ref={ingredInputRef}
              style={styles.dropdownSearch}
              placeholder="Buscar ingrediente..."
              value={ingredSearch}
              onChangeText={setIngredSearch}
              autoFocus
            />
            <FlatList
              data={filteredIngredientes}
              keyExtractor={i => i.idIngrediente}
              style={{ maxHeight: 120 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setIngrediente(item.idIngrediente);
                    setIngredDropdownOpen(false);
                    setIngredSearch('');
                  }}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: '#888', padding: 8 }}>No hay resultados</Text>}
            />
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.column}>
            <ThemedText>Cantidad</ThemedText>
            <InputText
              value={cantidad}
              onChangeText={setCantidad}
              type="numeric"
            />
          </View>
          <View style={styles.column}>
            <ThemedText>Unidad</ThemedText>
            <TouchableOpacity style={styles.dropdownBox} onPress={() => setUnidadDropdownOpen(v => !v)}>
              <Text style={{ color: unidad ? '#222' : '#888' }}>
                {unidades.find(u => u.idUnidad === unidad)?.descripcion || 'Seleccionar...'}
              </Text>
            </TouchableOpacity>
            {unidadDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <TextInput
                  ref={unidadInputRef}
                  style={styles.dropdownSearch}
                  placeholder="Buscar unidad..."
                  value={unidadSearch}
                  onChangeText={setUnidadSearch}
                  autoFocus
                />
                <FlatList
                  data={filteredUnidades}
                  keyExtractor={u => u.idUnidad}
                  style={{ maxHeight: 120 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setUnidad(item.idUnidad);
                        setUnidadDropdownOpen(false);
                        setUnidadSearch('');
                      }}
                    >
                      <Text>{item.descripcion}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={{ color: '#888', padding: 8 }}>No hay resultados</Text>}
                />
              </View>
            )}
          </View>
        </View>
      </>}
      <View style={styles.buttons}>
        <CustomButton text="Cancelar" onPress={onCancel} variant="secondary" disabled={false} style={styles.button} />
        <CustomButton text="Aceptar" onPress={handleSubmit} variant="primary" disabled={false} style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.light,
    borderRadius: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: theme.colors.buttonBorder,
    borderRadius: 5,
    backgroundColor: theme.colors.buttonFill,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 2,
  },
  dropdownMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.buttonBorder,
    borderRadius: 5,
    zIndex: 10,
    marginTop: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownSearch: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 8,
    fontSize: 15,
    marginBottom: 4,
  },
  dropdownOption: {
    padding: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 10,
  }
});

export default AddIngredientContent; 