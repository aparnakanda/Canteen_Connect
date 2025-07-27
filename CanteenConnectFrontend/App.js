import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import SigninScreen from './screens/login';
import SignupScreen from './screens/signup';
import ForgotPasswordScreen from './screens/forgotpassword';
import ResetPasswordScreen from './screens/resetpassword';
import { useEffect, useState } from 'react';
import Splash from './Componets/splash';
import CategoryDetailsSection from './Componets/Categerioesdetailsscreen';
import AparnaCanteenPage from './Componets/AparnaCanteenpage';
import BallCanteenPage from './Componets/BallCanteen';
import BBACanteenPage from './Componets/BBACanteen';
import PencilCanteenPage from './Componets/PencilCanteen';
import SatyaCanteenPage from './Componets/SatyaCanteen';
import HomeTabs from './Componets/HomeTabs';
import Cartscreen from './Componets/Cartscreen';
import Toast from 'react-native-toast-message';
import IssueRaiseScreen from './Componets/IssueRaising';
import IssueListScreen from './screens/myIssues';
import Chatbot from './Componets/chatbot';


const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...FontAwesome.font,
        });
        setFontsLoaded(true);
      } catch (err) {
        console.error('Error loading icon fonts:', err);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFAC1C" />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="white" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">

          <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={SigninScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryDetails" component={CategoryDetailsSection} options={{ headerShown: true }} />
          <Stack.Screen name="PencilCanteen" component={PencilCanteenPage} options={{ headerShown: false }} />
          <Stack.Screen name="BallCanteen" component={BallCanteenPage} options={{ headerShown: false }} />
          <Stack.Screen name="BBACanteen" component={BBACanteenPage} options={{ headerShown: false }} />
          <Stack.Screen name="AparnaCanteen" component={AparnaCanteenPage} options={{ headerShown: false }} />
          <Stack.Screen name="SatyaCanteen" component={SatyaCanteenPage} options={{ headerShown: false }} />
          <Stack.Screen name="CartScreen" component={Cartscreen} options={{ headerShown: false }} />
          <Stack.Screen name="IssueRaiseScreen" component={IssueRaiseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="IssueList" component={IssueListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
