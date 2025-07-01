import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import useFetch from '@/services/useFetch';
import { getCompanyProducts, createProduct } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { icons } from '@/constants/icons';
import { useCompanyOnly } from '@/lib/useRoleAcess';

const initialFormState = {
    name: '',
    description: '',
    category: 'Sofa',
    price: '',
    modelUrl: '',
    thumbnailUrl: '',
    dimensions: { width: '', height: '', depth: '', unit: 'cm' }
};

const CompanyDashboard = () => {
    const { token } = useAuth();
    const { hasAccess, isLoading } = useCompanyOnly();    const { data: products, loading, error, refetch } = useFetch(() => getCompanyProducts(token!), !!token);
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormState);

    const handleCreateProduct = async () => {
        if (!formData.name || !formData.description || !formData.price || !formData.thumbnailUrl) {
            return Alert.alert('Error', 'Please fill all required fields.');
        }

        setIsSubmitting(true);
        try {
            await createProduct(token!, {
                ...formData,
                price: parseFloat(formData.price),
                dimensions: {
                    width: parseFloat(formData.dimensions.width) || 0,
                    height: parseFloat(formData.dimensions.height) || 0,
                    depth: parseFloat(formData.dimensions.depth) || 0,
                    unit: formData.dimensions.unit,
                }
            });
            Alert.alert('Success', 'Product submitted for approval!');
            setFormData(initialFormState);
            setModalVisible(false);
            refetch();
        } catch (err: any) {
            Alert.alert('Error', err.message || "Failed to create product.");
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#22bb22" />
          </View>
        );
      }
    
      if (!hasAccess) {
        return (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-red-500">Company Access Required</Text>
          </View>
        );
      }
    return (
        <View className="flex-1 bg-w-200 p-5 pt-16">
            
            <Text className="text-2xl font-bold text-bl mb-4">Company Dashboard</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-br p-3 rounded-lg mb-6">
                <Text className="text-w-100 text-center font-bold">Add New Product</Text>
            </TouchableOpacity>
            
            {loading && <ActivityIndicator size="large" />}
            {error && <Text className="text-red-500">{error.message}</Text>}
            
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-w-100 p-4 rounded-lg mb-4 shadow-md flex-row justify-between items-center">
                        <View>
                            <Text className="font-bold text-lg text-bl">{item.name}</Text>
                            <Text className="text-g-300">${item.price}</Text>
                        </View>
                        <Text className={`font-bold px-3 py-1 rounded-full ${item.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.isApproved ? 'Approved' : 'Pending'}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-g-300 mt-10">You have not added any products yet.</Text>}
            />

            {/* Add Product Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ScrollView className="flex-1 bg-w-200 p-5 pt-16">
                    <Text className="text-2xl font-bold text-bl mb-6">New Product</Text>
                    <TextInput placeholder="Name" value={formData.name} onChangeText={t => setFormData(p => ({...p, name: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="Description" value={formData.description} onChangeText={t => setFormData(p => ({...p, description: t}))} className="bg-g-100 p-3 rounded-lg mb-3 h-24" multiline />
                    <TextInput placeholder="Price" value={formData.price} onChangeText={t => setFormData(p => ({...p, price: t}))} className="bg-g-100 p-3 rounded-lg mb-3" keyboardType="numeric" />
                    <TextInput placeholder="Category" value={formData.category} onChangeText={t => setFormData(p => ({...p, category: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="Thumbnail URL" value={formData.thumbnailUrl} onChangeText={t => setFormData(p => ({...p, thumbnailUrl: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="3D Model URL" value={formData.modelUrl} onChangeText={t => setFormData(p => ({...p, modelUrl: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    
                    <TouchableOpacity onPress={handleCreateProduct} className="bg-br p-4 rounded-lg mt-4" disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-w-100 text-center font-bold">Submit for Approval</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-g-200 p-4 rounded-lg mt-2">
                        <Text className="text-w-100 text-center font-bold">Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </View>
    );
};

export default CompanyDashboard;