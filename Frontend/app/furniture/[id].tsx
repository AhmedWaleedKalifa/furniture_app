import { ScrollView, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fetchFurnitureDetails } from "@/services/api";
import useFetch from "@/services/useFetch";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { Product, ProductDetails } from "@/types/index";

const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  // Ensure we are working with a string, as useLocalSearchParams can return an array.
  const productId = Array.isArray(id) ? id[0] : id;
  
  // Conditionally fetch only when productId is available.
  const { data: furniture, loading, error } = useFetch<ProductDetails>(
    () => fetchFurnitureDetails(productId!),
    !!productId
  );

  const { wishlist, addItemToWishlist, removeItemFromWishlist, user } = useAuth();

  const handleWishlistToggle = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!furniture) return;

    const isWishlisted = wishlist.some(item => item.productId === furniture.id);

    if (isWishlisted) {
      removeItemFromWishlist(furniture.id);
    } else {
      // The Product type is a subset of ProductDetails, so this is safe.
      addItemToWishlist(furniture);
    }
  };

  const handleOrderProduct = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    Alert.alert(
      'Order Product',
      `Would you like to order ${furniture?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Order', 
          onPress: () => Alert.alert('Success', 'Order placed successfully!')
        }
      ]
    );
  };

  const renderRoleSpecificActions = () => {
    if (!user || !furniture) return null;
    const isWishlisted = wishlist.some(item => item.productId === furniture.id);

    switch (user.role) {
      case 'client':
        return (
          <View className="flex-row gap-3 px-6 mt-6">
            <TouchableOpacity
              onPress={handleWishlistToggle}
              className={`flex-1 py-4 rounded-lg items-center ${
                isWishlisted ? 'bg-red-500' : 'bg-accent'
              }`}
            >
              <Text className="text-white font-semibold">
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleOrderProduct}
              className="flex-1 bg-bl py-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Order Now</Text>
            </TouchableOpacity>
          </View>
        );
      case 'company':
        return (
          <View className="px-6 mt-6">
            <TouchableOpacity className="bg-accent py-4 rounded-lg items-center">
              <Text className="text-white font-semibold">Edit Product</Text>
            </TouchableOpacity>
          </View>
        );
      case 'admin':
        return (
          <View className="flex-row gap-3 px-6 mt-6">
            <TouchableOpacity className="flex-1 bg-green-500 py-4 rounded-lg items-center">
              <Text className="text-white font-semibold">Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-1 bg-red-500 py-4 rounded-lg items-center">
              <Text className="text-white font-semibold">Reject</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#65B3B5" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Text className="text-lg text-red-500 font-bold">Something went wrong</Text>
        <Text className="text-center text-gray-600 mt-2">{error.message}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-gray-200 py-3 px-6 rounded-lg">
            <Text className="text-bl font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!furniture) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <Text className="text-lg text-gray-600">Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-gray-200 py-3 px-6 rounded-lg">
            <Text className="text-bl font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Image
        source={{ uri: furniture.thumbnailUrl }}
        className="w-full h-64"
        resizeMode="cover"
      />
      
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-bl mb-2">{furniture.name}</Text>
        
        {user?.role === 'admin' && (
          <View className="mb-4 p-3 bg-gray-100 rounded-lg">
            <Text className="text-sm text-gray-600">
              Status: {furniture.isApproved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        )}
        
        <Text className="text-g-200 mb-4">{furniture.description}</Text>
        <Text className="text-3xl font-bold text-accent mb-4">${furniture.price}</Text>
        
        <View className="mb-4">
          <Text className="text-lg font-semibold text-bl mb-2">Category</Text>
          <Text className="text-g-200">{furniture.category}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-bl mb-2">Dimensions</Text>
          <View className="flex-row justify-between">
            <Text className="text-g-200">
              Width: {furniture.dimensions.width} {furniture.dimensions.unit}
            </Text>
            <Text className="text-g-200">
              Height: {furniture.dimensions.height} {furniture.dimensions.unit}
            </Text>
            <Text className="text-g-200">
              Depth: {furniture.dimensions.depth} {furniture.dimensions.unit}
            </Text>
          </View>
        </View>
      </View>

      {renderRoleSpecificActions()}

      <TouchableOpacity
        onPress={() => router.back()}
        className="mx-6 mb-6 bg-gray-200 py-4 rounded-lg items-center"
      >
        <Text className="text-bl font-semibold">Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FurnitureDetails;