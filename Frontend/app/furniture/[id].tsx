import { ScrollView, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fetchFurnitureDetails, createOrder, approveProduct, rejectProduct } from "@/services/api";
import useFetch from "@/services/useFetch";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import {Product, ProductDetails} from "@/types/index"

const FurnitureDetails = () => {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;
  
  const { data: furniture, loading, refetch } = useFetch<ProductDetails>(
    () => fetchFurnitureDetails(productId!),
    !!productId
  );
  // FIX: Get triggerGlobalRefresh from AuthContext
  const { wishlist, addItemToWishlist, removeItemFromWishlist, user, token, triggerGlobalRefresh } = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // ... (handleWishlistToggle and handleOrderProduct remain the same) ...
  const handleWishlistToggle = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!furniture) return;

    if (wishlist.some(item => item.productId === furniture.id)) {
      removeItemFromWishlist(furniture.id);
    } else {
      addItemToWishlist(furniture);
    }
  };

  const handleOrderProduct = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!furniture?.isApproved) {
      Alert.alert("Not Available", "This product is not yet available for purchase.");
      return;
    }
    Alert.alert(
      'Confirm Order',
      `Are you sure you want to order ${furniture?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Order',
          onPress: async () => {
            if (!token || !furniture) return;
            setIsOrdering(true);
            try {
              const orderData = {
                items: [{ productId: furniture.id, quantity: 1 }],
                shippingAddress: {
                  street: "123 Furnish St",
                  city: "Design City",
                  country: "Aesthetic Republic",
                  postalCode: "12345"
                },
                paymentMethod: "credit_card"
              };
              await createOrder(token, orderData);
              triggerGlobalRefresh();
              Alert.alert('Success', 'Order placed successfully!');
              router.push('/(tabs)/orders');
            } catch (error: any) {
              Alert.alert('Order Failed', error.message || 'Could not place order.');
            } finally {
              setIsOrdering(false);
            }
          }
        }
      ]
    );
  };
  
  // FIX: Admin actions
  const handleApprove = async () => {
    if (!token || !furniture) return;
    setIsActionLoading(true);
    try {
      await approveProduct(token, furniture.id);
      Alert.alert("Success", "Product has been approved.");
      triggerGlobalRefresh(); // Refresh lists across the app
      refetch(); // Refetch details on this page
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to approve product.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!token || !furniture) return;
    Alert.prompt(
        "Reject Product",
        "Please provide a reason for rejection.",
        async (reason) => {
            if (reason) {
                setIsActionLoading(true);
                try {
                    await rejectProduct(token, furniture.id, reason);
                    Alert.alert("Success", "Product has been rejected.");
                    triggerGlobalRefresh(); // Refresh lists across the app
                    router.back(); // Go back since it's no longer pending
                } catch (error: any) {
                    Alert.alert("Error", error.message || "Failed to reject product.");
                } finally {
                    setIsActionLoading(false);
                }
            }
        }
    );
  };

  const renderRoleSpecificActions = () => {
    if (!user || !furniture) return null;

    switch (user.role) {
      case 'client':
        const isWishlisted = (wishlist || []).some(item => item.productId === furniture.id);
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
              className={`flex-1 py-4 rounded-lg items-center ${
                  !furniture.isApproved || isOrdering ? 'bg-gray-400' : 'bg-bl'
              }`}
              disabled={!furniture.isApproved || isOrdering}
            >
              {isOrdering ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">
                  {furniture.isApproved ? "Order Now" : "Unavailable"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'company':
        if (user.uid === furniture.companyId) {
          return (
            <View className="px-6 mt-6">
              <TouchableOpacity 
                onPress={() => Alert.alert("Edit Product", "Edit functionality will be implemented here.")}
                className="bg-accent py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Edit Product</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return null;

      case 'admin':
        if (!furniture.isApproved) {
            return (
                <View className="flex-row gap-3 px-6 mt-6">
                    <TouchableOpacity onPress={handleApprove} disabled={isActionLoading} className="flex-1 bg-green-500 py-4 rounded-lg items-center">
                      {isActionLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Approve</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleReject} disabled={isActionLoading} className="flex-1 bg-red-500 py-4 rounded-lg items-center">
                      {isActionLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Reject</Text>}
                    </TouchableOpacity>
                </View>
            );
        }
        return null; 

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (!furniture) {
    return (
        <View className="flex-1 justify-center items-center p-5">
            <Text className="text-lg text-g-300">Product not found.</Text>
            <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-g-100 p-3 rounded-lg">
                <Text className="text-bl font-semibold">Go Back</Text>
            </TouchableOpacity>
        </View>
    )
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
        
        <View className="mb-4 p-3 bg-gray-100 rounded-lg">
            <Text className={`font-bold ${furniture?.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
            Status: {furniture?.isApproved ? 'Available for Purchase' : 'Pending Approval'}
            </Text>
        </View>
        
        <Text className="text-g-200 mb-4">{furniture?.description}</Text>
        
        <Text className="text-3xl font-bold text-accent mb-4">${furniture?.price}</Text>
        
        <View className="mb-4">
          <Text className="text-lg font-semibold text-bl mb-2">Category</Text>
          <Text className="text-g-200">{furniture?.category}</Text>
        </View>

        {furniture?.dimensions && (
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
        )}
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