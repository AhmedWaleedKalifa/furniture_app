// furniture_app (Copy)/Frontend/app/(tabs)/company_dashboard.tsx

import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import React, { useState, useMemo, useEffect } from 'react';
import useFetch from '../../services/useFetch';
import { getCompanyProducts, createProduct } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCompanyOnly } from '../../lib/useRoleAcess';
import * as ImagePicker from 'expo-image-picker';

const initialFormState = {
    name: '',
    description: '',
    category: 'Sofa',
    price: '',
    modelUrl: '',
    dimensions: { width: '', height: '', depth: '', unit: 'cm' },
    customizable: { color: true, material: false },
    tags: '',
};

const CompanyDashboard = () => {
    const { token, user } = useAuth();
    const { hasAccess, isLoading: roleIsLoading } = useCompanyOnly();    
    const { data: allProducts, loading: fetchIsLoading, error, refetch } = useFetch(() => getCompanyProducts(token!), !!token);
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const products = useMemo(() => {
        if (!allProducts || !user) return [];
        return allProducts.filter(product => product.companyId === user.uid);
    }, [allProducts, user]);

    useEffect(() => {
        if (!isModalVisible) {
            setSelectedImage(null);
            setFormData(initialFormState);
        }
    }, [isModalVisible]);
        
    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to allow access to your photos to upload an image.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        
        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };
         
    const handleCreateProduct = async () => {
        if (!token) {
            return Alert.alert('Authentication Error', 'You are not logged in. Please log in again.');
        }

        if (!formData.name || !formData.description || !formData.price || !formData.modelUrl || !selectedImage) {
            return Alert.alert('Error', 'Please fill all fields, including the 3D Model URL, and select a thumbnail image.');
        }

        const price = parseFloat(formData.price);
        const width = parseFloat(formData.dimensions.width);
        const height = parseFloat(formData.dimensions.height);
        const depth = parseFloat(formData.dimensions.depth);

        if (isNaN(price) || isNaN(width) || isNaN(height) || isNaN(depth)) {
            return Alert.alert('Validation Error', 'Price and dimensions must be valid numbers.');
        }

        setIsSubmitting(true);
        try {
            // This is the key: creating a real FormData object
            const productFormData = new FormData();

            // Append all fields
            productFormData.append('name', formData.name);
            productFormData.append('description', formData.description);
            productFormData.append('category', formData.category);
            productFormData.append('modelUrl', formData.modelUrl);
            productFormData.append('price', String(price));
            
            const dimensions = { width, height, depth, unit: formData.dimensions.unit };
            productFormData.append('dimensions', JSON.stringify(dimensions));
            
            productFormData.append('customizable', JSON.stringify(formData.customizable));
            
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            productFormData.append('tags', JSON.stringify(tagsArray));
            
            const uriParts = selectedImage.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            const file = {
                uri: selectedImage.uri,
                name: `thumbnail.${fileType}`,
                type: `image/${fileType}`,
            } as any;
            productFormData.append('thumbnail', file);
            
            console.log(productFormData)
            await createProduct(token, productFormData);
            Alert.alert('Success', 'Product submitted for approval!');
            setModalVisible(false);
            refetch();
        } catch (err: any) {
            Alert.alert('Error Creating Product', err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isLoading = roleIsLoading || fetchIsLoading;

    if (isLoading) {
        return (
          <View className="flex-1 justify-center items-center bg-w-200">
            <ActivityIndicator size="large" color="#625043" />
          </View>
        );
      }
    
      if (!hasAccess) {
        return (
          <View className="flex-1 justify-center items-center bg-w-200">
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
            
            {fetchIsLoading && <ActivityIndicator size="large" />}
            {error && <Text className="text-red-500">{error.message}</Text>}
            
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-w-100 p-4 rounded-lg mb-4 shadow-md flex-row justify-between items-center">
                        <View className="flex-1 pr-2">
                            <Text className="font-bold text-lg text-bl" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-g-300">${item.price}</Text>
                        </View>
                        <Text className={`font-bold px-3 py-1 rounded-full text-xs ${item.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.isApproved ? 'Approved' : 'Pending'}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-g-300 mt-10">You have not added any products yet.</Text>}
            />

            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ScrollView className="flex-1 bg-w-200 p-5 pt-16" contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text className="text-2xl font-bold text-bl mb-6">New Product</Text>
                    <TextInput placeholder="Name" value={formData.name} onChangeText={t => setFormData(p => ({...p, name: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="Description" value={formData.description} onChangeText={t => setFormData(p => ({...p, description: t}))} className="bg-g-100 p-3 rounded-lg mb-3 h-24" multiline />
                    <TextInput placeholder="Price" value={formData.price} onChangeText={t => setFormData(p => ({...p, price: t}))} className="bg-g-100 p-3 rounded-lg mb-3" keyboardType="numeric" />
                    <TextInput placeholder="Category" value={formData.category} onChangeText={t => setFormData(p => ({...p, category: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    <TextInput placeholder="Tags (e.g. modern, cozy)" value={formData.tags} onChangeText={t => setFormData(p => ({...p, tags: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />

                    <Text className="text-bl font-semibold mt-4 mb-2">Thumbnail Image</Text>
                    <TouchableOpacity onPress={handleImagePick} className="bg-g-100 p-3 rounded-lg mb-3 items-center">
                        <Text className="text-bl font-semibold">
                            {selectedImage ? 'Change Image' : 'Select Image'}
                        </Text>
                    </TouchableOpacity>
                    {selectedImage && <Image source={{ uri: selectedImage.uri }} className="w-full h-48 rounded-lg mb-3" resizeMode="cover" />}

                    <TextInput placeholder="3D Model URL" value={formData.modelUrl} onChangeText={t => setFormData(p => ({...p, modelUrl: t}))} className="bg-g-100 p-3 rounded-lg mb-3" />
                    
                    <Text className="text-bl font-semibold mt-4 mb-2">Dimensions (cm)</Text>
                    <View className="flex-row gap-x-2">
                        <TextInput 
                            placeholder="Width" 
                            value={formData.dimensions.width} 
                            onChangeText={t => setFormData(p => ({...p, dimensions: {...p.dimensions, width: t}}))} 
                            className="bg-g-100 p-3 rounded-lg mb-3 flex-1" 
                            keyboardType="numeric" 
                        />
                        <TextInput 
                            placeholder="Height" 
                            value={formData.dimensions.height} 
                            onChangeText={t => setFormData(p => ({...p, dimensions: {...p.dimensions, height: t}}))} 
                            className="bg-g-100 p-3 rounded-lg mb-3 flex-1" 
                            keyboardType="numeric" 
                        />
                        <TextInput 
                            placeholder="Depth" 
                            value={formData.dimensions.depth} 
                            onChangeText={t => setFormData(p => ({...p, dimensions: {...p.dimensions, depth: t}}))} 
                            className="bg-g-100 p-3 rounded-lg mb-3 flex-1" 
                            keyboardType="numeric" 
                        />
                    </View>
                    
                    <TouchableOpacity onPress={handleCreateProduct} className="bg-br p-4 rounded-lg mt-4" disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-w-100 text-center font-bold">Submit for Approval</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-g-200 p-4 rounded-lg mt-2 mb-10">
                        <Text className="text-bl text-center font-bold">Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </View>
    );
};

export default CompanyDashboard;