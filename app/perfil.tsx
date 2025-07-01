import Card from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import Text from '@/components/ui/Text';
import { borderRadius, colors, spacing } from '@/constants/theme';
import { useAppContext } from '@/context/Context';
import { getUserProfile } from '@/services/auth';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Servicio para obtener datos de alumno
async function fetchAlumnoProfile(token: string) {
  const res = await fetch('https://tpo-dai-back.onrender.com/alumnos/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener datos de alumno');
  return res.json();
}

// Servicio para obtener pagos
async function fetchAlumnoPayments(token: string) {
  const res = await fetch('https://tpo-dai-back.onrender.com/alumnos/payments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener pagos');
  return res.json();
}

export default function PerfilScreen() {
  const { userData, camera: {setCameraData} } = useAppContext();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userData.id] });
    }, [queryClient, userData.id])
  );

  // Query para obtener el perfil completo del usuario
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userData.id],
    queryFn: () => getUserProfile(userData.id, userData.token),
    enabled: !!userData.token && userData.id > 0,
  });

  // Mutation para datos de alumno
  const alumnoProfileMutation = useMutation({
    mutationFn: () => fetchAlumnoProfile(userData.token),
  });
  // Mutation para pagos
  const alumnoPaymentsMutation = useMutation({
    mutationFn: () => fetchAlumnoPayments(userData.token),
  });

  React.useEffect(() => {
    if (userData.token) {
      alumnoProfileMutation.mutate();
      alumnoPaymentsMutation.mutate();
    }
  }, [userData.token]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color="secondary" style={styles.loadingText}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body" color="error">
          Error al cargar el perfil
        </Text>
      </View>
    );
  }

  const user = userProfile || userData;
  const alumno = userProfile?.alumno;

  console.log("user", user);
  console.log("alumno", alumno);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Perfil" onBack={() => navigation.goBack()} rightButton={null} />
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={user.avatar ? { uri: user.avatar } : require('@/assets/images/bigLogo.png')}
              style={styles.avatar}
            />
          </View>
          
          <Text variant="h2" color="primary" style={styles.title}>
            {user.nickname}
          </Text>
          
          <Card variant="elevated" style={styles.infoCard}>
            <Text variant="label" color="secondary">Email:</Text>
            <Text variant="body" style={styles.value}>{user.mail || user.email}</Text>
            
            {user.nombre && (
              <>
                <Text variant="label" color="secondary" style={styles.label}>Nombre:</Text>
                <Text variant="body" style={styles.value}>{user.nombre}</Text>
              </>
            )}
            
            {user.apellido && (
              <>
                <Text variant="label" color="secondary" style={styles.label}>Apellido:</Text>
                <Text variant="body" style={styles.value}>{user.apellido}</Text>
              </>
            )}
            
            {user.direccion && (
              <>
                <Text variant="label" color="secondary" style={styles.label}>Dirección:</Text>
                <Text variant="body" style={styles.value}>{user.direccion}</Text>
              </>
            )}
            
            <Text variant="label" color="secondary" style={styles.label}>Tipo de usuario:</Text>
            <Text variant="body" style={styles.value}>{user.tipoUsuario}</Text>
          </Card>
          
          {/* Card de Medio de Pago y Cuenta Corriente */}
          {alumnoProfileMutation.isPending ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text variant="body" style={{ marginTop: 8 }}>Cargando datos de alumno...</Text>
            </Card>
          ) : alumnoProfileMutation.data ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <Text variant="h3" color="primary" style={styles.sectionTitle}>Medio de Pago</Text>
              <Text variant="label" color="secondary">N° de tarjeta:</Text>
              <Text variant="body" style={styles.value}>
                {alumnoProfileMutation.data.medioPago.nroTarjeta.replace(/.(?=.{4})/g, '*')}
              </Text>
              <Text variant="label" color="secondary" style={styles.label}>DNI:</Text>
              <Text variant="body" style={styles.value}>{alumnoProfileMutation.data.medioPago.dni}</Text>
              <Text variant="label" color="secondary" style={styles.label}>N° de trámite:</Text>
              <Text variant="body" style={styles.value}>{alumnoProfileMutation.data.medioPago.nroTramite}</Text>
              <Text variant="label" color="secondary" style={styles.label}>Cuenta corriente:</Text>
              <Text variant="body" style={styles.value}>${alumnoProfileMutation.data.cuentaCorriente}</Text>
            </Card>
          ) : null}
          {alumnoProfileMutation.isError && (
            <Card variant="elevated" style={styles.alumnoCard}>
              <Text variant="body" color="error">Error al cargar datos de alumno</Text>
            </Card>
          )}

          {/* Card de Pagos */}
          {alumnoPaymentsMutation.isPending ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text variant="body" style={{ marginTop: 8 }}>Cargando pagos...</Text>
            </Card>
          ) : alumnoPaymentsMutation.data && alumnoPaymentsMutation.data.length > 0 ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <Text variant="h3" color="primary" style={styles.sectionTitle}>Pagos Realizados</Text>
              {alumnoPaymentsMutation.data.map((pago: any) => (
                <View key={pago.idPago} style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 }}>
                  <Text variant="body" style={styles.value}>{pago.descripcion}</Text>
                  <Text variant="label" color="secondary">Fecha: <Text variant="body">{new Date(pago.fecha).toLocaleDateString()}</Text></Text>
                  <Text variant="label" color="secondary">Monto: <Text variant="body">${pago.monto}</Text></Text>
                  <Text variant="label" color="secondary">Tipo: <Text variant="body">{pago.tipo}</Text></Text>
                  <Text variant="label" color="secondary">Medio de pago: <Text variant="body">{pago.medioPago}</Text></Text>
                </View>
              ))}
            </Card>
          ) : alumnoPaymentsMutation.isError ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <Text variant="body" color="error">Error al cargar pagos</Text>
            </Card>
          ) : null}

          {!alumno && user.tipoUsuario === 'Usuario' && user.alias !== 'invitado' ? (
            <Pressable style={styles.btnAlumno} onPress={() => {navigation.navigate('becomeStudent' as never),setCameraData({actualIdSide: "front", frontURI: "", backURI: "" }) }}>
              <Text variant="body" color="primary" weight="bold" style={styles.btnAlumnoText}>
                Volverse estudiante
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  avatarContainer: {
    marginBottom: spacing.base,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  title: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  alumnoCard: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    marginTop: spacing.sm,
  },
  value: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.base,
  },
  btnAlumno: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    width: '100%',
  },
  btnAlumnoText: {
    color: colors.background,
  },
}); 