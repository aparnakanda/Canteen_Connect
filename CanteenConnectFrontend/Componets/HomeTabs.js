import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from './Homescreen';
import NavigationScreen from './NavigationScreen';
import ProfileScreen from './ProfileScreen';
import Cartscreen from './Cartscreen';

const Tab = createBottomTabNavigator();

// ✅ Bottom Tab Navigator
function HomeTabs() {
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === 'Home') iconName = 'home';
      else if (route.name === 'Navigation') iconName = 'compass';
      else if (route.name === 'Profile') iconName = 'user';
      else if (route.name === 'CartScreen') iconName = 'shopping-cart'; // 👈 new icon

      return <Feather name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#5A1151',
    tabBarInactiveTintColor: 'gray',
    headerShown: false,
  })}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Navigation" component={NavigationScreen} />
  <Tab.Screen name="CartScreen" component={Cartscreen} /> 
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>

  );
}
 export default HomeTabs;