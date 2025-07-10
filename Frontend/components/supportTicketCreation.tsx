import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createTicket } from '../services/api';
import RolePicker from '@/components/RolePicker';

const TICKET_CATEGORIES = [
    { label: "Bug Report", value: "BUG_REPORT" },
    { label: "Feature Request", value: "FEATURE_REQUEST" },
    { label: "Question", value: "QUESTION" },
    { label: "Furniture Suggestion", value: "FURNITURE_SUGGESTION" },
    { label: "Content Report", value: "CONTENT_REPORT" },
  ];
export default function CreateTicketScreen() {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: TICKET_CATEGORIES[0].value,
    priority: "medium",
  });
  const handleSubmit = async () => {
    try {
      await createTicket(token, { title, description, category });
      Alert.alert('Success', 'Ticket submitted!');
      setTitle(''); setDescription('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View>
      <Text>Title</Text>
      <TextInput value={title} onChangeText={setTitle} />
      <Text>Description</Text>
      <TextInput value={description} onChangeText={setDescription} multiline />
      <Text className="mb-1 text-bl font-semibold">Category</Text>
<RolePicker
  selectedValue={formData.category}
  onValueChange={(value) =>
    setFormData((prev) => ({ ...prev, category: value }))
}
  options={TICKET_CATEGORIES}
/>
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
