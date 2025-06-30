import { View, Text,Image,TextInput } from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface Props{
    placeholder:string;
    onPress?:()=>void;
    value? : string;
    onChangeText? :(text:string)=>void;
}

const SearchBar = ({onPress,placeholder,value,onChangeText}:Props) => {
  return (
    <View className=' flex-row items-center bg-g-100 rounded-full px-5 py-4'>
        <Image source={icons.search} className='size-5' resizeMode='contain' tintColor="#625043"/>
        <TextInput 
            onPress={onPress}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#625043"
            className='flex-1 ml-2 text-bl'
        />
    </View>
  )
}

export default SearchBar