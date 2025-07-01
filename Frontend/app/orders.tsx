import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React from 'react';
import useFetch from '@/services/useFetch';
import { getMyOrders } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const OrdersScreen = () => {
    const { token } = useAuth();
    const { data: orders, loading, error } = useFetch(() => getMyOrders(token!), !!token);

    return (
        <View className="flex-1 bg-w-200 p-5 pt-16">
            <Text className="text-2xl font-bold text-bl mb-6">My Orders</Text>
            {loading && <ActivityIndicator size="large" />}
            {error && <Text className="text-red-500">{error.message}</Text>}
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-w-100 p-4 rounded-lg mb-4 shadow-md">
                        <View className="flex-row justify-between">
                            <Text className="font-bold text-lg">Order #{item.id.substring(0, 8)}</Text>
                            <Text className="font-bold text-lg">${item.totalPrice.toFixed(2)}</Text>
                        </View>
                        <Text className="text-g-300 mt-2">Status: <Text className="capitalize font-semibold">{item.orderStatus}</Text></Text>
                        <Text className="text-g-300">Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
                        <View className="mt-2">
                            {item.items.map(product => (
                                <Text key={product.productId} className="text-bl">- {product.quantity}x {product.productName}</Text>
                            ))}
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text className="text-center text-g-300">You have no orders.</Text>}
            />
        </View>
    );
};

export default OrdersScreen;