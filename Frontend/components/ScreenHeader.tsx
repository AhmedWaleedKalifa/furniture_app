import { View, Text, Image } from 'react-native';
import React from 'react';
import { icons } from '@/constants/icons';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

const ScreenHeader = ({ title, subtitle }: ScreenHeaderProps) => {
  return (
    <View className="px-5 pt-16 pb-6 bg-w-100 flex-row justify-between items-center">
      <View>
        <Text className="text-2xl font-bold text-bl">{title}</Text>
        {subtitle && <Text className="text-base text-g-300 mt-1">{subtitle}</Text>}
      </View>
      <Image source={icons.logo} className="w-12 h-12" resizeMode="contain" />
    </View>
  );
};

export default ScreenHeader;