import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
//object {name,email,image,phone}
import db from "../../mock/db.json";
import { images } from "@/constants/images";
const Profile = () => {
  const user = db.users[0];
  //user.phone=null;
  return (
    <View className="bg-w-200 flex-1">
      <ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 10,
        }}
      >
        <View className="flex flex-1 flex-col gap-5 mt-16">
          <Text className="text-br font-medium text-lg mt-4 p-4">Profile</Text>
          <View className=" flex flex-col items-center  w-full h-72">
            <Image source={images.profile} className="w-full h-36 " />
            <Image
              source={{
                uri: user?.image ? user.image : icons.person,
              }}
              className="size-48 rounded-full m-2 bg-w-100 relative bottom-24"
              resizeMode="cover"
            />
            <Text
              className="text-br font-bold text-lg relative bottom-24"
              numberOfLines={1}
            >
              {user.name}
            </Text>
          </View>
          <View className="flex flex-row justify-between p-5 bg-g-100 ">
            <Text>Mail:</Text>
            <Text>{user.email}</Text>
          </View>
          {
            user.phone?(
              <View className="flex flex-row justify-between p-5 bg-g-100">
              <Text>Phone:</Text>
              <Text>{user.phone}</Text>
            </View>
            ):null
          }
            <TouchableOpacity>
              <View className="flex flex-row justify-center">
               <Text className="rounded-lg bg-br text-w-100 font-bold py-4 px-8 ">Log out</Text>

              </View>
            </TouchableOpacity>
        </View>
       
      </ScrollView>
    </View>
  );
};

export default Profile;
