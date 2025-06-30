import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, SafeAreaView, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getCursoDetail, inscribirACurso } from '@/services/curso';
import { CursoDetail } from '@/models/curso';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppContext } from '@/context/Context';

const MOCK_IMAGE = require('@/assets/images/bigLogo.png');

export default function CursoDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { idCurso } = route.params || {};
    const { userData, modal, login } = useAppContext();
    const [curso, setCurso] = React.useState<CursoDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [sedeElegida, setSedeElegida] = React.useState<string | null>(null);
    const [inscribiendo, setInscribiendo] = React.useState(false);

    React.useEffect(() => {
        if (!idCurso) return;
        setLoading(true);
        getCursoDetail(idCurso)
            .then(setCurso)
            .catch(() => setError('No se pudo cargar el curso'))
            .finally(() => setLoading(false));
    }, [idCurso]);

    // Handler para inscribirse
    function handleInscribirse() {
        if (!login.isLoggedIn || !userData.token) {
            modal.setType('dialog');
            modal.setDialogData({
                title: 'Iniciar sesión',
                subTitle: 'Debes iniciar sesión como alumno para inscribirte.',
                icon: 'exclamation-triangle',
                showButton: true,
                buttonText: 'OK',
                onButtonPress: () => modal.setOpenModal(false),
            });
            modal.setOpenModal(true);
            return;
        }
        if (!sedeElegida) {
            modal.setType('dialog');
            modal.setDialogData({
                title: 'Elegí una sede',
                subTitle: 'Debes elegir una sede para inscribirte.',
                icon: 'exclamation-triangle',
                showButton: true,
                buttonText: 'OK',
                onButtonPress: () => modal.setOpenModal(false),
            });
            modal.setOpenModal(true);
            return;
        }
        // Mostrar modal de confirmación antes de inscribir
        modal.setType('dialog');
        modal.setDialogData({
            title: 'Confirmar inscripción',
            subTitle: '¿Estás seguro que deseas inscribirte a este curso?',
            icon: 'exclamation-triangle',
            showButton: true,
            buttonText: 'Confirmar',
            onButtonPress: async () => {
                modal.setOpenModal(false);
                setInscribiendo(true);
                try {
                    await inscribirACurso({ idCurso, idCronograma: sedeElegida }, userData.token);
                    modal.setType('dialog');
                    modal.setDialogData({
                        title: '¡Inscripción exitosa!',
                        subTitle: 'Se ha completo la Inscripcion. Podrás verlo en "Mis Cursos"',
                        icon: 'check',
                        showButton: true,
                        buttonText: 'OK',
                        onButtonPress: () => {
                            modal.setOpenModal(false);
                            navigation.goBack();
                        },
                    });
                    modal.setOpenModal(true);
                } catch (e: any) {
                    modal.setType('dialog');
                    modal.setDialogData({
                        title: 'Error',
                        subTitle: e.message || 'No se pudo inscribir al curso.',
                        icon: 'exclamation-triangle',
                        showButton: true,
                        buttonText: 'OK',
                        onButtonPress: () => modal.setOpenModal(false),
                    });
                    modal.setOpenModal(true);
                } finally {
                    setInscribiendo(false);
                }
            },
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            onCancelPress: () => modal.setOpenModal(false),
        });
        modal.setOpenModal(true);
    }

    if (loading) {
        return <View style={[styles.center, { backgroundColor: '#fff' }]}><ActivityIndicator size="large" color="#5FC6C3" /></View>;
    }
    if (error || !curso) {
        return <View style={[styles.center, { backgroundColor: '#fff' }]}><Text>{error || 'No se encontró el curso'}</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView style={styles.container} contentContainerStyle={{ backgroundColor: '#fff' }}>
                {/* Header con imagen y botón volver */}
                <View style={styles.header}>
                    <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={26} color="#00bfa5" />
                    </Pressable>
                    <Image source={MOCK_IMAGE} style={styles.cursoImg} resizeMode="contain" />
                </View>
                {/* Badge modalidad y título */}
                <View style={styles.badgeRow}>
                    <Text style={[styles.badge, curso.modalidad === 'presencial' && styles.badgePresencial]}>{curso.modalidad.toUpperCase()}</Text>
                </View>
                <Text style={styles.title}>{curso.nombre}</Text>
                {/* Fechas */}
                <View style={styles.fechasRow}>
                    <View style={styles.fechaCol}>
                        <FontAwesome name="calendar" size={18} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.fechaLabel}>Fecha de Inicio</Text>
                        <Text style={styles.fechaValue}>{curso.cronogramas[0]?.fechaInicio || '-'}</Text>
                    </View>
                    <View style={styles.fechaCol}>
                        <FontAwesome name="calendar" size={18} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.fechaLabel}>Fecha de Cierre</Text>
                        <Text style={styles.fechaValue}>{curso.cronogramas[0]?.fechaFin || '-'}</Text>
                    </View>
                </View>
                {/* Sedes y cronogramas */}
                {curso.cronogramas.map((c, idx) => {
                    const tienePromo = !!c.promocion && c.promocion !== '0';
                    const precioPromo = tienePromo ? Math.round(curso.precio * (1 - parseInt(c.promocion || '0', 10) / 100)) : curso.precio;
                    const isElegida = sedeElegida === c.idCronograma;
                    return (
                        <React.Fragment key={c.idCronograma}>
                            <View style={styles.sedeBlock}>
                                <View style={styles.sedeHeader}>
                                    <FontAwesome name="building-o" size={18} color="#888" style={{ marginRight: 6 }} />
                                    <Text style={styles.sedeNombre}>{c.sede}</Text>
                                    <Pressable
                                        style={[styles.sedeBtn, isElegida ? styles.sedeBtnElegida : styles.sedeBtnNoElegida]}
                                        onPress={() => setSedeElegida(c.idCronograma)}
                                    >
                                        <Text style={isElegida ? styles.sedeBtnTextElegida : styles.sedeBtnTextNoElegida}>
                                            {isElegida ? 'SEDE ELEGIDA' : 'ELEGIR SEDE'}
                                        </Text>
                                    </Pressable>
                                </View>
                                <View style={styles.preciosRow}>
                                    <View style={styles.preciosCol}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            {tienePromo && (
                                                <Text style={styles.precioTachado}>${curso.precio.toLocaleString('es-AR')}</Text>
                                            )}
                                            <Text style={[styles.precioPromo, !tienePromo && { color: '#222' }]}>{`$${precioPromo.toLocaleString('es-AR')}`}</Text>
                                        </View>
                                        {tienePromo && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 2 }}>
                                                <Text style={styles.descuento}>{c.promocion}%</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.horarioRow}>
                                    <FontAwesome name="calendar" size={16} color="#888" style={{ marginRight: 4 }} />
                                    <Text style={styles.horarioDias}>{c.dias.join(' y ')} de {c.horario}</Text>
                                </View>
                                <View style={styles.vacantesRow}>
                                    <FontAwesome name="users" size={16} color="#888" style={{ marginRight: 4 }} />
                                    <Text style={styles.vacantes}>Vacantes {c.vacantes}</Text>
                                </View>
                            </View>
                            {curso.cronogramas.length > 1 && idx < curso.cronogramas.length - 1 && (
                                <View style={styles.sedeDivider} />
                            )}
                        </React.Fragment>
                    );
                })}
                {/* Descripción y secciones */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.sectionText}>{curso.descripcion}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objetivos del Curso</Text>
                    <Text style={styles.sectionText}>{curso.contenidos}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requisitos del Curso</Text>
                    <Text style={styles.sectionText}>{curso.requisitos}</Text>
                </View>
                {/* Botón inscribirse */}
                <Pressable style={styles.btnInscribirse} onPress={handleInscribirse} disabled={inscribiendo}>
                    <Text style={styles.btnText}>{inscribiendo ? 'Inscribiendo...' : 'Inscribirme'}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 10 },
    backBtn: { marginRight: 8, padding: 8 },
    cursoImg: { height: 90, width: 90, borderRadius: 12, backgroundColor: '#fff' },
    badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 16 },
    badge: { alignSelf: 'flex-start', backgroundColor: '#C8F7E2', color: '#1B8C6E', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontWeight: 'bold', marginBottom: 6, fontSize: 13 },
    badgePresencial: { backgroundColor: '#A5D6A7', color: '#388E3C' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, marginLeft: 16, marginTop: 2 },
    fechasRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 40, marginLeft: 16, marginBottom: 10 },
    fechaCol: { alignItems: 'flex-start', marginRight: 24 },
    fechaLabel: { color: '#888', fontSize: 13, fontWeight: 'bold' },
    fechaValue: { color: '#222', fontSize: 15, fontWeight: 'bold' },
    sedeBlock: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
    sedeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    sedeNombre: { fontWeight: 'bold', color: '#444', fontSize: 16, flex: 1 },
    sedeBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
    sedeBtnElegida: { borderColor: '#00bfa5', backgroundColor: '#E0F7FA' },
    sedeBtnNoElegida: { borderColor: '#00bfa5', backgroundColor: '#fff' },
    sedeBtnTextElegida: { color: '#00bfa5', fontWeight: 'bold', fontSize: 12 },
    sedeBtnTextNoElegida: { color: '#00bfa5', fontWeight: 'bold', fontSize: 12 },
    preciosRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
    preciosCol: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: "100%" },
    precioTachado: { textDecorationLine: 'line-through', color: '#888', fontSize: 15, marginRight: 6 },
    precioPromo: { color: '#E57373', fontWeight: 'bold', fontSize: 17 },
    descuento: { color: '#E57373', fontWeight: 'bold', fontSize: 15 },
    horarioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    horarioDias: { color: '#444', fontSize: 14 },
    vacantesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    vacantes: { color: '#444', fontSize: 14 },
    sedeDivider: { height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 16, marginVertical: 4 },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    sectionText: { color: '#444', fontSize: 14 },
    btnInscribirse: { backgroundColor: '#5FC6C3', borderRadius: 8, margin: 16, padding: 14, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 