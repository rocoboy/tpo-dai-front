import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors, spacing, borderRadius } from '@/constants/theme';
import Text from './Text';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  rightButton?: React.ReactNode;
  centerComponent?: React.ReactNode;
}

export default function Header({ title, onBack, rightButton, centerComponent }: HeaderProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack || (() => navigation.goBack())}
        android_ripple={{ color: '#e0e0e0', borderless: true }}
      >
        <View style={styles.backCircle}>
          <FontAwesome name="chevron-left" size={22} color="#fff" />
        </View>
      </Pressable>
      <View style={styles.titleContainer}>
        {centerComponent || (title && <Text variant="h2" color="primary" style={styles.title}>{title}</Text>)}
      </View>
      <View style={styles.rightBtn}>{rightButton}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backBtn: {
    marginRight: 16,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7be3e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  rightBtn: {
    minWidth: 44,
    alignItems: 'flex-end',
    marginLeft: 16,
  },
}); 