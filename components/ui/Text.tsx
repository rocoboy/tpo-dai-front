import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '@/constants/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: keyof typeof colors.text | 'primary' | 'error' | 'success';
  style?: TextStyle;
  weight?: keyof typeof typography.weights;
}

export default function Text({ 
  children, 
  variant = 'body', 
  color = 'primary',
  style,
  weight
}: TextProps) {
  const textColor = color === 'primary' ? colors.primary : 
                   color === 'error' ? colors.error :
                   color === 'success' ? colors.success :
                   colors.text[color as keyof typeof colors.text];

  const textStyle = [
    styles[variant],
    { color: textColor },
    weight && { fontWeight: typography.weights[weight] as any },
    style,
  ].filter(Boolean);

  return <RNText style={textStyle}>{children}</RNText>;
}

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700' as any,
  },
  h2: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700' as any,
  },
  h3: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as any,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: '400' as any,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: '400' as any,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: '500' as any,
  },
}); 