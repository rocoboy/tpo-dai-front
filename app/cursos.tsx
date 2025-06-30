import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/ui/Header';
import BottomBar from '@/components/BottomBar';
import { getCursos, getMisCursos, darDeBajaCurso } from '@/services/curso';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Curso, InscripcionAlumno } from '@/models/curso';
import { useAppContext } from '@/context/Context';

const FILTERS = [
  { key: 'sede', label: 'Sede' },
  { key: 'curso', label: 'Curso' },
  { key: 'modalidad', label: 'Modalidad' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'horario', label: 'Horarios' },
];

const DROPDOWN_OPTIONS = [
  { key: 'todos', label: 'Cursos' },
  { key: 'mis', label: 'Mis Cursos' },
];

export default function CursosScreen() {
  const navigation = useNavigation();
  const { userData, modal } = useAppContext();
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState('todos');
  const [cursos, setCursos] = React.useState<Curso[]>([]);
  const [misCursos, setMisCursos] = React.useState<InscripcionAlumno[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [orderAsc, setOrderAsc] = React.useState(true);

  // Mutation para dar de baja
  const bajaMutation = useMutation({
    mutationFn: ({ idInscripcion, token }: { idInscripcion: string; token: string }) =>
      darDeBajaCurso(idInscripcion, token),
    onSuccess: (data, variables) => {
      // Mostrar modal de éxito usando el sistema global
      modal.setType('dialog');
      modal.setDialogData({
        title: '¡Te Diste de Baja!',
        subTitle: `Te diste de baja. Podes volverte a inscribir cuando quieras`,
        icon: 'check-circle',
        showButton: true,
        buttonText: 'Aceptar',
        onButtonPress: () => {
          modal.setOpenModal(false);
          // Refrescar la lista de cursos
          if (dropdownValue === 'mis') {
            fetchCursos();
          }
        },
      });
      modal.setOpenModal(true);
    },
    onError: (error: any) => {
      // Mostrar modal de error usando el sistema global
      modal.setType('dialog');
      modal.setDialogData({
        title: 'Error',
        subTitle: error.message || 'No se pudo procesar la baja. Inténtalo de nuevo.',
        icon: 'exclamation-triangle',
        showButton: true,
        buttonText: 'OK',
        onButtonPress: () => modal.setOpenModal(false),
      });
      modal.setOpenModal(true);
    }
  });

  React.useEffect(() => {
    fetchCursos();
  }, [dropdownValue]);

  async function fetchCursos() {
    setLoading(true);
    try {
      if (dropdownValue === 'mis') {
        if (!userData?.token) {
          modal.setType('dialog');
          modal.setDialogData({
            title: 'Error',
            subTitle: 'Debes iniciar sesión para ver tus cursos',
            icon: 'exclamation-triangle',
            showButton: true,
            buttonText: 'OK',
            onButtonPress: () => modal.setOpenModal(false),
          });
          modal.setOpenModal(true);
          setMisCursos([]);
          return;
        }
        const data = await getMisCursos(userData.token);
        setMisCursos(data);
      } else {
        const data = await getCursos();
        setCursos(data);
      }
    } catch (e: any) {
      if (dropdownValue === 'mis') {
        setMisCursos([]);
      } else {
        setCursos([]);
      }
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

  function renderDropdown() {
    const selectedLabel = DROPDOWN_OPTIONS.find(opt => opt.key === dropdownValue)?.label || 'Cursos';
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

  // Filtrado solo en frontend
  let filteredCursos = cursos;
  let filteredMisCursos = misCursos;
  
  // Si hay filtro seleccionado, aplicar lógica según el filtro
  if (selectedFilter && search) {
    const searchLower = search.toLowerCase();
    
    if (selectedFilter === 'modalidad') {
      // Filtrar por modalidad basado en la búsqueda (case-insensitive)
      filteredCursos = filteredCursos.filter(c => 
        c.modalidad.toLowerCase().includes(searchLower)
      );
      filteredMisCursos = filteredMisCursos.filter(c => 
        c.curso.modalidad.toLowerCase().includes(searchLower)
      );
    } else if (selectedFilter === 'sede') {
      // Filtrar por sede basado en la búsqueda (case-insensitive)
      filteredCursos = filteredCursos.filter(c => 
        c.cronogramas.some(cron => cron.sede.toLowerCase().includes(searchLower))
      );
      filteredMisCursos = filteredMisCursos.filter(c => 
        c.cronograma.sede.toLowerCase().includes(searchLower)
      );
    } else if (selectedFilter === 'curso') {
      // Filtrar por nombre del curso
      filteredCursos = filteredCursos.filter(c => 
        c.nombre.toLowerCase().includes(searchLower)
      );
      filteredMisCursos = filteredMisCursos.filter(c => 
        c.curso.nombre.toLowerCase().includes(searchLower)
      );
    } else if (selectedFilter === 'fecha') {
      // Filtrar por fecha basado en la búsqueda (case-insensitive)
      filteredCursos = filteredCursos.filter(c => 
        c.cronogramas.some(cron => 
          cron.fechaInicio.toLowerCase().includes(searchLower) || 
          cron.fechaFin.toLowerCase().includes(searchLower)
        )
      );
      filteredMisCursos = filteredMisCursos.filter(c => 
        c.cronograma.fechaInicio.toLowerCase().includes(searchLower) || 
        c.cronograma.fechaFin.toLowerCase().includes(searchLower)
      );
    } else if (selectedFilter === 'horario') {
      // Filtrar por horario basado en la búsqueda (case-insensitive)
      filteredCursos = filteredCursos.filter(c => 
        c.cronogramas.some(cron => cron.horario.toLowerCase().includes(searchLower))
      );
      filteredMisCursos = filteredMisCursos.filter(c => 
        c.cronograma.horario.toLowerCase().includes(searchLower)
      );
    }
  } else if (search) {
    // Si no hay filtro seleccionado, buscar solo por nombre del curso
    filteredCursos = filteredCursos.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));
    filteredMisCursos = filteredMisCursos.filter(c => c.curso.nombre.toLowerCase().includes(search.toLowerCase()));
  }
  
  filteredCursos = filteredCursos.sort((a, b) => orderAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre));
  filteredMisCursos = filteredMisCursos.sort((a, b) => orderAsc ? a.curso.nombre.localeCompare(b.curso.nombre) : b.curso.nombre.localeCompare(a.curso.nombre));

  function getBadgeStyle(modalidad: string) {
    if (modalidad.toUpperCase() === 'PRESENCIAL') return { backgroundColor: '#A5D6A7', borderColor: '#388E3C' };
    if (modalidad.toUpperCase() === 'VIRTUAL') return { backgroundColor: '#4DD0E1', borderColor: '#0097A7' };
    if (modalidad.toUpperCase() === 'ONLINE') return { backgroundColor: '#FFD180', borderColor: '#FFB300' };
    return { backgroundColor: '#eee', borderColor: '#bbb' };
  }

  function getBadgeIcon(modalidad: string) {
    if (modalidad.toUpperCase() === 'PRESENCIAL') return 'user';
    if (modalidad.toUpperCase() === 'VIRTUAL') return 'check-square-o';
    if (modalidad.toUpperCase() === 'ONLINE') return 'globe';
    return 'question';
  }

  function renderCurso({ item }: { item: Curso }, navigation: any) {
    return (
      <TouchableOpacity
        style={styles.cursoBlock}
        activeOpacity={userData?.token ? 0.7 : 1}
        onPress={() => {
          if (userData?.token) {
            navigation.navigate('cursoDetail', { idCurso: item.idCurso });
          }
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.cursoNombre}>{item.nombre}</Text>
          <View style={[styles.badge, getBadgeStyle(item.modalidad)]}>
            <FontAwesome name={getBadgeIcon(item.modalidad)} size={13} color="#222" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{item.modalidad.toUpperCase()}</Text>
          </View>
        </View>
        {item.cronogramas.map((c: any, idx: number) => (
          <View key={c.sede + c.fechaInicio + idx} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <FontAwesome name="calendar" size={14} color="#888" style={{ marginRight: 4 }} />
              <Text style={styles.cursoFechas}>{c.fechaInicio} → {c.fechaFin}</Text>
              <Text style={styles.cursoPrecio}>$ {item.precio.toLocaleString('es-AR')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <FontAwesome name="building-o" size={14} color="#888" style={{ marginRight: 4 }} />
              <Text style={styles.cursoSede}>{c.sede} | {c.dias?.join(', ')} {c.horario}</Text>
            </View>
          </View>
        ))}
      </TouchableOpacity>
    );
  }

  function handleOpenOptionsModal(insc: InscripcionAlumno) {
    modal.setType('courseOptions');
    modal.setModalProps({
      inscripcion: insc,
      onCargarAsistencia: handleCargarAsistencia,
      onVerDetalles: handleVerDetalles,
      onDarDeBaja: handleDarDeBaja,
    });
    modal.setOpenModal(true);
  }

  function handleCargarAsistencia(inscripcion: InscripcionAlumno) {
    console.log('Cargar asistencia para:', inscripcion.curso.nombre);
    (navigation as any).navigate('qrScanner', { inscripcionId: inscripcion.idInscripcion });
  }

  function handleVerDetalles(inscripcion: InscripcionAlumno) {
    (navigation as any).navigate('cursoDetail', { idCurso: inscripcion.curso.idCurso });
  }

  function handleDarDeBaja(inscripcion: InscripcionAlumno) {
    // Mostrar modal de confirmación
    modal.setType('dialog');
    modal.setDialogData({
      title: 'Dar de Baja',
      subTitle: `¿Estás seguro que quieres darte de baja del curso "${inscripcion.curso.nombre}"?`,
      icon: 'exclamation-triangle',
      showButton: true,
      buttonText: 'Dar de Baja',
      onButtonPress: () => {
        modal.setOpenModal(false);
        // Ejecutar la mutation para dar de baja
        if (userData?.token) {
          bajaMutation.mutate({
            idInscripcion: inscripcion.idInscripcion,
            token: userData.token
          });
        }
      },
    });
    modal.setOpenModal(true);
  }

  function renderMisCurso({ item }: { item: InscripcionAlumno }, navigation: any, handleOpenOptionsModal: (insc: InscripcionAlumno) => void) {
    return (
      <View style={styles.cursoBlock}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.cursoNombre}>{item.curso.nombre}</Text>
          <View style={[styles.badge, getBadgeStyle(item.curso.modalidad)]}>
            <FontAwesome name={getBadgeIcon(item.curso.modalidad)} size={13} color="#222" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{item.curso.modalidad.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={{ marginLeft: 'auto', padding: 6 }}
            onPress={() => handleOpenOptionsModal(item)}
          >
            <FontAwesome name="ellipsis-v" size={18} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <FontAwesome name="calendar" size={14} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.cursoFechas}>{item.cronograma.fechaInicio} → {item.cronograma.fechaFin}</Text>
            <Text style={styles.cursoPrecio}>$ {item.curso.precio.toLocaleString('es-AR')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <FontAwesome name="building-o" size={14} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.cursoSede}>{item.cronograma.sede} | {item.cronograma.dias?.join(', ')} {item.cronograma.horario}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <FontAwesome name="check-circle" size={14} color={item.estadoPago === 'pagado' ? '#4CAF50' : '#FF9800'} style={{ marginRight: 4 }} />
            <Text style={[styles.estadoPago, { color: item.estadoPago === 'pagado' ? '#4CAF50' : '#FF9800' }]}> {item.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}> 
      <Header title="" onBack={() => navigation.goBack()} centerComponent={renderDropdown()} rightButton={null} />
      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          <View style={styles.filtersRowScroll}>
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(f) => f.key}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(f.key)}
                >
                  <Text style={[styles.filterChipText, selectedFilter === f.key && styles.filterChipTextActive]} numberOfLines={1} ellipsizeMode="tail">{f.label}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ gap: 8 }}
            />
          </View>
          <TextInput
            style={styles.filterInput}
            placeholder={selectedFilter ? `Buscar por ${FILTERS.find(f => f.key === selectedFilter)?.label}` : 'Buscar'}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.body}>
          <View style={styles.ordenarRow}>
            <Text style={styles.ordenarText}>Ordenar</Text>
            <TouchableOpacity onPress={() => setOrderAsc(v => !v)}>
              <FontAwesome name={orderAsc ? 'sort-alpha-asc' : 'sort-alpha-desc'} size={18} color="#222" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 30 }}>Cargando cursos...</Text>
          ) : dropdownValue === 'mis' ? (
            <FlatList
              data={filteredMisCursos}
              keyExtractor={(item: InscripcionAlumno) => item.idInscripcion}
              renderItem={({ item }) => renderMisCurso({ item }, navigation, handleOpenOptionsModal)}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={<Text style={styles.placeholder}>No se encontraron cursos.</Text>}
            />
          ) : (
            <FlatList
              data={filteredCursos}
              keyExtractor={(item: Curso) => item.idCurso}
              renderItem={({ item }: { item: Curso }) => renderCurso({ item }, navigation)}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={<Text style={styles.placeholder}>No se encontraron cursos.</Text>}
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
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 110,
    minHeight: 36,
    marginBottom: 2,
    width: 160,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginRight: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
    minWidth: 120,
    zIndex: 10,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#222',
  },
  dropdownOptionTextActive: {
    color: '#00bfa5',
    fontWeight: 'bold',
  },
  filtersContainer: { paddingHorizontal: 16, paddingTop: 8, zIndex: 1 },
  filtersRowScroll: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'nowrap' },
  filterChip: { backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 0, maxWidth: 90 },
  filterChipActive: { backgroundColor: '#00bfa5' },
  filterChipText: { color: '#222', fontSize: 14, flexShrink: 1 },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
  filterInput: { minWidth: 120, borderBottomWidth: 1, borderColor: '#ccc', fontSize: 15, paddingVertical: 2, marginBottom: 8 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  ordenarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ordenarText: { marginRight: 6, color: '#888', fontSize: 14 },
  cursoBlock: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cursoNombre: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 2, marginRight: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6, borderWidth: 1 },
  badgeText: { fontWeight: 'bold', fontSize: 13, color: '#222' },
  cursoFechas: { fontSize: 13, color: '#444', marginRight: 10 },
  cursoPrecio: { fontSize: 14, color: '#666', marginLeft: 'auto', fontWeight: 'bold' },
  cursoSede: { fontSize: 13, color: '#888' },
  estadoPago: { fontSize: 13, color: '#666', marginLeft: 'auto' },
  placeholder: { textAlign: 'center', marginTop: 30, color: '#888' },
}); 