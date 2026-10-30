import { Platform, StyleSheet } from 'react-native';
import type { Theme } from '@/lib/appTheme';

export const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.level2
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 8
  },
  title: {
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 4,
    color: theme.palette.text.primary
  },
  subtitle: {
    color: theme.palette.text.secondary,
    alignSelf: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.palette.border?.light || theme.palette.divider,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputText: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: theme.palette.text.primary,
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    ...Platform.select({
      ios: { shadowColor: theme.palette.primary.main, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  buttonText: {
    color: theme.palette.primary.contrastText || '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  demoText: {
    color: theme.palette.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
    lineHeight: 18,
  }
});
