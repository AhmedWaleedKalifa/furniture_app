// Frontend/components/admin/StatusPicker.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';

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
        style={[styles.pickerButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>{selectedLabel}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxHeight: '50%',
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
});

export default StatusPicker;
