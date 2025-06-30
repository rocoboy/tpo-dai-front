import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '@/context/Context';
import { InscripcionAlumno } from '@/models/curso';

interface CourseOptionsModalProps {
  inscripcion: InscripcionAlumno;
  onCargarAsistencia: (inscripcion: InscripcionAlumno) => void;
  onVerDetalles: (inscripcion: InscripcionAlumno) => void;
  onDarDeBaja: (inscripcion: InscripcionAlumno) => void;
}

export default function CourseOptionsModal({ 
  inscripcion, 
  onCargarAsistencia, 
  onVerDetalles, 
  onDarDeBaja 
}: CourseOptionsModalProps) {
  const { modal: { setOpenModal } } = useAppContext();

  const handleOptionPress = (action: () => void) => {
    setOpenModal(false);
    action();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Opciones del curso</Text>
        <Text style={styles.subtitle}>{inscripcion.curso.nombre}</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOptionPress(() => onCargarAsistencia(inscripcion))}
        >
          <FontAwesome name="qrcode" size={20} color="#00bfa5" />
          <Text style={styles.optionText}>Cargar Asistencia</Text>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOptionPress(() => onVerDetalles(inscripcion))}
        >
          <FontAwesome name="info-circle" size={20} color="#2196F3" />
          <Text style={styles.optionText}>Ver Detalles</Text>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => handleOptionPress(() => onDarDeBaja(inscripcion))}
        >
          <FontAwesome name="times-circle" size={20} color="#F44336" />
          <Text style={styles.optionText}>Dar de Baja</Text>
          <FontAwesome name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => setOpenModal(false)}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
}); 