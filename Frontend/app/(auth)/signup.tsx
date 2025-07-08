import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { icons } from '@/constants/icons';
import { validateEmail, validatePassword } from '@/lib/validation';

const Signup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'company'>('client'); // New state for role
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }
    if (!validatePassword(password)) {
        Alert.alert('Error', 'Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, and one number.');
        return;
    }

    setLoading(true);
    try {
      await signup({ displayName, email, password, role }); // Pass the selected role
      Alert.alert('Success', 'Account created successfully! Please log in.');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-w-200 px-5">
      <Image source={icons.logo} className="w-24 h-24 mb-6" resizeMode='contain' />
      <Text className="text-2xl font-bold text-bl mb-5">Create Account</Text>

      {/* Role Selector */}
      <View className="flex-row w-full mb-4 bg-g-100 rounded-lg p-1">
        <TouchableOpacity
          className={`flex-1 p-2 rounded-md ${role === 'client' ? 'bg-br' : ''}`}
          onPress={() => setRole('client')}
        >
          <Text className={`text-center font-semibold ${role === 'client' ? 'text-w-100' : 'text-bl'}`}>I am a Client</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-2 rounded-md ${role === 'company' ? 'bg-br' : ''}`}
          onPress={() => setRole('company')}
        >
          <Text className={`text-center font-semibold ${role === 'company' ? 'text-w-100' : 'text-bl'}`}>I am a Company</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="w-full h-14 px-4 bg-g-100 rounded-lg border-2 border-g-200 focus:border-br mb-4 text-bl"
        placeholder="Display Name"
        placeholderTextColor="#625043"
        value={displayName}
        onChangeText={setDisplayName}
      />

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

      <TouchableOpacity onPress={handleSignup} className="w-full bg-br rounded-lg h-14 justify-center items-center" disabled={loading}>
        {loading ? <ActivityIndicator color="#7df9ff" /> : <Text className="text-w-100 font-bold text-base">Sign Up</Text>}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-g-300">Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-br font-bold">Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Signup;