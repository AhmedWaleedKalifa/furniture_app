import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect } from 'react';
import useFetch from '@/services/useFetch';
import { getPendingProducts, approveProduct } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useAdminOnly } from '@/lib/useRoleAcess';

const AdminDashboard = () => {
  const { token } = useAuth();
  const { hasAccess, isLoading } = useAdminOnly();
  const { data: products, loading, error, refetch } = useFetch(() => getPendingProducts(token!), !!token && hasAccess);

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
        <Text className="text-lg text-red-500">Admin Access Required</Text>
      </View>
    );
  }

  const handleApprove = async (productId: string) => {
    try {
      await approveProduct(token!, productId);
      Alert.alert("Success", "Product approved!");
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to approve product.");
    }
  };

  return (
    <View className="flex-1 bg-white px-5 pt-8">
      <Text className="text-2xl font-bold text-bl mb-6">Admin Dashboard</Text>
      <Text className="text-lg font-semibold text-bl mb-4">Pending Products</Text>

      {loading && <ActivityIndicator size="large" color="#22bb22" />}
      {error && <Text className="text-red-500">{error.message}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg shadow-md p-4 mb-4 border border-g-100">
            <Text className="text-lg font-semibold text-bl">{item.name}</Text>
            <Text className="text-g-200 mb-2">{item.category}</Text>
            <Text className="text-accent font-bold text-xl mb-3">${item.price}</Text>
            
            <TouchableOpacity
              onPress={() => handleApprove(item.id)}
              className="bg-green-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Approve</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text className="text-center text-g-200 mt-8">No pending products.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AdminDashboard;
