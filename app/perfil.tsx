import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/Context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getAlumnoProfile } from '@/services/auth';
import { UserProfile, AlumnoProfile } from '@/models/auth';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Header from '@/components/ui/Header';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';

export default function PerfilScreen() {
  const { userData, camera: {setCameraData} } = useAppContext();
  const navigation = useNavigation();

  // Query para obtener el perfil completo del usuario
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userData.id],
    queryFn: () => getUserProfile(userData.id, userData.token),
    enabled: !!userData.token && userData.id > 0,
  });

  // Query para obtener datos de alumno si el usuario es alumno
  const { data: alumnoProfile } = useQuery({
    queryKey: ['alumnoProfile'],
    queryFn: () => getAlumnoProfile(userData.token),
    enabled: !!userData.token && userProfile?.tipoUsuario === 'Alumno',
  });

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
  const alumno = alumnoProfile;

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
          
          {alumno ? (
            <Card variant="elevated" style={styles.alumnoCard}>
              <Text variant="h3" color="primary" style={styles.sectionTitle}>
                Datos de Alumno
              </Text>
              <Text variant="label" color="secondary">DNI:</Text>
              <Text variant="body" style={styles.value}>{alumno.medioPago.dni}</Text>
              
              <Text variant="label" color="secondary" style={styles.label}>N° de trámite:</Text>
              <Text variant="body" style={styles.value}>{alumno.medioPago.nroTramite}</Text>
              
              <Text variant="label" color="secondary" style={styles.label}>Tarjeta:</Text>
              <Text variant="body" style={styles.value}>{alumno.medioPago.nroTarjeta}</Text>
              
              <Text variant="label" color="secondary" style={styles.label}>Cuenta corriente:</Text>
              <Text variant="body" style={styles.value}>${alumno.cuentaCorriente}</Text>
            </Card>
          ) : user.tipoUsuario === 'Usuario' ? (
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