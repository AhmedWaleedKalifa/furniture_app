import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import React, { useState } from 'react';
import useFetch from '@/services/useFetch';
import { getMyTickets, createTicket } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const initialTicketState = { subject: '', message: '', category: 'general', priority: 'medium' };

const SupportScreen = () => {
    const { token } = useAuth();
    const { data: tickets, loading, error, refetch } = useFetch(() => getMyTickets(token!), !!token);
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialTicketState);

    const handleCreateTicket = async () => {
        if (!formData.subject || !formData.message) {
            return Alert.alert('Error', 'Please provide a subject and a message.');
        }

        setIsSubmitting(true);
        try {
            await createTicket(token!, formData);
            Alert.alert('Success', 'Support ticket created successfully!');
            setFormData(initialTicketState);
            setModalVisible(false);
            refetch();
        } catch (err: any) {
            Alert.alert('Error', err.message || "Failed to create ticket.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <View className="flex-1 bg-w-200 p-5 pt-16">
            <Text className="text-2xl font-bold text-bl mb-4">Support Center</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-br p-3 rounded-lg mb-6">
                <Text className="text-w-100 text-center font-bold">Create New Ticket</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" />}
            {error && <Text className="text-red-500">{error.message}</Text>}

            <FlatList
                data={tickets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-w-100 p-4 rounded-lg mb-4 shadow-md">
                        <View className="flex-row justify-between items-center">
                            <Text className="font-bold text-lg text-bl flex-1 pr-2">{item.subject}</Text>
                            <Text className={`font-bold px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(item.status)}`}>
                                {item.status.replace('_', ' ')}
                            </Text>
                        </View>
                        <Text className="text-g-300 mt-2">{item.message}</Text>
                        <Text className="text-g-300 mt-2 text-xs">Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-g-300 mt-10">You have no support tickets.</Text>}
            />

            {/* Create Ticket Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ScrollView className="flex-1 bg-w-200 p-5 pt-16">
                    <Text className="text-2xl font-bold text-bl mb-6">New Support Ticket</Text>
                    <TextInput placeholder="Subject" value={formData.subject} onChangeText={t => setFormData(p => ({ ...p, subject: t }))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="Please describe your issue..." value={formData.message} onChangeText={t => setFormData(p => ({ ...p, message: t }))} className="bg-g-100 p-3 rounded-lg mb-3 h-32" multiline />
                    
                    <TouchableOpacity onPress={handleCreateTicket} className="bg-br p-4 rounded-lg mt-4" disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-w-100 text-center font-bold">Submit Ticket</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-g-200 p-4 rounded-lg mt-2">
                        <Text className="text-w-100 text-center font-bold">Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </View>
    );
};

export default SupportScreen;