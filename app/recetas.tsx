import Header from '@/components/ui/Header';
import { useAppContext } from '@/context/Context';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { IngredienteBase, Receta, TipoReceta } from '@/models/receta';
import { getAllIngredientes, getAllRecipeTypes, getFavorites, getFilteredRecipes } from '@/services/receta';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'contieneIngrediente', label: 'Con ingrediente' },
  { key: 'sinIngrediente', label: 'Sin ingrediente' },
  { key: 'usuario', label: 'Usuario' },
];

const ORDER_OPTIONS = [
  { key: 'nombre', label: 'Nombre (A-Z)' },
  { key: 'fecha', label: 'Más Recientes' },
  { key: 'fechaAsc', label: 'Más Antiguas' },
  { key: 'usuarioAsc', label: 'Usuario A-Z' },
  { key: 'usuarioDesc', label: 'Usuario Z-A' },
];

const DROPDOWN_OPTIONS = [
  { key: 'todas', label: 'Todas' },
  { key: 'mis', label: 'Mis Recetas' },
  { key: 'favoritas', label: 'Favoritas' },
  { key: 'guardadas', label: 'Guardadas' },
];

export default function RecetasScreen({navigation} : {navigation: any}) {
  const { userData, modal } = useAppContext();
  const { savedRecipes, removeRecipe, getOriginalRecipeId } = useSavedRecipes();
  
  // Estados para filtros
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState('todas');
  const [filters, setFilters] = React.useState<{ [k: string]: string }>({});
  const [activeFilter, setActiveFilter] = React.useState('nombre');
  const [orderBy, setOrderBy] = React.useState('nombre'); // Por defecto por nombre
  const [search, setSearch] = React.useState('');
  
  // Estados para datos de filtros
  const [ingredientes, setIngredientes] = React.useState<IngredienteBase[]>([]);
  const [tiposReceta, setTiposReceta] = React.useState<TipoReceta[]>([]);
  // Estado para búsqueda con debounce
  const searchTimeoutRef = React.useRef<any>(null);
  
  // Estado para dropdown de tipos
  const [tiposDropdownOpen, setTiposDropdownOpen] = React.useState(false);
  
  // Estados para recetas
  const [recetas, setRecetas] = React.useState<Receta[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Cargar datos para filtros
  React.useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      if (userData?.token) {
        const [ingreds, tipos] = await Promise.all([
          getAllIngredientes(userData.token, { userData, modal }),
          getAllRecipeTypes(userData.token, { userData, modal }),
        ]);
        setIngredientes(ingreds);
        setTiposReceta(tipos);
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  React.useEffect(() => {
    fetchRecetas();
  }, [dropdownValue, filters, orderBy, savedRecipes]);

  async function fetchRecetas() {
    setLoading(true);
    try {
      if (dropdownValue === 'favoritas') {
        if (!userData.token) throw new Error('Debes iniciar sesión para ver favoritas');
        const favs = await getFavorites(userData.token, { userData, modal });
        setRecetas(sortRecetas(favs));
      } else if (dropdownValue === 'guardadas') {
        // Convertir recetas guardadas al formato de Receta
        const recetasGuardadas = savedRecipes.map(saved => ({
          id: parseInt(saved.id),
          nombre: saved.nombre,
          autor: saved.autor,
          porciones: saved.isEscalado ? saved.porcionesEscaladas! : saved.porciones,
          promedioCalificacion: saved.promedioCalificacion,
          votos: 0, // Las recetas guardadas no tienen votos
          imagen: '', // Las recetas guardadas no tienen imagen por ahora
        })) as Receta[];
        setRecetas(sortRecetas(recetasGuardadas));
      } else if (dropdownValue === 'todas') {
        const res = await getFilteredRecipes(filters, { userData, modal });
        setRecetas(sortRecetas(res));
      } else {
        // TODO: implementar mis recetas
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

  const sortRecetas = (recetas: Receta[]) => {
    switch (orderBy) {
      case 'nombre':
        return [...recetas].sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'usuarioAsc':
        return [...recetas].sort((a, b) => a.autor.localeCompare(b.autor));
      case 'usuarioDesc':
        return [...recetas].sort((a, b) => b.autor.localeCompare(a.autor));
      case 'fecha':
        // Más recientes primero (IDs más altos)
        return [...recetas].sort((a, b) => b.id - a.id);
      case 'fechaAsc':
        // Más antiguas primero (IDs más bajos)
        return [...recetas].sort((a, b) => a.id - b.id);
      default:
        return recetas;
    }
  };

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({});
    setActiveFilter('nombre');
    setSearch('');
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
    // Para tipo de receta, mostrar dropdown
    if (activeFilter === 'tipo') {
      return (
        <View style={styles.filterDropdownWrapper}>
          <TouchableOpacity 
            style={styles.filterDropdownHeader} 
            onPress={() => setTiposDropdownOpen((v) => !v)}
          >
            <Text style={styles.filterDropdownText}>
              {filters.tipo ? tiposReceta.find(t => t.idTipo === filters.tipo)?.descripcion : 'Seleccionar tipo de receta'}
            </Text>
            <FontAwesome name={tiposDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color="#666" />
          </TouchableOpacity>
          {tiposDropdownOpen && (
            <View style={styles.filterDropdownMenu}>
              <TouchableOpacity
                style={styles.filterDropdownOption}
                onPress={() => {
                  handleFilterChange('tipo', '');
                  setTiposDropdownOpen(false);
                }}
              >
                <Text style={styles.filterDropdownOptionText}>Todos los tipos</Text>
              </TouchableOpacity>
              {tiposReceta.map((tipo) => (
                <TouchableOpacity
                  key={tipo.idTipo}
                  style={styles.filterDropdownOption}
                  onPress={() => {
                    handleFilterChange('tipo', tipo.idTipo);
                    setTiposDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.filterDropdownOptionText, filters.tipo === tipo.idTipo && styles.filterDropdownOptionTextActive]}>
                    {tipo.descripcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    // Para los demás filtros, mostrar campo de texto con debounce
    const getPlaceholder = () => {
      switch (activeFilter) {
        case 'nombre':
          return 'Buscar por nombre de receta...';
        case 'usuario':
          return 'Buscar por usuario...';
        case 'contieneIngrediente':
          return 'Buscar ingrediente que contenga...';
        case 'sinIngrediente':
          return 'Buscar ingrediente que NO contenga...';
        default:
          return 'Buscar...';
      }
    };

    const handleSearchChange = (text: string) => {
      setSearch(text);
      
      // Limpiar el timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Establecer un nuevo timeout de 1 segundo
      searchTimeoutRef.current = setTimeout(() => {
        handleFilterChange(activeFilter, text);
      }, 1000);
    };

    return (
      <TextInput
        style={styles.filterInput}
        placeholder={getPlaceholder()}
        value={search}
        onChangeText={handleSearchChange}
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
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]} numberOfLines={1} ellipsizeMode="tail">{f.label}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          style={{ flexGrow: 0 }}
        />
        {Object.keys(filters).length > 0 && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <FontAwesome name="times" size={14} color="#666" />
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderReceta({ item }: { item: Receta }, navigation: any) {
    const isSavedRecipe = dropdownValue === 'guardadas';
    
    return (
      <TouchableOpacity style={styles.recetaCard} onPress={() => {
        const recipeId = isSavedRecipe ? getOriginalRecipeId(item.id.toString()) : item.id;
        navigation.navigate('recipeDetail', { recetaId: recipeId });
      }}>
        <Image source={item.imagen ? { uri: item.imagen } : require('@/assets/images/bigLogo.png')} style={styles.recetaImg} />
        <View style={{ flex: 1 }}>
          <Text style={styles.recetaNombre}>{item.nombre}</Text>
          <Text style={styles.recetaAutor}>👤 {item.autor}</Text>
          <Text style={styles.recetaInfo}>
            {item.porciones} Porciones  
            <FontAwesome name="star" size={13} color="#FFD700" /> 
            {item.promedioCalificacion?.toFixed(1) ?? '-'}
          </Text>
        </View>
        <View style={styles.recetaActions}>
          {isSavedRecipe ? (
            <TouchableOpacity 
              style={styles.removeSavedButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveSavedRecipe(item.id.toString(), item.nombre);
              }}
            >
              <FontAwesome name="trash" size={20} color="#ff4757" />
            </TouchableOpacity>
          ) : (
            <FontAwesome name="chevron-right" size={18} color="#888" />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const handleCreateRecipe = () => {
    if (userData.alias === 'invitado') {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Acceso Restringido',
        subTitle: 'Necesitas iniciar sesión para crear recetas.',
        icon: 'exclamation-triangle',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    } else {
      navigation.navigate('createRecipe');
    }
  };

  const handleRemoveSavedRecipe = async (recipeId: string, recipeName: string) => {
    const success = await removeRecipe(recipeId);
    if (success) {
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Receta eliminada',
        subTitle: `"${recipeName}" fue eliminada de tus guardados.`,
        icon: 'info',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
      // Recargar las recetas para actualizar la lista
      fetchRecetas();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title=""
        onBack={() => navigation.goBack()}
        centerComponent={renderDropdown()}
        rightButton={
          <TouchableOpacity style={styles.createButton} onPress={handleCreateRecipe}>
            <FontAwesome name="cutlery" size={28} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.createButtonPlus}>+</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          {renderFilters()}
          {renderFilterInput()}
        </View>
        <View style={styles.body}>
          <View style={styles.ordenarRow}>
            <Text style={styles.ordenarText}>Ordenar</Text>
            <TouchableOpacity onPress={() => {
              const currentIndex = ORDER_OPTIONS.findIndex(opt => opt.key === orderBy);
              const nextIndex = (currentIndex + 1) % ORDER_OPTIONS.length;
              setOrderBy(ORDER_OPTIONS[nextIndex].key);
            }}>
              <FontAwesome name="sort" size={25} color="#222" />
            </TouchableOpacity>
            <Text style={styles.ordenarValue}>
              {ORDER_OPTIONS.find(opt => opt.key === orderBy)?.label}
            </Text>
          </View>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 30 }}>Cargando recetas...</Text>
          ) : (
            <FlatList
              data={recetas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderReceta({ item }, navigation)}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={
                dropdownValue === 'guardadas' ? (
                  <View style={styles.emptyContainer}>
                    <FontAwesome name="bookmark-o" size={48} color="#ccc" />
                    <Text style={styles.emptyTitle}>No tienes recetas guardadas</Text>
                    <Text style={styles.emptySubtitle}>
                      Las recetas que guardes aparecerán aquí para acceso rápido
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholder}>No se encontraron recetas.</Text>
                )
              }
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
  filterInput: { 
    minWidth: 120, 
    borderBottomWidth: 1, 
    borderColor: '#ccc', 
    fontSize: 15, 
    paddingVertical: 2, 
    marginBottom: 8,
  },
  filtersRowScroll: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    flexWrap: 'nowrap' 
  },
  filterChip: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 0,
    minWidth: 60,
    maxWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: '#00bfa5' },
  filterChipText: { color: '#222', fontSize: 15, flexShrink: 1 },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  ordenarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ordenarText: { marginRight: 6, color: '#888', fontSize: 14 },
  ordenarValue: { marginLeft: 6, color: '#222', fontSize: 14, fontWeight: '500' },
  placeholder: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 40 },
  recetaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', padding: 10, gap: 10 },
  recetaImg: { width: 54, height: 54, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  recetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  recetaAutor: { fontSize: 13, color: '#888' },
  recetaInfo: { fontSize: 13, color: '#888', marginTop: 2 },
  recetaActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  removeSavedButton: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
  },
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },

  filterRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
    gap: 8,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    marginLeft: 8,
    gap: 4,
  },
  clearFiltersText: { 
    color: '#666', 
    fontSize: 14,
    fontWeight: '500',
  },
  filterDropdownWrapper: {
    flex: 1,
    marginRight: 8,
    zIndex: 10,
    marginBottom: 45,
  },
  filterDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: 'space-between',
    minHeight: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 2,
  },
  filterDropdownText: { 
    fontSize: 15, 
    color: '#222',
    flex: 1,
  },
  filterDropdownMenu: {
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
    zIndex: 15,
  },
  filterDropdownOption: { 
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterDropdownOptionText: { fontSize: 14, color: '#222' },
  filterDropdownOptionTextActive: { fontWeight: 'bold', color: '#00bfa5' },
}); 