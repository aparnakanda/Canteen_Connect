// Chatbot.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const prompts = [
  "Today's Special",
  "Nearest Canteen",
  "Canteen List",
  "Available Canteens Now",
  "Famous Food Item",
  "Famous Canteen"
];

const responses = {
  "Today's Special": "🌟 Today's special is Veg Paneer Pulao at Aparna Canteen!",
  "Nearest Canteen": "📍 Nearest canteen is Ball Canteen (for your Bhavan).",
  "Canteen List": "📋 Available Canteens:\n- Pencil\n- Aparna\n- Ball\n- Satya\n- BBA",
  "Available Canteens Now": "🕒 Canteens open now are: Ball, Satya, and Aparna.",
  "Famous Food Item": "🍔 Best food item is Chicken Fry Biryani at BBA!",
  "Famous Canteen": "🏆 Most popular canteen is Satya Canteen!"
};

const Chatbot = () => {
  const [chat, setChat] = useState([
    { from: 'bot', text: "Hi! I'm Canteen Babai 🤖. I can help you with:" }
  ]);

  const handlePrompt = (prompt) => {
    setChat(prev => [...prev, { from: 'user', text: prompt }, { from: 'bot', text: responses[prompt] || "I'm not sure how to answer that yet!" }]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatBox}>
        {chat.map((msg, index) => (
          <View key={index} style={[styles.message, msg.from === 'user' ? styles.userMsg : styles.botMsg]}>
            <Text style={styles.msgText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {prompts.map((prompt, idx) => (
          <TouchableOpacity key={idx} style={styles.promptButton} onPress={() => handlePrompt(prompt)}>
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#FFF9E6' },
  chatBox: { flex: 1, marginBottom: 10 },
  message: { marginVertical: 4, padding: 10, borderRadius: 10, maxWidth: '80%' },
  userMsg: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  botMsg: { backgroundColor: '#EEE', alignSelf: 'flex-start' },
  msgText: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  promptButton: {
    backgroundColor: '#FFB74D', padding: 10, margin: 5,
    borderRadius: 20, minWidth: '40%', alignItems: 'center'
  },
  promptText: { color: '#000', fontWeight: 'bold' }
});

export default Chatbot;
