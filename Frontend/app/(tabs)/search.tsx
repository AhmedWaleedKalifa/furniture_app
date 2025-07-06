import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import useFetch from "@/services/useFetch";
import { fetchFurniture } from "@/services/api";
import Card from "@/components/Card";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: allFurniture,
    loading,
    error,
  } = useFetch<Product[] | null>(fetchFurniture);
  const [filteredFurniture, setFilteredFurniture] = useState<Product[] | null>(
    []
  );
  const { user } = useAuth(); // Get user from context
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    tags: [] as string[],
  });
  // Temporary state for the modal to avoid applying filters until the user confirms
  const [tempFilters, setTempFilters] = useState(activeFilters);

  const { uniqueCategories, uniqueTags } = useMemo(() => {
    if (!allFurniture) return { uniqueCategories: [], uniqueTags: [] };

    // Filter for unique, non-empty values
    const categories = [
      ...new Set(allFurniture.map((p) => p.category).filter(Boolean)),
    ];
    const tags = [
      ...new Set(allFurniture.flatMap((p) => p.tags || []).filter(Boolean)),
    ];

    return { uniqueCategories: categories.sort(), uniqueTags: tags.sort() };
  }, [allFurniture]);

  useEffect(() => {
    if (!allFurniture) {
      setFilteredFurniture([]);
      return;
    }

    // Determine the base list of products based on user role
    let baseList = allFurniture;
    if (user?.role === "client") {
      baseList = allFurniture.filter((item) => item.isApproved);
    }
    const lowercasedQuery = searchQuery.toLowerCase();

    const filtered = baseList.filter((item) => {
      // Search Query Filter
      const matchesQuery =
        lowercasedQuery === "" ||
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.category.toLowerCase().includes(lowercasedQuery) ||
        item.description.toLowerCase().includes(lowercasedQuery);

      // Category Filter
      const matchesCategory =
        !activeFilters.category || item.category === activeFilters.category;

      // Price Filter
      const price = item.price;
      const minPrice = parseFloat(activeFilters.minPrice);
      const maxPrice = parseFloat(activeFilters.maxPrice);
      const matchesMinPrice = isNaN(minPrice) || price >= minPrice;
      const matchesMaxPrice = isNaN(maxPrice) || price <= maxPrice;

      // Tags Filter
      const matchesTags =
        activeFilters.tags.length === 0 ||
        activeFilters.tags.every((tag) => (item.tags || []).includes(tag));

      return (
        matchesQuery &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesTags
      );
    });

    setFilteredFurniture(filtered);
  }, [searchQuery, allFurniture, user, activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters);
    setFilterVisible(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: "",
      minPrice: "",
      maxPrice: "",
      tags: [],
    };
    setTempFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setFilterVisible(false);
  };

  const toggleTag = (tag: string) => {
    setTempFilters((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterVisible}
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.filterTitle}>Filters</Text>
          <ScrollView>
            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.tagsContainer}>
              {uniqueCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.tag,
                    tempFilters.category === cat && styles.tagSelected,
                  ]}
                  onPress={() =>
                    setTempFilters({
                      ...tempFilters,
                      category: tempFilters.category === cat ? "" : cat,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.tagText,
                      tempFilters.category === cat && styles.tagTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min Price"
                keyboardType="numeric"
                value={tempFilters.minPrice}
                onChangeText={(text) =>
                  setTempFilters({ ...tempFilters, minPrice: text })
                }
              />
              <TextInput
                style={styles.priceInput}
                placeholder="Max Price"
                keyboardType="numeric"
                value={tempFilters.maxPrice}
                onChangeText={(text) =>
                  setTempFilters({ ...tempFilters, maxPrice: text })
                }
              />
            </View>
            <Text style={styles.filterSectionTitle}>Styles</Text>
            <View style={styles.tagsContainer}>
              {uniqueTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    tempFilters.tags.includes(tag) && styles.tagSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      tempFilters.tags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-w-200">
      {renderFilterModal()}
      <FlatList
        data={filteredFurniture}
        renderItem={({ item }) => <Card {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center items-center">
              <Image
                source={icons.logo}
                className="w-16 h-16 mt-14 mb-1 mx-auto"
              />
            </View>
            
                        <View className="my-5 flex-row items-center gap-x-2">
              <View className="flex-1">
                <SearchBar 
                  placeholder="Search for furniture..." 
                  value={searchQuery}
                  onChangeText={(text: string) => setSearchQuery(text)}
                />
              </View>
              <TouchableOpacity onPress={() => setFilterVisible(true)} className="bg-g-100 p-3 rounded-full"><Ionicons name="filter" size={24} color="#625043" /></TouchableOpacity>
             </View>
            {loading && (
              <ActivityIndicator
                size="large"
                color="#65B3B5"
                className="my-3"
              />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3 text-center">
                Error: {error.message}
              </Text>
            )}
            {!loading && !error && searchQuery.trim() && !activeFilters.category && !activeFilters.minPrice && !activeFilters.maxPrice && activeFilters.tags.length === 0 && (
               <Text className="text-xl text-bl font-bold">Search Results for{' '}
                 <Text className="text-br">{searchQuery}</Text>
               </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-lg text-g-300">
                {searchQuery.trim()
                  ? "No furniture found."
                  : "Type to search for furniture."}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};
const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      height: '75%',
    },
    filterTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#1e293b'
    },
    filterSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 12,
      color: '#475569'
    },
    priceInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16
    },
    priceInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: '#f1f5f9',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    tagSelected: {
      backgroundColor: '#625043',
    },
    tagText: {
      color: '#475569',
      fontWeight: '500',
    },
    tagTextSelected: {
      color: 'white',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      marginTop: 20,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      gap: 12,
    },
    clearButton: { flex: 1, padding: 16, borderRadius: 8, backgroundColor: '#f1f5f9' },
    clearButtonText: { textAlign: 'center', color: '#475569', fontWeight: 'bold' },
    applyButton: { flex: 1, padding: 16, borderRadius: 8, backgroundColor: '#625043' },
    applyButtonText: { textAlign: 'center', color: 'white', fontWeight: 'bold' },
    filterOption: {
      padding: 10,
    },
    filterOptionSelected: {
      fontWeight: 'bold',
      color: '#625043',
    }
  });
  
export default Search;
