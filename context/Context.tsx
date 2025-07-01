import { FontAwesome } from "@expo/vector-icons";
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
type FontAwesomeIconName = keyof typeof FontAwesome.glyphMap;

export interface FotoReceta {
  extension: string;
  path: string;
}

export interface FotoLocal {
  uri: string;
  extension: string;
  name: string;
}

export interface MultimediaLocal {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

export interface UtilizadoReceta {
  idIngrediente: string;
  idUnidad: string;
  cantidad: string;
  nombre: string;
  observaciones?: string;
  descripcionUnidad: string;
}

export interface PasoReceta {
  nroPaso: number;
  texto: string;
  multimedia: any[];
  multimediaLocal?: MultimediaLocal[]; // Fotos/videos locales antes de subir
}

export interface RecipeDraft {
  folderId?: string; // ID único para la carpeta en el bucket
  nombreReceta: string;
  descripcionReceta: string;
  porciones: number;
  cantidadPersonas: number;
  idTipo: string;
  fotos: FotoReceta[]; // URLs finales después de subir
  fotosLocal?: FotoLocal[]; // Fotos locales antes de subir
  utilizados: UtilizadoReceta[];
  pasos: PasoReceta[];
}

interface ContextType {
    loading: {
        isLoading: boolean;
        setIsLoading: Dispatch<SetStateAction<boolean>>;
    }
    login: {
        isLoggedIn: boolean;
        setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
        isVisitor: boolean;
    };
    modal: {
        isOpenModal: boolean;
        setOpenModal: Dispatch<SetStateAction<boolean>>;
        type: string;
        dialog: {
            title: string;
            subTitle: string;
            icon: FontAwesomeIconName;
            showButton?: boolean;
            buttonText?: string;
            onButtonPress?: () => void;
            showCancelButton?: boolean;
            cancelButtonText?: string;
            onCancelPress?: () => void;
        }
        setType: Dispatch<SetStateAction<string>>;
        setDialogData: Dispatch<SetStateAction<{
            title: string;
            subTitle: string;
            icon: FontAwesomeIconName;
            showButton?: boolean;
            buttonText?: string;
            onButtonPress?: () => void;
            showCancelButton?: boolean;
            cancelButtonText?: string;
            onCancelPress?: () => void;
        }>>;
        modalProps: any;
        setModalProps: Dispatch<SetStateAction<any>>;
    };
    userData: {
        id: number;
        email: string;
        alias: string;
        token: string;
        setUserData: Dispatch<SetStateAction<{email: string, alias: string, token: string, id: number}>>;
    };
    register: {
        student: boolean;
        setRegisterStudent: Dispatch<SetStateAction<boolean>>;
    };
    camera: {
        frontURI: string;
        backURI: string;
        actualIdSide: "front" | "back" | undefined;
        setCameraData: Dispatch<SetStateAction<{frontURI: string, backURI: string, actualIdSide: "front" | "back" | undefined}>>;
    }
    recipeDraft: RecipeDraft;
    setRecipeDraft: Dispatch<SetStateAction<RecipeDraft>>;
    clearRecipeDraft: () => void;
}

// Contador para generar IDs únicos de recetas
let recipeDraftCounter = 0;

const generateRecipeDraftId = () => {
  recipeDraftCounter++;
  const id = `draft_${Date.now()}_${recipeDraftCounter}`;
  console.log("Nuevo ID de draft generado:", id);
  return id;
};

// Helper para asegurar que siempre haya un folderId válido
export const ensureRecipeFolderId = async (draft: RecipeDraft): Promise<RecipeDraft> => {
  if (!draft.folderId) {
    // Importar dinámicamente para evitar problemas de circular imports
    const { generateUniqueFolderId } = await import('@/helpers/uploadPhotos');
    const folderId = await generateUniqueFolderId();
    return {
      ...draft,
      folderId
    };
  }
  return draft;
};

const defaultRecipeDraft: RecipeDraft = {
  folderId: generateRecipeDraftId(),
  nombreReceta: '',
  descripcionReceta: '',
  porciones: 1,
  cantidadPersonas: 1,
  idTipo: '',
  fotos: [],
  fotosLocal: [],
  utilizados: [],
  pasos: [],
};

const Context = createContext<ContextType>({
    loading: {
        isLoading: false,
        setIsLoading: () => {},
    },
    login: {
        isLoggedIn: false,
        setIsLoggedIn: () => { },
        isVisitor: true,
    },
    modal: {
        isOpenModal: false,
        setOpenModal: () => { },
        type: "",
        dialog: {
            title: "",
            subTitle: "",
            icon: "info" as FontAwesomeIconName,
        },
        setType: () => { },
        setDialogData: () => {},
        modalProps: {},
        setModalProps: () => {},
    },
    userData: {
        id: 0,
        email: "",
        alias: "",
        token: "",
        setUserData: () => {},
    },
    register: {
        student: false,
        setRegisterStudent: () => {},
    },
    camera: {
        frontURI: "",
        backURI: "",
        actualIdSide: undefined,
        setCameraData: () => {},
    },
    recipeDraft: defaultRecipeDraft,
    setRecipeDraft: () => {},
    clearRecipeDraft: () => {},
});

const ContextProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isVisitor, setIsVisitor] = useState(true);
    const [isOpenModal, setOpenModal] = useState(false);
    const [type, setType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [dialogData, setDialogData] = useState({title: "", subTitle: "", icon: "info" as FontAwesomeIconName});
    const [userData, setUserData] = useState({email: "", alias: "", token: "", id: 0});
    const [registerStudent, setRegisterStudent] = useState(false);
    const [camera, setCamera] = useState({frontURI: "", backURI: "", actualIdSide: undefined as "front" | "back" | undefined});
    const [modalProps, setModalProps] = useState<any>({});
    const [recipeDraft, setRecipeDraft] = useState<RecipeDraft>(() => ({
      ...defaultRecipeDraft,
      folderId: generateRecipeDraftId()
    }));
    const clearRecipeDraft = () => {
      const newDraft = {
        ...defaultRecipeDraft,
        folderId: generateRecipeDraftId()
      };
      setRecipeDraft(newDraft);
    };

    const initialState = {
        loading: {
            isLoading,
            setIsLoading,
        },
        login: { isLoggedIn, setIsLoggedIn, isVisitor: !isLoggedIn },
        modal: { isOpenModal, setOpenModal, type, setType, dialog: dialogData, setDialogData, modalProps, setModalProps },
        userData: {email: userData.email, alias: userData.alias, token: userData.token, id: userData.id, setUserData},
        register: {student: registerStudent, setRegisterStudent},
        camera: {frontURI: camera.frontURI, backURI: camera.backURI, actualIdSide: camera.actualIdSide, setCameraData: setCamera},
        recipeDraft,
        setRecipeDraft,
        clearRecipeDraft,
    };

    return (
        <Context.Provider value={initialState}>
            {children}
        </Context.Provider>
    );
}

export const useAppContext = () => useContext(Context);

export default ContextProvider;