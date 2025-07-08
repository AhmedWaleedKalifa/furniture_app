import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface StatusPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  style?: any;
}

const StatusPicker = ({ 
  selectedValue, 
  onValueChange, 
  options, 
  placeholder = 'Select Status',
  style 
}: StatusPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const selectedLabel = options.find(option => option.value === selectedValue)?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        className="bg-g-100 rounded-lg p-3 justify-center border border-g-200"
        style={style}
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-base text-bl">{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-w-100 rounded-lg w-4/5 max-h-1/2 overflow-hidden">
            <FlatList
              data={options}
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

export default StatusPicker;