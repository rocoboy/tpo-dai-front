export interface CronogramaCurso {
  fechaInicio: string;
  fechaFin: string;
  sede: string;
  dias: string[];
  horario: string;
  vacantes: number;
}

export interface Curso {
  idCurso: string;
  nombre: string;
  modalidad: string;
  precio: number;
  cronogramas: CronogramaCurso[];
}

export interface ClaseCurso {
  idClase: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tema: string;
}

export interface CronogramaCursoDetail {
  idCronograma: string;
  sede: string;
  fechaInicio: string;
  fechaFin: string;
  dias: string[];
  horario: string;
  vacantes: number;
  promocion?: string;
  clases: ClaseCurso[];
}

export interface CursoDetail {
  idCurso: string;
  nombre: string;
  descripcion: string;
  contenidos: string;
  requisitos: string;
  duracion: string;
  modalidad: string;
  precio: number;
  cronogramas: CronogramaCursoDetail[];
}

export interface InscripcionCurso {
  idCurso: string;
  idCronograma: string;
}

export interface InscripcionAlumno {
  idInscripcion: string;
  estadoPago: string;
  asistencia: boolean;
  curso: {
    idCurso: string;
    nombre: string;
    modalidad: string;
    precio: number;
  };
  cronograma: {
    idCronograma: string;
    sede: string;
    fechaInicio: string;
    fechaFin: string;
    horario: string;
    dias: string[];
    clases: ClaseCurso[];
  };
}

export interface RegistrarAsistenciaRequest {
  presente: boolean;
}

export interface RegistrarAsistenciaResponse {
  mensaje: string;
  porcentajeAsistencia: string;
  asistencia: {
    idAsistencia: string;
    fecha: string;
    presente: boolean;
  };
} 