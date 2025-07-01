import { useAppContext } from '@/context/Context';
import { env } from '@/enviroment';
import * as SecureStore from 'expo-secure-store';

// Función para crear headers con autorización
export const createAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// Función para manejar errores de autorización
export const handleAuthError = (error: any, modal: any, userData: any) => {

  if (error.status === 401 || error.message?.includes('Unauthorized')) {
    const { login: { setIsLoggedIn } } = useAppContext();
    
    async function removeSession() {
      await SecureStore.deleteItemAsync('userSession');
      setIsLoggedIn(false);
    }
    
    removeSession();
    setIsLoggedIn(false);
    modal.setType("dialog");
    modal.setDialogData({
      icon: "exclamation-triangle",
      title: "Sesión Expirada",
      subTitle: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      showButton: true,
      buttonText: "OK",
      onButtonPress: () => {
        modal.setOpenModal(false);
        userData.setUserData({ email: "", alias: "", token: "", id: 0 });
      }
    });
    modal.setOpenModal(true);
    return true; // Indica que el error fue manejado
  }
  return false; // Indica que el error no fue manejado
};

// Función fetch con interceptor
export const apiFetch = async (
  url: string, 
  options: RequestInit = {}, 
  requireAuth: boolean = true,
  context?: { userData?: any; modal?: any }
) => {
  // Construir la URL completa
  const fullUrl = url.startsWith('http') ? url : `${env.API_URL}${url}`;
  
  // Preparar headers
  const headers = requireAuth && context?.userData?.token
    ? createAuthHeaders(context.userData.token)
    : { 'Content-Type': 'application/json' };

  // LOG para debug
  if (options.method === 'POST') {
    console.log('API POST:', {
      url: fullUrl,
      headers: { ...headers, ...options.headers },
      body: options.body,
      token: context?.userData?.token,
      requireAuth
    });
  }

  // Realizar la petición
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });


  // Manejar errores de autorización
  if (!response.ok) {

    const errorData = await response.json().catch(() => ({}));
    const error = {
      status: response.status,
      message: errorData.message || `HTTP ${response.status}`,
      data: errorData
    };
    console.log("POST FAIL", error);


    // Si es error de autorización y requiere auth, mostrar modal
    if (requireAuth && context && handleAuthError(error, context.modal, context.userData)) {
      throw new Error('Sesión expirada');
    }

    throw error;
  }
  
  // Si la respuesta es 204 (No Content) o el body está vacío, devolver null
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  return JSON.parse(text);
};

// Funciones específicas para diferentes tipos de peticiones
export async function apiGet(url: string, auth: boolean, context?: { userData?: any; modal?: any }) {
  return apiFetch(url, { method: 'GET' }, auth, context);
}

export async function apiPost(url: string, data: any, auth: boolean, context?: { userData?: any; modal?: any }) {
  console.log('apiPost call', { url, data, auth, token: context?.userData?.token });
  return apiFetch(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }, auth, context);
}

export async function apiPut(url: string, data: any, auth: boolean, context?: { userData?: any; modal?: any }) {
  return apiFetch(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }, auth, context);
}

export async function apiDelete(url: string, auth: boolean, context?: { userData?: any; modal?: any }) {
  return apiFetch(url, { method: 'DELETE' }, auth, context);
} 