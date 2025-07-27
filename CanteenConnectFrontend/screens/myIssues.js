import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

export default function IssueListScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchIssues = async () => {
        setLoading(true);
        const email = await AsyncStorage.getItem('userEmail');
        try {
          const response = await axios.get(`http://192.168.55.104:3101/get-issues?u_usermail=${email}`);
          setIssues(response.data);
        } catch (error) {
          console.error('❌ Error fetching issues:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchIssues();
    }, [])
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return { color: 'green', fontWeight: 'bold' };
      case 'rejected': return { color: 'red', fontWeight: 'bold' };
      case 'in_progress': return { color: 'orange', fontWeight: 'bold' };
      case 'closed': return { color: 'blue', fontWeight: 'bold' };
      default: return { color: '#555' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📋 My Raised Issues</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" />
      ) : issues.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No issues found.</Text>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.issueCard}>
              <Text style={styles.issueField}>📝 <Text style={styles.bold}>Type:</Text> {item.issue_type}</Text>
              <Text style={styles.issueField}>📄 <Text style={styles.bold}>Description:</Text> {item.description}</Text>
              <Text style={styles.issueField}>🆔 <Text style={styles.bold}>Order ID:</Text> {item.order_id || 'N/A'}</Text>
              <Text style={styles.issueDate}><Text style={styles.bold}>📅 Created:</Text>{item.created_on?.split(' ')[0]}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center', marginVertical: 16 },
  issueCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  issueField: { fontSize: 16, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  issueDate: { fontSize: 14, color: '#777', marginTop: 4 },
});
