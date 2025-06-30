import { Curso, CursoDetail, InscripcionAlumno, InscripcionCurso, RegistrarAsistenciaResponse } from '@/models/curso';
import { env } from "../enviroment";
export async function getCursos(): Promise<Curso[]> {
  console.log("cursos a obtener");
  const response = await fetch(`${env.API_URL}/courses`);
  if (!response.ok) {
    throw new Error('Error al obtener los cursos');
  }
  console.log("cursos", response);
  return response.json();
}

export async function getCursoDetail(id: string): Promise<CursoDetail> {
  const response = await fetch(`${env.API_URL}/courses/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener el detalle del curso');
  }
  return response.json();
}

export async function inscribirACurso({ idCurso, idCronograma }: InscripcionCurso, token: string): Promise<any> {
  const response = await fetch(`${env.API_URL}/courses/${idCurso}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ idCronograma }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al inscribirse en el curso');
  }
  return response.json();
}

export async function getMisCursos(token: string): Promise<InscripcionAlumno[]> {

  console.log("token", token);
  const response = await fetch(`${env.API_URL}/courses/myCourses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData: any = await response.json();

    console.log("errorrrrrrrr", errorData);
    if (errorData.message) {
      throw errorData;
    }

    throw new Error('Something went wrong!');
  }
  return response.json();
}

export async function darDeBajaCurso(idInscripcion: string, token: string): Promise<any> {
  const response = await fetch(`${env.API_URL}/courses/${idInscripcion}/unenroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al dar de baja del curso');
  }
  return response.json();
}

export async function registrarAsistencia(
  idCronograma: string, 
  token: string
): Promise<RegistrarAsistenciaResponse> {
  const response = await fetch(`${env.API_URL}/courses/${idCronograma}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ presente: true }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al registrar asistencia');
  }
  
  return response.json();
}
