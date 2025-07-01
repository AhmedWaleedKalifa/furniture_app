import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchFurniture } from '@/services/api';
import useFetch from '@/services/useFetch';
import Card from '@/components/Card';
import { icons } from '@/constants/icons';

export default function Index() {
  const { user } = useAuth();
  const { data: furniture, loading, error } = useFetch(fetchFurniture);

  const renderRoleSpecificActions = () => {
    switch (user?.role) {
      case 'client':
        return (
          <View className="flex-row justify-between px-5 mt-6">
            <TouchableOpacity
              className="bg-accent rounded-lg p-4 flex-1 mr-2 items-center"
              onPress={() => router.push('/search')}
            >
              <Image source={icons.search} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-bl rounded-lg p-4 flex-1 ml-2 items-center"
              onPress={() => router.push('/saved')}
            >
              <Image source={icons.save} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Wishlist</Text>
            </TouchableOpacity>
          </View>
        );

      case 'company':
        return (
          <View className="flex-row justify-between px-5 mt-6">
            <TouchableOpacity
              className="bg-accent rounded-lg p-4 flex-1 mr-2 items-center"
              onPress={() => router.push('/company_dashboard')}
            >
              <Image source={icons.logo} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-bl rounded-lg p-4 flex-1 ml-2 items-center"
              onPress={() => router.push('/orders')}
            >
              <Image source={icons.star} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Orders</Text>
            </TouchableOpacity>
          </View>
        );

      case 'admin':
        return (
          <View className="flex-row justify-between px-5 mt-6">
            <TouchableOpacity
              className="bg-accent rounded-lg p-4 flex-1 mr-2 items-center"
              onPress={() => router.push('/admin_dashboard')}
            >
              <Image source={icons.logo} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Admin Panel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-bl rounded-lg p-4 flex-1 ml-2 items-center"
              onPress={() => router.push('/support')}
            >
              <Image source={icons.star} className="w-6 h-6" tintColor="white" />
              <Text className="text-white font-medium mt-2">Support</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'client':
        return 'Discover furniture in AR';
      case 'company':
        return 'Manage your furniture products';
      case 'admin':
        return 'System administration panel';
      default:
        return 'Welcome to Furnish-AR';
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-8">
        <Text className="text-2xl font-bold text-bl">
          Welcome, {user?.displayName}!
        </Text>
        <Text className="text-g-200 mt-1">
          {getWelcomeMessage()}
        </Text>
      </View>

      {/* Role-specific actions */}
      {renderRoleSpecificActions()}

      {/* Furniture List - Show to all roles but with different purposes */}
      <View className="px-5 mt-8">
        <Text className="text-lg font-semibold text-bl mb-4">
          {user?.role === 'admin' ? 'All Products' : 
           user?.role === 'company' ? 'Latest Products' : 'Furniture'}
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#22bb22" />
        ) : error ? (
          <Text className="text-red-500">Error: {error.message}</Text>
        ) : (
          <FlatList
            data={furniture}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 16,
              marginVertical: 8
            }}
            scrollEnabled={false}
            renderItem={({ item }) => <Card {...item} />}
          />
        )}
      </View>
    </ScrollView>
  );
}
