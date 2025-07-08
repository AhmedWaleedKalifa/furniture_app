import { Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { icons } from '@/constants/icons';

const Saved = () => {
  const { wishlist, isLoading, user, removeItemFromWishlist } = useAuth();

  if (isLoading) {
    return <View className='flex-1 justify-center items-center bg-w-200'><ActivityIndicator size="large" color="#7df9ff"/></View>;
  }

  if (!user) {
    return (
      <View className="flex-1 bg-w-200 justify-center items-center px-5 gap-y-4">
        <Image source={icons.save} className="w-24 h-24 mb-4" resizeMode="contain" tintColor="#625043" />
        <Text className="text-xl text-bl font-bold text-center">Your Wishlist is Empty</Text>
        <Text className="text-g-300 text-center mb-6">Log in to save your favorite items and see them here.</Text>
        <TouchableOpacity onPress={() => router.push('/login')} className="w-full bg-br rounded-lg h-14 justify-center items-center">
            <Text className="text-w-100 font-bold text-base">Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className='bg-w-200 flex-1 px-5 pt-16'>
      <Text className="text-2xl font-bold text-bl mb-6">My Wishlist</Text>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <Link href={`/furniture/${item.productId}`} asChild>
            <TouchableOpacity className="flex-row items-center bg-w-100 rounded-lg p-3 mb-4 shadow-md">
              {/* FIX: Use flattened properties from the WishlistItem interface */}
              <Image source={{ uri: item.productImage }} className="w-20 h-20 rounded-md" />
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-bl" numberOfLines={1}>{item.productName}</Text>
                <Text className="text-sm text-g-300 mt-1">${item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItemFromWishlist(item.productId)} className="p-2">
                <Image source={icons.save} className="w-6 h-6" tintColor="#E53E3E" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-g-300">You haven not saved any items yet.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

export default Saved;