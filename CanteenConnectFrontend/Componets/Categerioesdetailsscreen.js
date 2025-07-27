// CategoryDetailsSection.js
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CategoryDetailsSection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;

  useEffect(() => {
    // Automatically navigate to the appropriate canteen screen
    switch (category.name) {
      case 'Pencil':
        navigation.replace('PencilCanteen');
        break;
      case 'Ball':
        navigation.replace('BallCanteen');
        break;
      case 'BBA':
        navigation.replace('BBACanteen');
        break;
      case 'Aparna':
        navigation.replace('AparnaCanteen');
        break;
      case 'Satya':
        navigation.replace('SatyaCanteen');
        break;
      default:
        break;
    }
  }, [category]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name} Canteen</Text>
        </View>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CategoryDetailsSection;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    elevation: 3,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#640D5F',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

