import { useAppContext } from '@/context/Context';
import React from 'react';
import { View } from 'react-native';
import Modal from 'react-native-modal';
import AddIngredientContent from './contents/addIngredient';
import CompleteFields from './contents/completeFields';
import CourseOptionsModal from './contents/courseOptions';
import EscalarPorcionesModal from './contents/escalarPorciones';
import RecalcularIngredientesModal from './contents/recalcularIngredientes';
import RegisterModal from './contents/register';
import SimpleDialog from './contents/simpleDialog';
import styles from './styles';

const CustomModal = () => {
  const { modal: { isOpenModal, setOpenModal, type, modalProps } } = useAppContext();

  const toggleModal = () => {
    setOpenModal(!isOpenModal);
  };

  return (
    <Modal
      isVisible={isOpenModal}
      onBackdropPress={toggleModal}
      backdropOpacity={0.6}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {type == "register" && <RegisterModal {...modalProps} />}
        {type == "completeFields" && <CompleteFields {...modalProps} />}
        {type == "dialog" && <SimpleDialog {...modalProps} />}
        {type == "recalcularIngredientes" && (
          <RecalcularIngredientesModal
            {...modalProps}
            onCancel={toggleModal}
            onSubmit={modalProps?.onSubmit}
          />
        )}
        {type == "escalarPorciones" && (
          <EscalarPorcionesModal
            {...modalProps}
            onCancel={toggleModal}
            onSubmit={modalProps?.onSubmit}
          />
        )}
        {type == "courseOptions" && (
          <CourseOptionsModal
            {...modalProps}
          />
        )}
        {type == "addIngredient" && (
            <AddIngredientContent
              {...modalProps}
              onCancel={toggleModal}
              onSubmit={modalProps?.onSubmit}
            />
        )}
      </View>
    </Modal>
  );
};

export default CustomModal;