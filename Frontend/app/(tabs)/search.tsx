import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {Text,View,Image,ActivityIndicator,FlatList,} from "react-native";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
//import { updateSearchCount } from "@/services/appwrite";
import db from "../../mock/db.json"
const Search = () => {
  const[searchQuery,setSearchQuery]=useState("");
  const {
    data: furnitrue,
    loading,
    error,
    refetch:loadMovies,
    reset,
  } = useFetch(() =>
    fetchMovies({
      query: searchQuery,
    }),false
  );


  useEffect(()=>{
    const timeoutId=setTimeout(async()=>{
      if(searchQuery.trim()){
        await loadMovies()
      }else{
        reset()
      }
    },500);

    return ()=>clearTimeout(timeoutId)
  },[searchQuery])

  
  // useEffect(()=>{
  //   if(furnitrue?.length > 0 && furnitrue?.[0])
      
  //     updateSearchCount(searchQuery,furnitrue[0]);
  
  // },[movies])
  const furniture=db.furniture;
  // const loading=false;
  // const error=null;
  return (
    <View className="flex-1 bg-w-200">
      {/* <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      /> */}
      <FlatList
        data={furniture}
        renderItem={({ item }) => <Card {...item} />}
        keyExtractor={(item)=>item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent:"center",
          gap:16,
          marginVertical:16
        }}
        contentContainerStyle={{
          paddingBottom:100
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center  items-center ">
            <Image source={icons.logo} className="w-16 h-16 mt-14 mb-1 mx-auto" />
            </View>
            <View className="my-5">
              <SearchBar 
              placeholder="Search furniture ..." 
              value={searchQuery}
              onChangeText={(text:string)=>{setSearchQuery(text)}}
              />
            </View>
            {loading && (
              <ActivityIndicator size="large"
              color="##65B3B5"
              className="my-3"
              
              />
            )}
            {error&&(
              <Text className="text-red-500 px-5 my-3">
                Error:{error.message}
              </Text>
            )}
            {!loading && !error && searchQuery.trim() && (
              <Text className="text-xl text-white font-bold">Search Results for{' '}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            ) }
          </>
        }
        ListEmptyComponent={
          !loading && !error ?(
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()?'No movies found':'search for a movie'}
              </Text>
            </View>
          ):null
        }
      />
    </View>
  );
};

export default Search;
