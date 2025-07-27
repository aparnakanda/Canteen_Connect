
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as Animatable from "react-native-animatable";
import ConfettiCannon from "react-native-confetti-cannon";
import { Feather } from "@expo/vector-icons";

const Cartscreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [thankYouOpacity] = useState(new Animated.Value(0));
  const [theme, setTheme] = useState("light");

  const navigation = useNavigation();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
          <Feather
            name={isDark ? "sun" : "moon"}
            size={22}
            color={isDark ? "#FF8000" : "#640D5F"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const fetchCartItems = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart !== null) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.log("Failed to load cart items.", e);
    }
  };

  const saveCartItems = async (items) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {
      console.log("Failed to save cart items.", e);
    }
  };

  const increaseQuantity = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity ? item.quantity + 1 : 2 }
        : item
    );
    setCartItems(updatedCart);
    saveCartItems(updatedCart);
  };

  const decreaseQuantity = (id) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity ? item.quantity - 1 : 0;
        if (newQty < 1) {
          Alert.alert("Remove Item?", "Quantity is zero. Remove item from cart?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => removeItem(id),
            },
          ]);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updatedCart);
    saveCartItems(updatedCart);
  };

  const removeItem = (id) => {
    const filteredCart = cartItems.filter((item) => item.id !== id);
    setCartItems(filteredCart);
    saveCartItems(filteredCart);
  };

  const calculateTotalAmount = () => {
    let total = 0;
    cartItems.forEach((item) => {
      let priceValue = 0;
      if (typeof item.price === "string") {
        priceValue = parseInt(item.price.replace("₹", "").trim()) || 0;
      } else if (typeof item.price === "number") {
        priceValue = item.price;
      }
      const qty = item.quantity || 1;
      total += priceValue * qty;
    });
    return total;
  };

  const generateUniqueToken = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const symbols = ["-"];
    const randomChar = () => letters[Math.floor(Math.random() * letters.length)];
    const randomDigit = () => digits[Math.floor(Math.random() * digits.length)];
    const randomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
    return `${randomSymbol()}${randomChar()}${randomDigit()}${randomSymbol()}${randomDigit()}${randomChar()}`;
  };

  const confirmOrder = async () => {
    const token = generateUniqueToken();
    setGeneratedToken(token);
    setOrderConfirmed(true);

    const cleanedCartItems = cartItems.map((item) => {
      const rawPrice = typeof item.price === "string" ? item.price.replace("₹", "").trim() : item.price;
      const price = Number(rawPrice) || 0;
      const qty = item.quantity || 1;
      const total = price * qty;
      return {
        name: item.name?.trim() || "Unknown Item",
        price,
        quantity: qty,
        total_price: total,
        availability: item.availability || "Not specified",
        item_type: item.item_type || "Not specified",
        canteen_name: item.canteen_name || "Not specified",
      };
    });

    const email = await AsyncStorage.getItem("userEmail");
    const username = await AsyncStorage.getItem("userName");

    fetch("http://192.168.55.104:3101/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: cleanedCartItems,
        token,
        userEmail: email,
        userName: username,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Order response:", data))
      .catch((err) => console.error("Order send error:", err));

    Animated.timing(thankYouOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const closeOverlay = async () => {
    setOrderConfirmed(false);
    setCartItems([]);
    try {
      await AsyncStorage.removeItem("cart");
    } catch (e) {
      console.log("Error clearing cart after order confirmation", e);
    }
    thankYouOpacity.setValue(0);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.discountedPrice}>₹{item.price}</Text>
        {item.original_price && <Text style={styles.originalPrice}>₹{item.original_price}</Text>}
        {item.offer && <Text style={styles.offerText}>%{item.offer} off</Text>}
      </View>
      <Text style={styles.canteenName}>{item.canteen_name || "Canteen not specified"}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQuantity(item.id)}>
          <Text style={styles.qtyButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity ? item.quantity : 1}</Text>
        <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQuantity(item.id)}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.Parent}>
        <View style={styles.Section1}>
          <Text style={styles.header}>My Cart</Text>
        </View>
        <View style={styles.Section2}>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>Your cart is empty</Text>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <FlatList
                data={cartItems}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                renderItem={renderItem}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
              />
              <View style={styles.summaryBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalValue}>₹{calculateTotalAmount()}</Text>
                </View>
              </View>
              <View style={styles.buttonBox}>
                <TouchableOpacity style={styles.actionButton} onPress={confirmOrder}>
                  <Text style={styles.buttonText}>Confirm Order</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
        {orderConfirmed && (
          <View style={styles.overlay}>
            <View style={styles.tokenContainer}>
              <ConfettiCannon count={50} origin={{ x: -10, y: 0 }} fadeOut />
              <Animatable.View animation="zoomIn" duration={800} useNativeDriver>
                <Text style={styles.thankYou}>Thank you for ordering..!! Please check your mail.</Text>
              </Animatable.View>
              <TouchableOpacity onPress={closeOverlay} style={styles.crossBtn}>
                <Text style={styles.crossText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Cartscreen;


const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  Parent: { flex: 1 },
  Section1: {
    height: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  Section2: {
    height: "93%",
    backgroundColor: "#FF8000",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#640D5F",
  },
  canteenName: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#640D5F",
  },
  originalPrice: {
    fontSize: 14,
    color: "gray",
    textDecorationLine: "line-through",
  },
  offerText: {
    fontSize: 13,
    color: "green",
    fontWeight: "600",
  },

  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
  },
  offerText: {
    color: 'green',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
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
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#640D5F",
    textAlign: "center",
    marginBottom: 4,
  },
  price: {
    fontWeight: "bold",
    color: "#640D5F",
    textAlign: "center",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  qtyButton: {
    backgroundColor: "#FF8000",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 6,
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#640D5F",
    marginHorizontal: 12,
  },
  removeButton: {
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
  summaryBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    elevation: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#640D5F",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF8000",
  },
  buttonBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginHorizontal: 10,
  },
  actionButton: {
    backgroundColor: "#640D5F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tokenContainer: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    position: "relative",
    width: "80%",
    elevation: 5,
  },
  tokenTitle: {
    fontSize: 18,
    color: "#640D5F",
    fontWeight: "bold",
    marginBottom: 10,
  },
  token: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF8000",
  },
  thankYou: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#640D5F",
  },
  crossBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF8000",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  crossText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});