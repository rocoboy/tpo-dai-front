import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFilteredRecipes, getFavorites } from '@/services/receta';
import { useAppContext } from '@/context/Context';
import { Receta } from '@/models/receta';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Header from '@/components/ui/Header';

const FILTERS = [
  { key: 'nombre', label: 'Receta' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'contieneIngrediente', label: 'Ingredientes' },
  { key: 'sinIngrediente', label: 'Sin Ingrediente' },
];

const DROPDOWN_OPTIONS = [
  { key: 'todas', label: 'Todas' },
  { key: 'mis', label: 'Mis Recetas' },
  { key: 'favoritas', label: 'Favoritas' },
  { key: 'guardadas', label: 'Guardadas' },
];

export default function RecetasScreen({navigation} : {navigation: any}) {
  const { userData, modal } = useAppContext();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState('todas');
  const [filters, setFilters] = React.useState<{ [k: string]: string }>({});
  const [activeFilter, setActiveFilter] = React.useState('nombre');
  const [recetas, setRecetas] = React.useState<Receta[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchRecetas();
  }, [dropdownValue, filters]);

  async function fetchRecetas() {
    setLoading(true);
    try {
      if (dropdownValue === 'favoritas') {
        if (!userData.token) throw new Error('Debes iniciar sesión para ver favoritas');
        const favs = await getFavorites(userData.token, { userData, modal });
        setRecetas(favs);
      } else if (dropdownValue === 'todas') {
        const res = await getFilteredRecipes(filters, { userData, modal });
        setRecetas(res);
      } else {
        // TODO: implementar mis recetas y guardadas
        setRecetas([]);
      }
    } catch (e: any) {
      setRecetas([]);
      if (e?.message) {
        modal.setType('dialog');
        modal.setDialogData({
          title: 'Error',
          subTitle: e.message,
          icon: 'exclamation-triangle',
          showButton: true,
          buttonText: 'OK',
          onButtonPress: () => modal.setOpenModal(false),
        });
        modal.setOpenModal(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function renderDropdown() {
    const selectedLabel = DROPDOWN_OPTIONS.find(opt => opt.key === dropdownValue)?.label || 'Recetas';
    return (
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setDropdownOpen((v) => !v)}>
          <Text style={styles.dropdownHeaderText}>{selectedLabel}</Text>
          <FontAwesome name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#222" />
        </TouchableOpacity>
        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {DROPDOWN_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.dropdownOption}
                onPress={() => {
                  setDropdownValue(opt.key);
                  setDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownOptionText, dropdownValue === opt.key && styles.dropdownOptionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  function renderFilterInput() {
    return (
      <TextInput
        style={styles.filterInput}
        placeholder={`Buscar por ${FILTERS.find((f) => f.key === activeFilter)?.label}`}
        value={filters[activeFilter] || ''}
        onChangeText={(v) => handleFilterChange(activeFilter, v)}
      />
    );
  }

  function renderFilters() {
    return (
      <View style={styles.filtersRowScroll}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  function renderReceta({ item }: { item: Receta }, navigation: any) {
    return (
      <TouchableOpacity style={styles.recetaCard} onPress={() => navigation.navigate('recipeDetail', { recetaId: item.id })}>
        <Image source={item.imagen ? { uri: item.imagen } : require('@/assets/images/bigLogo.png')} style={styles.recetaImg} />
        <View style={{ flex: 1 }}>
          <Text style={styles.recetaNombre}>{item.nombre}</Text>
          <Text style={styles.recetaAutor}>👤 {item.autor}</Text>
          <Text style={styles.recetaInfo}>{item.porciones} Porciones  <FontAwesome name="star" size={13} color="#FFD700" /> {item.promedioCalificacion?.toFixed(1) ?? '-'} </Text>
        </View>
        <FontAwesome name="chevron-right" size={18} color="#888" />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title=""
        onBack={() => navigation.goBack()}
        centerComponent={renderDropdown()}
        rightButton={
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('createRecipe')}>
            <FontAwesome name="cutlery" size={28} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.createButtonPlus}>+</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          {renderFilterInput()}
          {renderFilters()}
        </View>
        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator size="large" color="#00bfa5" />
          ) : (
            <FlatList
              data={recetas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderReceta({ item }, navigation)}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={<Text style={styles.placeholder}>No se encontraron recetas.</Text>}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  dropdownWrapper: { width: 160, alignItems: 'center', marginTop: 0 },
  dropdownHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 8, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    shadowOffset: { width: 0, height: 1 }, 
    justifyContent: 'space-between', 
    width: 160,
    minHeight: 36,
  },
  dropdownHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  dropdownMenu: { 
    position: 'absolute', 
    top: 44, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 }, 
    zIndex: 10 
  },
  dropdownOption: { padding: 10 },
  dropdownOptionText: { fontSize: 15, color: '#222' },
  dropdownOptionTextActive: { fontWeight: 'bold', color: '#00bfa5' },
  filtersContainer: { paddingHorizontal: 16, paddingTop: 8, zIndex: 1 },
  filterInput: { minWidth: 120, borderBottomWidth: 1, borderColor: '#ccc', fontSize: 15, paddingVertical: 2, marginBottom: 8 },
  filtersRowScroll: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterChip: { backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  filterChipActive: { backgroundColor: '#00bfa5' },
  filterChipText: { color: '#222', fontSize: 14 },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  body: { flex: 1, paddingHorizontal: 0, paddingTop: 8 },
  placeholder: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 40 },
  recetaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', padding: 10, gap: 10 },
  recetaImg: { width: 54, height: 54, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  recetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  recetaAutor: { fontSize: 13, color: '#888' },
  recetaInfo: { fontSize: 13, color: '#888', marginTop: 2 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5FC6C3',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 8,
  },
  createButtonPlus: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 2,
    marginTop: -2,
  },
}); 