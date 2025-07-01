import { Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

const ProfileLink = ({ label, onPress }: { label: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} className="bg-g-100 p-4 rounded-lg flex-row justify-between items-center mb-4">
        <Text className="text-bl text-base font-semibold">{label}</Text>
        <Image source={icons.arrow} className="w-5 h-5" tintColor="#625043" />
    </TouchableOpacity>
);

const Profile = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <View className='flex-1 justify-center items-center bg-w-200'><ActivityIndicator size="large" /></View>;
  }

  if (!user) {
    return (
      <View className="flex-1 bg-w-200 justify-center items-center px-5 gap-y-4">
        {/* ... Login/Signup prompt from previous step ... */}
      </View>
    );
  }

  return (
    <View className="bg-w-200 flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 120 }}
      >
        <View className="flex flex-1 flex-col mt-16">
          <View className="items-center w-full mb-8">
            <View className="size-32 rounded-full bg-br justify-center items-center border-4 border-w-100">
                <Text className="text-6xl font-bold text-w-100">{user.displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-br font-bold text-2xl mt-4" numberOfLines={1}>{user.displayName}</Text>
            <Text className="text-g-300 text-sm">{user.email}</Text>
          </View>
          
          <View className="px-5">
            {/* Role-specific dashboards */}
            {user.role === 'admin' && (
                <ProfileLink label="Admin Dashboard" onPress={() => router.push('/admin_dashboard')} />
            )}
            {user.role === 'company' && (
                <ProfileLink label="Company Dashboard" onPress={() => router.push('/company_dashboard')} />
            )}

            {/* General user features */}
            <ProfileLink label="My Orders" onPress={() => router.push('/orders')} />
            <ProfileLink label="Support Tickets" onPress={() => router.push('/support')} />
            
            <TouchableOpacity onPress={logout} className="mt-8">
              <View className="flex-row justify-center bg-red-500 rounded-lg py-4 px-8">
                <Text className="text-w-100 font-bold">Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;