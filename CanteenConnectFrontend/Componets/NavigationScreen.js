

import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Keyboard,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";

const CANTEENS = [
  {
    id: 1,
    name: "Aparna Canteen",
    coordinate: { latitude: 17.1925, longitude: 82.2107 },
  },
  {
    id: 2,
    name: "BBA Canteen",
    coordinate: { latitude: 17.1935, longitude: 82.2115 },
  },
  {
    id: 3,
    name: "Ball",
    coordinate: { latitude: 17.1915, longitude: 82.2095 },
  },
  {
    id: 4,
    name: "Satya Canteen",
    coordinate: { latitude: 17.1920, longitude: 82.2120 },
  },
  {
    id: 5,
    name: "Pencil Canteen",
    coordinate: { latitude: 17.1940, longitude: 82.2115 },
  },
];

export default function NavigationScreen() {
  const [searchText, setSearchText] = useState("");
  const [filteredCanteens, setFilteredCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const mapRef = useRef(null);

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text) {
      setFilteredCanteens([]);
      return;
    }
    const filtered = CANTEENS.filter((canteen) =>
      canteen.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCanteens(filtered);
  };

  const selectCanteen = (canteen) => {
    setSelectedCanteen(canteen);
    setSearchText(canteen.name);
    setFilteredCanteens([]);
    Keyboard.dismiss();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...canteen.coordinate,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  const openGoogleMapsDirections = () => {
    if (!selectedCanteen) return;
    const { latitude, longitude } = selectedCanteen.coordinate;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    Linking.openURL(url).catch((err) => {
      alert("Failed to open Google Maps. Make sure it's installed.");
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search canteen..."
          value={searchText}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {filteredCanteens.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredCanteens}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchItem}
                onPress={() => selectCanteen(item)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 17.1925,
          longitude: 82.2107,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {selectedCanteen && (
          <Marker
            coordinate={selectedCanteen.coordinate}
            title={selectedCanteen.name}
            description="Canteen Location"
          />
        )}
      </MapView>

      {selectedCanteen && (
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={openGoogleMapsDirections}
        >
          <Icon name="navigate" size={20} color="white" />
          <Text style={styles.directionsButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  searchResults: {
    position: "absolute",
    top: 55,
    left: 10,
    right: 10,
    backgroundColor: "white",
    maxHeight: 150,
    borderRadius: 8,
    zIndex: 10,
    elevation: 4,
  },
  searchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  directionsButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#4285F4",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  directionsButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
