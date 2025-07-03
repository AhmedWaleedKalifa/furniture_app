import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import useFetch from "../../services/useFetch";
import { getMyOrders } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRoleAccess } from "../../lib/useRoleAcess";

const OrdersScreen = () => {
  const { token, user, globalRefreshKey } = useAuth();
  const { hasAccess } = useRoleAccess(["client"]);
  const {
    data: orders,
    loading,
    error,
    refetch,
  } = useFetch(() => getMyOrders(token!), !!token);
  useEffect(() => {
    if (token) refetch();
  }, [globalRefreshKey]);
  if (!hasAccess) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Access Denied</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOrderAction = (orderId: string, action: string) => {
    Alert.alert(
      `${action} Order`,
      `Are you sure you want to ${action.toLowerCase()} this order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          onPress: () => {
            // Implement order action logic
            Alert.alert(
              "Success",
              `Order ${action.toLowerCase()}ed successfully!`
            );
            refetch();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white px-5 pt-8">
      <Text className="text-2xl font-bold text-bl mb-6">My Orders</Text>

      {loading && <ActivityIndicator size="large" color="#22bb22" />}
      {error && <Text className="text-red-500">{error.message}</Text>}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg shadow-md p-4 mb-4 border border-g-100">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-bl">
                Order #{item.id.substring(0, 8)}
              </Text>
              <Text
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  item.orderStatus
                )}`}
              >
                {item.orderStatus}
              </Text>
            </View>

            <Text className="text-2xl font-bold text-accent mb-2">
              ${item.totalPrice.toFixed(2)}
            </Text>

            <Text className="text-g-200 mb-3">
              Date: {new Date(item.createdAt).toLocaleDateString()}
            </Text>

            <View className="mb-3">
              <Text className="text-bl font-medium mb-2">Items:</Text>
              {item.items.map((product, index) => (
                <Text key={index} className="text-g-200 text-sm">
                  • {product.quantity}x {product.productName}
                </Text>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-g-200 mt-8">
            You have no orders.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;
