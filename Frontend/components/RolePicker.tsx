import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface RolePickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}

const ROLES = [
  { label: 'Client', value: 'client' },
  { label: 'Company', value: 'company' },
  { label: 'Admin', value: 'admin' },
];

const RolePicker = ({ selectedValue, onValueChange, style }: RolePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const selectedLabel = ROLES.find(r => r.value === selectedValue)?.label || 'Select Role';

  return (
    <>
      <TouchableOpacity
        className="bg-g-100 rounded-lg p-3 justify-center border border-g-200"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-base text-bl">{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-w-100 rounded-lg w-4/5 max-h-1/2 overflow-hidden">
            <FlatList
              data={ROLES}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-4 px-5 border-b border-g-100"
                  onPress={() => handleSelect(item.value)}
                >
                  <Text className="text-lg text-bl">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default RolePicker;