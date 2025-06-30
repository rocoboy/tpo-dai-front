import { LoginPost, RecoverPasswordPost, RegisterAlumnPost, RegisterPost, ResetPasswordPost, ValidatePost } from "@/models/auth";

import { env } from "../enviroment";
export const loginUser = async ({ email, password }: LoginPost) => {

  const response = await fetch(`http://${env.API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    const errorData: any = await response.json();

    console.log("errorrrrrrrr", errorData);
    if (errorData.message) {
      throw errorData;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();

  return data;
};

export const registerUser = async ({ mail, nickname }: RegisterPost) => {
  const response = await fetch(`http://${env.API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },  
    body: JSON.stringify({ tipoUsuario: "Usuario", nickname, mail }),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Parseamos la respuesta JSON
    if (errorData.error) {
      throw errorData || errorData.error;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const validateUser = async ({ username, code, password }: ValidatePost) => {
  const response = await fetch(`http://${env.API_URL}/auth/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, code, password }),
  });

  if (!response.ok) {
    const errorData = await response.json(); // Parseamos la respuesta JSON

    if (errorData.error) {
      throw errorData || errorData.error;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const recoverAccount = async ({ mail }: RecoverPasswordPost) => {
  const response = await fetch(`http://${env.API_URL}/auth/recover-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mail }),
  });

  console.log("register user", response);

  if (!response.ok) {
    const errorData = await response.json(); // Parseamos la respuesta JSON

    if (errorData.error) {
      throw errorData || errorData.error;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const resetPassword = async ({ email, code, newPassword }: ResetPasswordPost) => {
  const response = await fetch(`http://${env.API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  console.log("register user", response);

  if (!response.ok) {
    const errorData = await response.json(); // Parseamos la respuesta JSON

    if (errorData.error) {
      throw errorData || errorData.error;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const upgradeAccount = async ({ id, userData}: RegisterAlumnPost) => {
  const response = await fetch(`http://${env.API_URL}/alumnos/updateProfile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  console.log("DATOS", userData);
  if (!response.ok) {
    const errorData = await response.json(); // Parseamos la respuesta JSON

    if (errorData.error) {
      throw errorData || errorData.error;
    }

    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const upgradeUser = async ({ id, userData }: RegisterAlumnPost) => {
  console.log("DATOS", userData, id);
  const response = await fetch(`http://${env.API_URL}/auth/register-alumno/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw errorData || errorData.error;
    }
    throw new Error('Something went wrong!');
  }
  const data = await response.json();
  return data;
};

export const getUserProfile = async (id: number, token: string) => {
  const response = await fetch(`http://${env.API_URL}/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw errorData || errorData.error;
    }
    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const getAlumnoProfile = async (token: string) => {
  const response = await fetch(`http://${env.API_URL}/alumnos/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw errorData || errorData.error;
    }
    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};
