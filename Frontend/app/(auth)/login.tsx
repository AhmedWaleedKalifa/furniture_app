import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { icons } from '@/constants/icons';
import { validateEmail } from '@/lib/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }

    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-w-200 px-5">
        <Image source={icons.logo} className="w-24 h-24 mb-10" resizeMode='contain' />
        <Text className="text-2xl font-bold text-bl mb-6">Welcome Back!</Text>

        <TextInput
            className="w-full h-14 px-4 bg-g-100 rounded-lg border-2 border-g-200 focus:border-br mb-4 text-bl"
            placeholder="Email"
            placeholderTextColor="#625043"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TextInput
            className="w-full h-14 px-4 bg-g-100 rounded-lg border-2 border-g-200 focus:border-br mb-6 text-bl"
            placeholder="Password"
            placeholderTextColor="#625043"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />

        <TouchableOpacity onPress={handleLogin} className="w-full bg-br rounded-lg h-14 justify-center items-center" disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-w-100 font-bold text-base">Log In</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
            <Text className="text-g-300"> Do not have an account? </Text>
            <Link href="/signup" asChild>
                <TouchableOpacity>
                    <Text className="text-br font-bold">Sign Up</Text>
                </TouchableOpacity>
            </Link>
        </View>
    </View>
  );
};

export default Login;