import { ScrollView, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fetchFurnitureDetails } from "@/services/api";
import useFetch from "@/services/useFetch";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";

const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: furniture, loading } = useFetch(() => fetchFurnitureDetails(id as string));
  const { wishlist, addItemToWishlist, removeItemFromWishlist, user } = useAuth();

  const isWishlisted = (wishlist || []).some(item => item.productId === furniture?.id);

  const handleWishlistToggle = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!furniture) return;

    if (isWishlisted) {
      removeItemFromWishlist(furniture.id);
    } else {
      const productSummary: Product = {
        id: furniture.id,
        name: furniture.name,
        price: furniture.price,
        thumbnailUrl: furniture.thumbnailUrl,
        description: furniture.description,
        category: furniture.category,
        isApproved: furniture.isApproved,
      };
      addItemToWishlist(productSummary);
    }
  };

  const handleOrderProduct = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Navigate to order screen or show order modal
    Alert.alert(
      'Order Product',
      `Would you like to order ${furniture?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Order', 
          onPress: () => {
            // Implement order logic here
            Alert.alert('Success', 'Order placed successfully!');
          }
        }
      ]
    );
  };

  const renderRoleSpecificActions = () => {
    if (!user || !furniture) return null;

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
        // Show edit/manage options if this is the company's product
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
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Image
        source={{ uri: furniture?.thumbnailUrl }}
        className="w-full h-64"
        resizeMode="cover"
      />
      
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-bl mb-2">{furniture?.name}</Text>
        
        {/* Role-specific info display */}
        {user?.role === 'admin' && (
          <View className="mb-4 p-3 bg-gray-100 rounded-lg">
            <Text className="text-sm text-gray-600">
              Status: {furniture?.isApproved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        )}
        
        <Text className="text-g-200 mb-4">{furniture?.description}</Text>
        
        <Text className="text-3xl font-bold text-accent mb-4">${furniture?.price}</Text>
        
        <View className="mb-4">
          <Text className="text-lg font-semibold text-bl mb-2">Category</Text>
          <Text className="text-g-200">{furniture?.category}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-bl mb-2">Dimensions</Text>
          <View className="flex-row justify-between">
            <Text className="text-g-200">
              Width: {furniture?.dimensions.width} {furniture?.dimensions.unit}
            </Text>
            <Text className="text-g-200">
              Height: {furniture?.dimensions.height} {furniture?.dimensions.unit}
            </Text>
            <Text className="text-g-200">
              Depth: {furniture?.dimensions.depth} {furniture?.dimensions.unit}
            </Text>
          </View>
        </View>
      </View>

      {/* Role-specific actions */}
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
