import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import useFetch from '../../services/useFetch';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/api';
import RolePicker from '../RolePicker';
import { User } from '../../types/index';

interface UsersDashboardProps {
  token: string;
}

const UsersDashboard: React.FC<UsersDashboardProps> = ({ token }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { data: users, loading: fetchLoading, error, refetch } = useFetch<User[]|null>(
    () => getAllUsers(token),
    !!token
  );
  
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setLoading(true);
      await updateUserRole(token, selectedUser.uid, newRole); 
      Alert.alert('Success', 'User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUser(token, user.uid);
              Alert.alert('Success', 'User deleted successfully');
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'company': return 'bg-br';
      case 'client': return 'bg-accent';
      default: return 'bg-g-200';
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View className="bg-w-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-bl flex-1" numberOfLines={1}>{item.displayName}</Text>
          <View className={`px-2 py-1 rounded-full ${getRoleColor(item.role)}`}>
            <Text className="text-w-100 text-xs font-bold uppercase">{item.role}</Text>
          </View>
        </View>
        <Text className="text-sm text-g-300 mb-1">{item.email}</Text>
        <Text className="text-xs text-g-200">
          Joined: {item.createdAt && typeof item.createdAt === 'object' && item.createdAt._seconds
            ? new Date(item.createdAt._seconds * 1000).toLocaleDateString()
            : item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      
      <View className="flex-row justify-end gap-2 ">
        <TouchableOpacity
          className="bg-accent/20 py-2 px-4 rounded-lg"
          onPress={() => openRoleModal(item)}
        >
          <Text className="text-accent font-semibold">Change Role</Text>
        </TouchableOpacity>
        
        {item.role !== 'admin' && (
          <TouchableOpacity
            className="bg-red-500/20 py-2 px-4 rounded-lg"
            onPress={() => handleDeleteUser(item)}
          >
            <Text className="text-red-600 font-semibold">Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (fetchLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7df9ff" />
        <Text className="mt-4 text-g-300">Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-red-500 text-center mb-4">Error: {error.message}</Text>
        <TouchableOpacity className="bg-accent py-2 px-5 rounded-lg" onPress={refetch}>
          <Text className="text-w-100 font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={users || []}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-5">
          <View className="bg-w-100 rounded-xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-center text-bl mb-2">Change User Role</Text>
            <Text className="text-base text-g-300 text-center mb-5">{selectedUser?.displayName}</Text>
            
            <RolePicker
              selectedValue={newRole}
              onValueChange={setNewRole}
              style={{marginBottom: 24}}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 mr-2 bg-g-100 py-3 rounded-lg items-center"
                onPress={() => setShowRoleModal(false)}
              >
                <Text className="text-bl font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 ml-2 bg-br py-3 rounded-lg items-center"
                onPress={handleRoleChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#7df9ff" size="small" />
                ) : (
                  <Text className="text-w-100 font-bold">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UsersDashboard;