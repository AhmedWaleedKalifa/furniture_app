import { Image, View, Text, ImageBackground, StatusBar } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { images } from '@/constants/images'
import { icons } from '@/constants/icons'
const TabIcon = ({focused,icon,title}:any) => {
   if(focused){
    return(
        <>
            <ImageBackground
                source={images.highlight}
                className='flex flex-row w-full flex-1 min-w-[114px] min-h-16 mt-6 justify-center items-center rounded-full overflow-hidden'
            >
                <Image
                    source={icon}
                    tintColor="#ffffff" className="size-5 "
                />
                <Text className='text-w-100 text-base font-semibold ml-2'>{title}</Text>
            </ImageBackground>
        </>
       )
   }
   return(
    <View className='size-full justify-center items-center mt-4 rounded-full'>
        <Image source={icon} className='size-5' tintColor="#919191"/>
    </View>
   )
}
const _layout = () => {
    return (
       <>
        <StatusBar hidden={true}/>
        <Tabs
        screenOptions={{
            tabBarShowLabel:false,
            tabBarItemStyle:{
                width:"100%",
                height:"100%",
                justifyContent:"center",
                alignItems:"center",
            },
            tabBarStyle:{
                backgroundColor:"#D9D9D9",
                borderRadius:50,
                marginHorizontal:20,
                marginBottom:36,
                height:52,
                position:"absolute",
                overflow:"hidden",
            }
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon 
                            focused={focused}
                            icon={icons.home}
                            title="Home"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon 
                            focused={focused}
                            icon={icons.search}
                            title="Search"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon 
                            focused={focused}
                            icon={icons.person}
                            title="Profile"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: "Saved",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon 
                            focused={focused}
                            icon={icons.save}
                            title="Saved"
                        />
                    )
                }}
            />
        </Tabs>
       </>
    )
}

export default _layout