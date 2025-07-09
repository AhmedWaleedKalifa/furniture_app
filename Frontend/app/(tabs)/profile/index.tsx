import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

// This helper component can stay here or be moved to its own file.
const ProfileLink = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-w-100 p-4 rounded-lg flex-row justify-between items-center mb-4 border border-g-100"
  >
    <Text className="text-bl text-base font-semibold">{label}</Text>
    <Image source={icons.arrow} className="w-5 h-5" tintColor="#A9A9A9" />
  </TouchableOpacity>
);

const Profile = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-w-200">
        <ActivityIndicator size="large" color="#7df9ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-w-200 justify-center items-center px-5 gap-y-4">
        <Text className="text-xl text-bl font-bold">Please log in</Text>
        <Text className="text-g-300 text-center mb-4">
          Log in to view your profile, orders, and wishlist.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="w-full bg-br rounded-lg h-14 justify-center items-center"
        >
          <Text className="text-w-100 font-bold text-base">
            Log In / Sign Up
          </Text>
        </TouchableOpacity>
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
              {/* Display user avatar if available, otherwise fallback to initial */}
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-full h-full rounded-full" />
              ) : (
                <Text className="text-6xl font-bold text-w-100">
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text className="text-bl font-bold text-2xl mt-4" numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text className="text-g-300 text-sm">{user.email}</Text>
          </View>

          <View className="px-5">
          <ProfileLink
      label="Edit Profile"
      onPress={() => router.push('/profile/edit')}
      />
            
            {user.role === "admin" && (
              <ProfileLink
                label="Admin Dashboard"
                onPress={() => router.push("/admin_dashboard")}
              />
            )}
            {user.role === "company" && (
              <ProfileLink
                label="Company Dashboard"
                onPress={() => router.push("/company_dashboard")}
              />
            )}
            {user.role === "client" && (
              <ProfileLink
                label="My Orders"
                onPress={() => router.push("/orders")}
              />
            )}

            <ProfileLink
              label="Support Tickets"
              onPress={() => router.push("/support")}
            />

            <TouchableOpacity
              onPress={logout}
              className="mt-8 bg-red-500/20 py-4 px-8 rounded-lg items-center"
            >
              <Text className="text-red-600 font-bold">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;