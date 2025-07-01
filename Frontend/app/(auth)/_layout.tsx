import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const AuthLayout = () => {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // If the user is already authenticated, redirect them away from the auth pages.
        if (!isLoading && user) {
            router.replace('/(tabs)');
        }
    }, [user, isLoading]);

    if (isLoading) {
        return <View className='flex-1 justify-center items-center'><ActivityIndicator size="large" /></View>
    }

    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}

export default AuthLayout;