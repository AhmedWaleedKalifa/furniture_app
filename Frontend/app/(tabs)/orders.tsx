import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import useFetch from "../../services/useFetch";
import { getMyOrders } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useRoleAccess } from "../../lib/useRoleAcess";
import { Link } from "expo-router";

const OrdersScreen = () => {
  const { token, globalRefreshKey } = useAuth();
  const { hasAccess } = useRoleAccess(["client"]);
  const {
    data: orders,
    loading,
    error,
    refetch,
  } = useFetch(() => getMyOrders(token!), !!token);

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [globalRefreshKey, token]);

  if (!hasAccess) {
    return (
      <View className="flex-1 justify-center items-center bg-w-200 p-5">
        <Text className="text-lg text-red-500 text-center">
          Access Denied. This page is for clients only.
        </Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-500 text-w-100";
      case "shipped":
        return "bg-yellow-500 text-bl";
      case "delivered":
        return "bg-green-500 text-w-100";
      case "cancelled":
        return "bg-red-500 text-w-100";
      default:
        return "bg-g-200 text-bl";
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <Link href={`/order/${item.id}`} asChild>
      <TouchableOpacity className="bg-w-100 p-4 rounded-lg mb-4 shadow-md border border-g-100">
        <View className="flex-row justify-between items-center">
          <Text
            className="font-bold text-lg text-bl flex-1 pr-2"
            numberOfLines={1}
          >
            Order #{item.id.substring(0, 8)}
          </Text>
          <Text
            className={`font-bold px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(
              item.orderStatus
            )}`}
          >
            {item.orderStatus}
          </Text>
        </View>

        <Text className="text-xl font-bold text-br mt-2">
          ${item.totalPrice.toFixed(2)}
        </Text>

        <Text className="text-g-300 mt-2" numberOfLines={2}>
          Items: {item.items.map((p: any) => `${p.quantity}x ${p.productName}`).join(', ')}
        </Text>

        <Text className="text-g-200 mt-2 text-xs">
          Ordered on: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 bg-w-200 p-5 pt-16">
      <Text className="text-2xl font-bold text-bl mb-4">My Orders</Text>

      {loading && <ActivityIndicator size="large" color="#7df9ff" />}
      {error && (
        <Text className="text-red-500 text-center py-4">{error.message}</Text>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-center text-g-300 text-base">
                You have no orders yet.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;