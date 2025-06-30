import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function BottomBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const secondaryColor = useThemeColor({}, 'secondary');

  const isActive = (screenName: string) => {
    return route.name === screenName;
  };

  // Ocultar BottomBar en pantallas que no son principales
  const shouldShow = () => {
    const mainScreens = ['home', 'cursos', 'recetas', 'perfil'];
    return mainScreens.includes(route.name as string);
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <View style={styles.bottomBar}>
      <Pressable 
        style={styles.bottomBarItem} 
        onPress={() => navigation.navigate('home' as never)}
      >
        <FontAwesome 
          name="home" 
          size={28} 
          color={isActive('home') ? '#FFFFFF' : secondaryColor} 
        />
        <Text style={[
          styles.bottomBarLabel, 
          { color: isActive('home') ? '#FFFFFF' : secondaryColor },
          isActive('home') && styles.bottomBarLabelActive
        ]}>
          Home
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.bottomBarItem} 
        onPress={() => navigation.navigate('cursos' as never)}
      >
        <FontAwesome 
          name="graduation-cap" 
          size={28} 
          color={isActive('cursos') ? '#FFFFFF' : secondaryColor} 
        />
        <Text style={[
          styles.bottomBarLabel, 
          { color: isActive('cursos') ? '#FFFFFF' : secondaryColor },
          isActive('cursos') && styles.bottomBarLabelActive
        ]}>
          Cursos
        </Text>
      </Pressable>
      
      <Pressable 
        style={styles.bottomBarItem} 
        onPress={() => navigation.navigate('recetas' as never)}
      >
        <FontAwesome 
          name="cutlery" 
          size={28} 
          color={isActive('recetas') ? '#FFFFFF' : secondaryColor} 
        />
        <Text style={[
          styles.bottomBarLabel, 
          { color: isActive('recetas') ? '#FFFFFF' : secondaryColor },
          isActive('recetas') && styles.bottomBarLabelActive
        ]}>
          Recetas
        </Text>
      </Pressable>
      <Pressable 
        style={styles.bottomBarItem} 
        onPress={() => navigation.navigate('perfil' as never)}
      >
        <FontAwesome 
          name="user" 
          size={28} 
          color={isActive('perfil') ? '#FFFFFF' : secondaryColor} 
        />
        <Text style={[
          styles.bottomBarLabel, 
          { color: isActive('perfil') ? '#FFFFFF' : secondaryColor },
          isActive('perfil') && styles.bottomBarLabelActive
        ]}>
          Perfil
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#5FC6C3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBarItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  bottomBarLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomBarLabelActive: {
    fontWeight: '600',
  },
}); 