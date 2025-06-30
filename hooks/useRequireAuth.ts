import { useAppContext } from '@/context/Context';
import { useNavigation } from '@react-navigation/native';

export const useRequireAuth = () => {
  const { login: { isLoggedIn }, modal: { setType, setModalProps, setOpenModal } } = useAppContext();
  const navigation = useNavigation();

  const requireAuth = (action?: () => void) => {
    if (!isLoggedIn) {
      setType('requireAuth');
      setModalProps({ navigation });
      setOpenModal(true);
      return false;
    }
    
    if (action) {
      action();
    }
    return true;
  };

  return { requireAuth, isLoggedIn };
}; 