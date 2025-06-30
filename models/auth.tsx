export interface LoginPost {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
  }
  
  export interface RegisterPost {
    nickname: string;
    mail: string;
  }

  export interface ValidatePost {
    username: string;
    code: string;
    password: string;
  }

  export interface RecoverPasswordPost {
    mail: string;
  }

  export interface ResetPasswordPost {
    email: string;
    code: string;
    newPassword: string;
  }

  export interface RegisterAlumnPost {
    id: number;
    userData: {
      dni: number;
      numeroTarjeta: string;
      dniFrente: string;
      dniFondo: string;
      tramite: string;
      tipoTarjeta: string;
    }
  }

  export interface UserProfile {
    idUsuario: number;
    mail: string;
    nickname: string;
    habilitado: 'Si' | 'No';
    nombre?: string;
    apellido?: string;
    direccion?: string;
    avatar?: string;
    tipoUsuario: 'Usuario' | 'Alumno' | 'Admin';
    alumno?: AlumnoProfile;
  }

  export interface AlumnoProfile {
    idAlumno: number;
    medioPago: {
      nroTarjeta: string;
      dni: number;
      nroTramite: string;
      dniFrente: string;
      dniReverso: string;
    };
    cuentaCorriente: number;
  }