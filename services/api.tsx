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
  context?: { userData: any; modal: any }
) => {
  // Construir la URL completa
  const fullUrl = url.startsWith('http') ? url : `http://${env.API_URL}${url}`;
  
  // Preparar headers
  const headers = requireAuth && context?.userData?.token
    ? createAuthHeaders(context.userData.token)
    : { 'Content-Type': 'application/json' };
  
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
    
    // Si es error de autorización y requiere auth, mostrar modal
    if (requireAuth && context && handleAuthError(error, context.modal, context.userData)) {
      throw new Error('Sesión expirada');
    }
    
    // Para otros errores, lanzar el error original
    throw error;
  }
  
  return response.json();
};

// Funciones específicas para diferentes tipos de peticiones
export const apiGet = (url: string, requireAuth: boolean = true, context?: { userData: any; modal: any }) => 
  apiFetch(url, { method: 'GET' }, requireAuth, context);

export const apiPost = (url: string, data: any, requireAuth: boolean = true, context?: { userData: any; modal: any }) => 
  apiFetch(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }, requireAuth, context);

export const apiPut = (url: string, data: any, requireAuth: boolean = true, context?: { userData: any; modal: any }) => 
  apiFetch(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }, requireAuth, context);

export const apiDelete = (url: string, requireAuth: boolean = true, context?: { userData: any; modal: any }) => 
  apiFetch(url, { method: 'DELETE' }, requireAuth, context); 