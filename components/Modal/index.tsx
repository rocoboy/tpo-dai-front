import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import styles from './styles';
import { useAppContext } from '@/context/Context';
import RegisterModal from './contents/register';
import CompleteFields from './contents/completeFields';
import SimpleDialog from './contents/simpleDialog';
import RecalcularIngredientesModal from './contents/recalcularIngredientes';
import EscalarPorcionesModal from './contents/escalarPorciones';
import CourseOptionsModal from './contents/courseOptions';
import AddIngredientContent from './contents/addIngredient';

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
        {type == "register" && <RegisterModal/>}
        {type == "completeFields" && <CompleteFields/>}
        {type == "dialog" && <SimpleDialog/>}
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