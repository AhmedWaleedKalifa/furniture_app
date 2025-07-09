import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { updateUserProfile } from '@/services/api';
import ScreenHeader from '@/components/ScreenHeader';

const DEFAULT_AVATAR = 'https://dummyimage.com/300x200/000/fff';

const EditProfileScreen = () => {
  const { user, token, setUser } = useAuth();

  // Always derive initial avatar from user object (avatarUrl or avatar)
  const getInitialAvatar = () => {
    if (user?.avatarUrl) return { uri: user.avatarUrl };
    if (user?.avatar) return { uri: user.avatar };
    return null;
  };

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || user?.phone || '');
  const [avatar, setAvatar] = useState(getInitialAvatar());
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  // When user changes (after update), update avatar preview
  useEffect(() => {
    setAvatar(getInitialAvatar());
  }, [user]);

  // Image picker logic
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar({ uri: result.assets[0].uri });
    }
  };

  // Save handler
  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'You are not authenticated.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('phone', phone);

      // Only append avatar if it's a new local image (not the remote URL)
      if (avatar && avatar.uri && !avatar.uri.startsWith('http')) {
        const uriParts = avatar.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('avatar', {
          uri: avatar.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const updatedUser = await updateUserProfile(token, formData);

      // If backend returns avatarUrl, use it for context
      setUser({
        ...user,
        ...updatedUser,
        avatar: updatedUser.avatarUrl || updatedUser.avatar || user.avatar,
        phone: updatedUser.phone || updatedUser.phone || phone,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-w-200">
      <ScreenHeader title="Edit Profile" />
      <ScrollView className="px-5">
        <View className="items-center my-6">
          <TouchableOpacity onPress={handlePickImage}>
            <Image
              source={
                avatar && avatar.uri
                  ? { uri: avatar.uri }
                  : { uri: DEFAULT_AVATAR }
              }
              style={{ width: 100, height: 100, borderRadius: 50 }}
              onError={e => console.log('Image load error', e.nativeEvent.error)}
            />
            <View className="absolute bottom-0 right-0 bg-br p-2 rounded-full">
              <Text className="text-white">✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-base text-bl font-semibold mb-2">Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your display name"
          className="bg-w-100 p-4 rounded-lg mb-4 border border-g-200 text-bl"
          placeholderTextColor="#A9A9A9"
        />

        <Text className="text-base text-bl font-semibold mb-2">Email</Text>
        <TextInput
          value={user?.email || ''}
          editable={false}
          className="bg-g-100 p-4 rounded-lg mb-4 border border-g-200 text-g-300"
        />

        <Text className="text-base text-bl font-semibold mb-2">Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Your phone number"
          className="bg-w-100 p-4 rounded-lg mb-8 border border-g-200 text-bl"
          placeholderTextColor="#A9A9A9"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          onPress={handleSave}
          className="bg-br rounded-lg h-14 justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-w-100 font-bold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-g-100 rounded-lg h-14 justify-center items-center mt-3 mb-10"
          disabled={isLoading}
        >
          <Text className="text-bl font-bold text-base">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
