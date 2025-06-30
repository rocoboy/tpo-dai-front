import theme from '@/constants/types';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  body: {
    display: "flex",
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.primary,
    justifyContent: "flex-end",
    gap: 30
  },
  container: {
    display: "flex",
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 70,
    height: "85%",
    borderTopStartRadius: 30,
    borderTopEndRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  loginText: {
    marginTop: 15,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default styles;
