import { Platform } from 'react-native';

export const colors = {
  bg: '#030303',
  paper: '#09090a',
  panel: '#0b0b0c',
  panel2: '#111113',
  card: '#111113',
  card2: '#171719',
  line: 'rgba(255,255,255,0.13)',
  lineSoft: 'rgba(255,255,255,0.08)',
  lineRed: 'rgba(239,25,25,0.58)',
  muted: '#85858a',
  soft: '#cfcfd3',
  white: '#f6f6f7',
  red: '#f11919',
  red2: '#a80606',
  red3: '#4b0505',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.64)',
};

export const radius = {
  card: 22,
  modal: 28,
  button: 16,
  tab: 23,
  stat: 16,
};

export const spacing = {
  screenX: 16,
  sectionTop: 18,
  cardPadding: 16,
  tabHeight: 68,
  buttonHeight: 52,
};

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
};
