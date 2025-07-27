import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

import Homescreen from "./Homescreen";
import WishListscreen from "./Wishlistscreen";
import Cartscreen from "./Cartscreen";
import CategoryDetailsScreen from "./Categerioesdetailsscreen";
import { SafeAreaView } from "react-native";
 
import PencilCanteenPage from "./PencilCanteen";
import BallCanteenPage from "./BallCanteen";
import BBACanteenPage from "./BBACanteen";
import AparnaCanteenPage from "./AparnaCanteenpage";
import SatyaCanteenPage from "./SatyaCanteen";

const BottomTab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const HomeStackScreen = () => {
  return (
   
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={Homescreen} />
      <HomeStack.Screen name="CategoryDetails" component={CategoryDetailsScreen} screenOptions={{ headerShown: false }}/>
       
       {/* <HomeStack.Screen name="PencilCanteen" component={PencilCanteenPage}
      options={{ headerShown: true, title: 'Pencil Canteen' }} 
       /> */}
       <HomeStack.Screen
             name="PencilCanteen" component={PencilCanteenPage} options={{
            headerShown: true,
         headerTitle: () => (
      <Image
        source={require('../assets/ccLogo.png')} 
        style={{ width:120, height:50,marginLeft:-30 }}
      />
    ),
    headerBackTitleVisible: false, 
  }}
/>
        <HomeStack.Screen name="BallCanteen" component={BallCanteenPage}
          options={{ headerShown: true, title: 'Ball Canteen' }} />
       <HomeStack.Screen name="BBACanteen" component={BBACanteenPage}
        options={{ headerShown: true, title: 'BBA Canteen' }}  />
        <HomeStack.Screen name="AparnaCanteen" component={AparnaCanteenPage}
         options={{ headerShown: true, title: 'Aparna Canteen' }}  />
           <HomeStack.Screen name="SatyaCanteen" component={SatyaCanteenPage} 
            options={{ headerShown: true, title: 'Satya Canteen' }} />

    </HomeStack.Navigator>
   
  );
};

const Menubar = () => {
  return (
    <NavigationContainer>
      <BottomTab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#FF8000",
          tabBarInactiveTintColor: "grey",
          tabBarIcon: ({ focused, color }) => {
            let IconName;
            if (route.name === "Home") {
              IconName = focused ? "home" : "home-outline";
            } else if (route.name === "WishList") {
              IconName = focused ? "heart" : "heart-outline";
            } else if (route.name === "Cart") {
              IconName = focused ? "cart" : "cart-outline";
            }
            return <Icon name={IconName} color={color} size={28} />;
          },
          tabBarStyle: {
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 20,
          },
        })}
      >
        <BottomTab.Screen name="Home" component={HomeStackScreen} />
        <BottomTab.Screen name="WishList" component={WishListscreen} />
        <BottomTab.Screen name="Cart" component={Cartscreen} />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
};




export default Menubar;
