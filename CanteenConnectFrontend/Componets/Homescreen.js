
// UnifiedHomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, StatusBar, Dimensions, ScrollView, TextInput
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';


const screenWidth = Dimensions.get('window').width;

const lightTheme = {
  primary: '#5A1151', accent: '#FFB74D', background: '#FFF9E6',
  cardBackground: '#FFFFFF', textPrimary: '#333333', textSecondary: '#666666',
  buttonBackground: '#5A1151', buttonText: '#FFF',
  swiperDot: '#CCCCCC', swiperActiveDot: '#5A1151',
};

const darkTheme = {
  primary: '#FFB74D', accent: '#5A1151', background: '#121212',
  cardBackground: '#1E1E1E', textPrimary: '#FFFFFF', textSecondary: '#AAAAAA',
  buttonBackground: '#FFB74D', buttonText: '#000',
  swiperDot: '#444444', swiperActiveDot: '#FFB74D',
};

export default function UnifiedHomeScreen({ navigation }) {
  const [canteens, setCanteens] = useState([]);
  const [offers, setOffers] = useState([]);
  const [username, setUsername] = useState('User');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text:
        "Hi! I am Canteen Babai 🤖.\n\nI can help you with:\n" +
        "🍛 Today's Special\n📍 Nearest Canteen\n📋 Canteen List\n🟢 Available Canteens Now\n🌟 Famous Food Item\n🏆 Famous Canteen\n\nAsk me anything!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const bhavans = {
    'ratan tata': ['Ball Canteen'],
    'kl rao': ['Ball Canteen'],
    'billgates': ['Ball Canteen'],
    'cotton': ['Ball Canteen'],
    'vishweswaraya': ['Satya Canteen'],
    'ramanujan': ['Satya Canteen'],
    'abdul kalam': ['Aparna Canteen', 'Pencil Canteen', 'BBA Canteen'],
    'pharmacy': ['Aparna Canteen', 'Pencil Canteen', 'BBA Canteen'],
    'polytechnic': ['Aparna Canteen', 'Pencil Canteen', 'BBA Canteen']
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const inputLower = input.toLowerCase();
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const todaySpecials = [
      { food: 'Veg Paneer Pulao', canteen: 'Aparna Canteen', price: '₹80' },
      { food: 'Egg Roll', canteen: 'Ball Canteen', price: '₹50' },
      { food: 'Chicken Fry Biriyani', canteen: 'BBA', price: '₹120' },
      { food: 'Gobi Manchurian', canteen: 'Pencil Canteen', price: '₹60' },
      { food: 'Samosa Chat', canteen: 'Satya Canteen', price: '₹40' },
    ];

    const bhavans = {
      'ratan tata': 'Ball Canteen',
      'kl rao': 'Ball Canteen',
      'billgates': 'Ball Canteen',
      'cotton': 'Ball Canteen',
      'visheswaraya': 'Satya Canteen',
      'ramanujan': 'Satya Canteen',
      'abdul kalam': 'Aparna / Pencil / BBA Canteens',
      'pharmacy block': 'Aparna / Pencil / BBA Canteens',
      'polytechnic block': 'Aparna / Pencil / BBA Canteens',
    };

    const allCanteens = ['Pencil', 'Aparna', 'Ball', 'Satya', 'BBA'];

    let botReply = '';

    // 1. Greetings
    if (['hi', 'hello', 'hey'].some(greet => inputLower.includes(greet))) {
      botReply = `Namaste! 🙏 I’m Canteen Babai 🤖\n\nI can help you with:\n🍛 Today's Special\n📍 Nearest Canteen\n📋 Canteen List\n🕐 Available Canteens\n🌟 Famous Food\n🏆 Famous Canteen`;
    }

    // 2. Today's Special
    else if (inputLower.includes("today") && inputLower.includes("special")) {
      botReply = `🍽️ Today's Special Items:\n\n` + todaySpecials.map(item =>
        `🍛 ${item.food} - ${item.canteen} - ${item.price}`
      ).join('\n');
    }

    // 3. Nearest Canteen - Ask for Bhavan
    else if (inputLower.includes("nearest canteen") || inputLower.includes("canteen near")) {
      botReply = `🏢 Please tell me your Bhavan name to find the nearest canteen:\n\n- Ratan Tata\n- KL Rao\n- Billgates\n- Cotton\n- Vishweswaraya\n- Ramanujan\n- Abdul Kalam\n- Pharmacy Block\n- Polytechnic Block`;
    }

    // 4. Match Bhavan to Canteen
    else if (Object.keys(bhavans).some(bhavan => inputLower.includes(bhavan))) {
      const matched = Object.keys(bhavans).find(bhavan => inputLower.includes(bhavan));
      botReply = `📍 Nearest canteen to ${matched.toUpperCase()} is:\n👉 ${bhavans[matched]}`;
    }

    // 5. Canteen List
    else if (inputLower.includes("canteen list") || inputLower.includes("all canteens")) {
      botReply = `📋 Our Canteens:\n` + allCanteens.map(c => `• ${c} Canteen`).join('\n');
    }

    // 6. Available Canteens Now
    else if (inputLower.includes("available canteen")) {
      if (canteens.length > 0) {
        botReply = `🟢 Currently Open Canteens:\n` + canteens.map(c => `✅ ${c.name} (${c.timings})`).join('\n');
      } else {
        botReply = "😞 No canteens are open right now.";
      }
    }

    // 7. Famous Food
    else if (inputLower.includes("famous food") || inputLower.includes("top food")) {
      // Pick highest rated food from today's special
      const top = todaySpecials[0];
      botReply = `🌟 Famous Food:\n🍛 ${top.food}\n🏠 ${top.canteen}\n💰 ${top.price}`;
    }

    // 8. Famous Canteen
    else if (inputLower.includes("famous canteen") || inputLower.includes("best canteen")) {
      if (canteens.length > 0) {
        const topCanteen = canteens.reduce((prev, curr) => (curr.rating > prev.rating ? curr : prev));
        botReply = `🏆 Most Popular Canteen:\n${topCanteen.name} (${topCanteen.rating}⭐)`;
      } else {
        botReply = "No canteen data available currently.";
      }
    }

    // 9. Default
    else {
      botReply = "🤖 I can help you with:\n\n🍛 Today's Special\n📍 Nearest Canteen\n📋 Canteen List\n🕐 Available Now\n🌟 Famous Food\n🏆 Famous Canteen";
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: botReply }]);
      setLoading(false);
    }, 500);
  };



  const isCanteenOpenNow = (timings) => {
    if (!timings) return false;
    const [start, end] = timings.split('-').map(t => t.trim());
    const now = moment();
    const startTime = moment(start, 'hh:mm A');
    const endTime = moment(end, 'hh:mm A');
    return now.isBetween(startTime, endTime);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) setUsername(storedName);

        const offersRes = await axios.get('https://dev285691.service-now.com/api/now/table/u_special_offers', {
          auth: { username:process.env.SERVICENOW_USERNAME, password:process.env.SERVICENOW_PASSWORD },
          headers: { Accept: 'application/json' },
        });

        const canteenRes = await axios.get('https://dev285691.service-now.com/api/now/table/u_canteen_list', {
          auth: { username:process.env.SERVICENOW_USERNAME, password:process.env.SERVICENOW_PASSWORD },
          headers: { Accept: 'application/json' },
        });

        const offersData = offersRes.data.result.map(o => ({
          id: o.sys_id,
          title: o.u_title,
          image: { uri: o.u_offer_img_url },
        }));
        setOffers(offersData);

        const canteenData = canteenRes.data.result.map(item => ({
          id: item.sys_id,
          name: item.u_canteen_name,
          timings: item.u_timings,
          rating: parseFloat(item.u_rating),
          image: { uri: item.u_canteen_img_url },
        }));
        const openNow = canteenData.filter(c => isCanteenOpenNow(c.timings));
        setCanteens(openNow);

      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, []);

  const handleViewMenu = (canteen) => {
    navigation.navigate(canteen.name + "Canteen");
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: theme.background }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Image source={require('../assets/ccLogo.jpg')} style={styles.appIcon} />
            <Text style={[styles.heyyyText, { color: theme.primary }]}>
              Hey, {username}! 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
            <Feather name={isDarkMode ? 'sun' : 'moon'} size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Today's Offers</Text>
        <View style={styles.swiperContainer}>
          <Swiper autoplay loop dotColor={theme.swiperDot} activeDotColor={theme.swiperActiveDot}>
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerSlide}>
                <Image source={offer.image} style={styles.offerImage} resizeMode="cover" />
                <Text style={styles.offerTitle}>{offer.title}</Text>
              </View>
            ))}
          </Swiper>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Available Canteens ({canteens.length})</Text>
        {canteens.map((canteen) => (
          <TouchableOpacity key={canteen.id} style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Image source={canteen.image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={[styles.canteenName, { color: theme.textPrimary }]}>{canteen.name}</Text>
              <Text style={[styles.timingText, { color: theme.textSecondary }]}>Timings: {canteen.timings}</Text>
              <TouchableOpacity style={[styles.checkButton, { backgroundColor: theme.buttonBackground }]} onPress={() => handleViewMenu(canteen)}>
                <Text style={[styles.checkButtonText, { color: theme.buttonText }]}>Check Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chatbot Window */}
      {showChat && (
        <View style={[styles.chatContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatTitle, { color: theme.textPrimary }]}>Canteen Babai</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <MaterialIcons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.from === 'user' ? styles.userBubble : styles.botBubble,
                  msg.from === 'user' ? { backgroundColor: theme.buttonBackground } : { backgroundColor: theme.background }
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.from === 'user' ? { color: theme.buttonText } : { color: theme.textPrimary }
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 10}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={[styles.chatInput, { color: theme.textPrimary, borderColor: theme.textSecondary }]}
                  placeholder="Ask Babai anything..."
                  placeholderTextColor={theme.textSecondary}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.buttonBackground }]} onPress={handleSend}>
                  <MaterialIcons name="send" size={20} color={theme.buttonText} />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>

        </View>
      )}

      {/* Floating Chat Button */}
      <TouchableOpacity style={[styles.botButton, { backgroundColor: theme.accent }]} onPress={() => setShowChat(prev => !prev)}>
        <MaterialCommunityIcons name={showChat ? "robot-angry-outline" : "robot-outline"} size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  heyyyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginVertical: 10,
  },
  swiperContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  offerSlide: { flex: 1 },
  offerImage: { width: '100%', height: '100%' },
  offerTitle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  card: {
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3
  },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: 15 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8
  },
  canteenName: { fontSize: 18, fontWeight: 'bold' },
  ratingContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', paddingHorizontal: 6, borderRadius: 10
  },
  timingText: { fontSize: 14, marginTop: 5 },
  checkButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  checkButtonText: {
    fontWeight: 'bold',
    fontSize: 14
  },
  categoryHeading: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginTop: 10 },
  categoryCard: { backgroundColor: "yellow", borderRadius: 15, marginRight: 15, elevation: 2, width: 60, height: 60, overflow: "hidden", marginTop: 10 },
  categoryIcon: { width: 60, height: 60, resizeMode: "cover" },
  categoryText: { fontSize: 12, textAlign: "center", color: "#FF8000", marginRight: 15, padding: 3 },
  categoryItem: { alignItems: "center", marginRight: 15 },
  // Virtual Agent Styles
  botButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: '#FFB74D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  chatContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: '85%',
    height: '60%',
    borderRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 999,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});