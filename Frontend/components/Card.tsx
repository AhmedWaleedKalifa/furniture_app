import { View, Text, TouchableOpacity,Image} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { icons } from '@/constants/icons'

//object{id,image,title,vote,price}


  
const Card = ({id,thumbnailUrl,name,category,price}:Product) => {
    return (
    <Link href={`/furniture/${id}`} asChild>
        <TouchableOpacity className='w-[30%] overflow-hidden'>
            <Image
                source={{
                    uri:thumbnailUrl
                    ? thumbnailUrl
                    : `https://placehold.co/600x400/1a1a1a/ffffff.png`
                }}
                className='w-full h-52 rounded-lg'
                resizeMode='cover'
            />
            <Text className='text-sm font-bold text-bl mt-2' numberOfLines={1}>{name}</Text>
            <View className='flex-row items-center justify-between gap-x-1 overflow-hidden max-w-20 '>
                <Text className='text-xs text-g-300 font-medium mt-1'>
                    ${price}
                </Text>
                <Text className='text-sm text-bl font-bold uppercase '>
                    {category}
                </Text>
            </View>
            <View className='flex-row items-center justify-between'>
               
            </View>
        </TouchableOpacity>
    </Link>
  )
}

export default Card