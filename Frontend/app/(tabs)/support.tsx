import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import useFetch from "../../services/useFetch";
import {
  getMyTickets,
  createTicket,
  getAdminTickets,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusPicker from "../../components/admin/StatusPicker";
import { Link } from "expo-router";

const initialTicketState = {
  subject: "",
  message: "",
  category: "general",
  priority: "medium",
};

const TICKET_CATEGORIES = [
  { label: "General Inquiry", value: "general" },
  { label: "Technical Issue", value: "technical" },
  { label: "Billing Question", value: "billing" },
  { label: "Product Question", value: "product" },
];

const TICKET_PRIORITIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const SupportScreen = () => {
  const { user, token } = useAuth();

  // Conditionally choose the fetch function based on user role
  const fetchFunction =
    user?.role === "admin"
      ? () => getAdminTickets(token!)
      : () => getMyTickets(token!);

  const {
    data: tickets,
    loading,
    error,
    refetch,
  } = useFetch(fetchFunction, !!token);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialTicketState);

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [user, token]);

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.message) {
      return Alert.alert("Error", "Please provide a subject and a message.");
    }

    setIsSubmitting(true);
    try {
      await createTicket(token!, formData);
      Alert.alert("Success", "Support ticket created successfully!");
      setFormData(initialTicketState);
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-black";
      case "resolved":
        return "bg-green-500 text-white";
      case "closed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <View className="flex-1 bg-w-200 p-5 pt-16">
      <Text className="text-2xl font-bold text-bl mb-4">Support Center</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-br p-3 rounded-lg mb-6"
      >
        <Text className="text-w-100 text-center font-bold">
          Create New Ticket
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" />}
      {error && (
        <Text className="text-red-500 text-center py-4">{error.message}</Text>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/ticket/${item.id}`} asChild>
            <TouchableOpacity className="bg-w-100 p-4 rounded-lg mb-4 shadow-md">
              <View className="flex-row justify-between items-center">
                <Text
                  className="font-bold text-lg text-bl flex-1 pr-2"
                  numberOfLines={1}
                >
                  {item.subject}
                </Text>
                <Text
                  className={`font-bold px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status.replace("_", " ")}
                </Text>
              </View>
              {user?.role === "admin" && (
                <Text className="text-gray-500 mt-1">
                  From: {item.userName || "N/A"}
                </Text>
              )}
              <Text className="text-g-300 mt-2" numberOfLines={2}>
                {item.description}
              </Text>
              <Text className="text-g-300 mt-2 text-xs">Created: {item.createdAt && typeof item.createdAt === 'object' && item.createdAt._seconds
                  ? new Date(item.createdAt._seconds * 1000).toLocaleDateString()
                  : item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          // FIX: Use a ternary operator to return null instead of `false`.
          // This satisfies TypeScript's type requirements for the prop.
          !loading ? (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-center text-g-300 text-base">
                You have no support tickets.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1 }} // Ensures empty component can center
      />

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView
          className="flex-1 bg-w-200 p-5 pt-16"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text className="text-2xl font-bold text-bl mb-6">
            New Support Ticket
          </Text>
          <TextInput
            placeholder="Subject"
            value={formData.subject}
            onChangeText={(t) => setFormData((p) => ({ ...p, subject: t }))}
            className="bg-g-100 p-3 rounded-lg mb-3"
          />
          <Text className="text-bl font-semibold mb-2 mt-2">Category</Text>

          <StatusPicker
            selectedValue={formData.category}
            onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
            options={TICKET_CATEGORIES}
          />

          <TextInput
            placeholder="Please describe your issue..."
            value={formData.message}
            onChangeText={(t) => setFormData((p) => ({ ...p, message: t }))}
            className="bg-g-100 p-3 rounded-lg mb-3 h-32"
            multiline
            textAlignVertical="top"
          />
          <Text className="text-bl font-semibold mb-2 mt-2">Priority</Text>
          <StatusPicker
            selectedValue={formData.priority}
            onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}
            options={TICKET_PRIORITIES}
          />
          <TouchableOpacity
            onPress={handleCreateTicket}
            className="bg-br p-4 rounded-lg mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-w-100 text-center font-bold">
                Submit Ticket
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="bg-g-200 p-4 rounded-lg mt-2"
          >
            <Text className="text-bl text-center font-bold">Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default SupportScreen;
