import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    width: "90%",
    height: "100%",
    display: "flex",
    alignContent: "center",
    alignItems: "center",
  },
  modalContent: {
    display: "flex",
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    minWidth: '50%',
    maxWidth: "90%",
    borderRadius: 10,
    padding: 25,
  },
});

export default styles;