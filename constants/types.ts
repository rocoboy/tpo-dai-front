const theme = {
  colors: {
    primary: '#5FC6C3',
    secondary: '#FAFAFA',
    danger: '#e74c3c',
    light: '#ffffff',
    dark: '#2c3e50',
    textLight: '#898989',
    textDark: '#505050',
    muted: '#888',
    buttonBorder: "#E8E8E8",
    buttonFill: "#F2F2F2",
    background: "black",
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const;

export default theme;

export type ColorType = keyof typeof theme.colors;
export type FontSizeType = keyof typeof theme.fontSizes;
export type FontWeightType = keyof typeof theme.fontWeights;