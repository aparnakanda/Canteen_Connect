import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WishListscreen = () => {
  const [wishItems, setWishItems] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchWishlist = async () => {
        try {
          const storedWishlist = await AsyncStorage.getItem("wishlist");
          if (storedWishlist !== null) {
            setWishItems(JSON.parse(storedWishlist));
          } else {
            setWishItems([]);
          }
        } catch (error) {
          console.log("Failed to load wishlist", error);
        }
      };

      fetchWishlist();
    }, [])
  );

  const removeFromWishlist = async (id, canteen) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedList = wishItems.filter(
                (item) => !(item.id === id && item.canteen === canteen)
              );
              setWishItems(updatedList);
              await AsyncStorage.setItem("wishlist", JSON.stringify(updatedList));
            } catch (error) {
              console.log("Error removing item from wishlist:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.imageStyle} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>
      <Text style={styles.canteen}>From: {item.canteen}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWishlist(item.id, item.canteen)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.Parent}>
        <View style={styles.Section1}>
          <Text style={styles.header}>My Favorites</Text>
        </View>
        <View style={styles.Section2}>
          {wishItems.length === 0 ? (
            <Text style={styles.emptyText}>No items in wishlist</Text>
          ) : (
            <FlatList
              data={wishItems}
              keyExtractor={(item, index) => `${item.id}-${item.canteen}-${index}`}
              numColumns={2}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Parent: {
    flex: 1,
  },
  Section1: {
    height: "10%",
    width: "100%",
    backgroundColor: "#FCFAF8",
    justifyContent: "center",
    alignItems: "center",
  },
  Section2: {
    height: "93%",
    width: "100%",
    backgroundColor: "#FF8000",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#640D5F",
  },
  card: {
    backgroundColor: "#fff",
    width: "47%",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    marginHorizontal: "1.5%",
    elevation: 3,
  },
  imageStyle: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#640D5F",
    marginTop: 4,
    textAlign: "center",
  },
  price: {
    color: "#640D5F",
    fontWeight: "bold",
    textAlign: "center",
  },
  canteen: {
    fontSize: 13,
    color: "#FF8000",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 2,
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: "#640D5F",
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
});

export default WishListscreen;



