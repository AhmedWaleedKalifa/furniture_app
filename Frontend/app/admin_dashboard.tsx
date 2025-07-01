import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect } from 'react';
import useFetch from '@/services/useFetch';
import { getPendingProducts, approveProduct } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
    const { token } = useAuth();
    const { data: products, loading, error, refetch } = useFetch(() => getPendingProducts(token!), !!token);

    const handleApprove = async (productId: string) => {
        try {
            await approveProduct(token!, productId);
            Alert.alert("Success", "Product approved!");
            refetch(); // Refresh the list
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to approve product.");
        }
    };

    return (
        <View className="flex-1 bg-w-200 p-5 pt-16">
            <Text className="text-2xl font-bold text-bl mb-6">Pending Products</Text>
            {loading && <ActivityIndicator size="large" />}
            {error && <Text className="text-red-500">{error.message}</Text>}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-w-100 p-4 rounded-lg mb-4 shadow-md">
                        <Text className="font-bold text-lg">{item.name}</Text>
                        <Text className="text-g-300">{item.category}</Text>
                        <TouchableOpacity 
                            onPress={() => handleApprove(item.id)}
                            className="bg-green-500 p-3 rounded-lg mt-4"
                        >
                            <Text className="text-w-100 text-center font-bold">Approve</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-g-300">No pending products.</Text>}
            />
        </View>
    );
};

export default AdminDashboard;