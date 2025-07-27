import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const CANTEENS_DATA = [
  { id: 1, name: 'Aparna Canteen', timings: [['12:00', '14:00'], ['10:00', '24:00']], rating: 4.2,  image: require('../assets/aparna.jpg') },
  { id: 2, name: 'Eat and Play', timings: [['08:30', '10:00'], ['12:00', '14:00'], ['15:30', '17:00'], ['10:00', '24:00']], rating: 4.5, image: require('../assets/eat.jpg') },
  { id: 3, name: 'Ball 1', timings: [['08:30', '10:00'], ['12:00', '14:00'], ['15:30', '17:00'], ['10:00', '24:00']], rating: 3.9,image: require('../assets/ball.jpg') },
  { id: 4, name: 'Satya Canteen', timings: [['12:00', '14:00'], ['10:00', '24:00']], rating: 4.1,image: require('../assets/satya.jpg') },
  { id: 4, name: 'Pencil Canteen', timings: [['08:30', '10:00'], ['12:00', '14:00'],['15:00', '17:00'], ['09:00', '24:00']], rating: 4.3 ,image: require('../assets/pencil.jpg')},
];

const OFFERS_DATA = [
  { id: 1, image: require('../assets/offer1.jpg'), title: 'Special Combo Offer' },
  { id: 2, image: require('../assets/offer2.jpg'), title: 'Weekend Discount' },
  { id: 3, image: require('../assets/offer3.jpg'), title: 'New Menu Launch' },
];

const lightTheme = {
  primary: '#5A1151',
  accent: '#FFB74D',
  background: '#FFF9E6',
  cardBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  buttonPrimary: '#5A1151',
  buttonSecondary: '#EEEEEE',
  buttonText: '#333333',
  swiperDot: '#CCCCCC',
  swiperActiveDot: '#5A1151',
};

const darkTheme = {
  primary: '#FFB74D',
  accent: '#5A1151',
  background: '#121212',
  cardBackground: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  buttonPrimary: '#FFB74D',
  buttonSecondary: '#333333',
  buttonText: '#FFFFFF',
  swiperDot: '#444444',
  swiperActiveDot: '#FFB74D',
};

// ✅ Styles function
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.cardBackground,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 15,
  },
  swiperContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  offerSlide: {
    position: 'relative',
    flex: 1,
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  offerTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  canteenName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timingText: {
    marginLeft: 5,
    fontSize: 14,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
});

// ✅ Component starts
export default function HomeScreen({ navigation }) {
  const [canteens, setCanteens] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const filtered = CANTEENS_DATA.filter((c) =>
      c.timings.some(([start, end]) => {
        const s = timeToMinutes(start);
        const e = timeToMinutes(end);
        return nowMinutes >= s && nowMinutes <= e;
      })
    ).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setCanteens(filtered);
  }, [searchQuery]);

  const handleViewMenu = (canteen) => {
    navigation.navigate('Menu', { canteen });
  };

  const handleViewDetails = (canteen) => {
    navigation.navigate('Details', { canteen });
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.openDrawer()}>
    <Feather name="menu" size={24} color={theme.primary} />
  </TouchableOpacity>

  <Text style={styles.appTitle}>Canteen Connect</Text>

  <TouchableOpacity
    style={styles.themeToggle}
    onPress={() => setIsDarkMode(!isDarkMode)}
  >
    <Feather 
      name={isDarkMode ? 'sun' : 'moon'} 
      size={24} 
      color={isDarkMode ? theme.accent : theme.primary} 
    />
  </TouchableOpacity>
</View>

      {/* Offers Carousel */}
      <Text style={styles.sectionTitle}>Today's Offers</Text>
      <View style={styles.swiperContainer}>
        <Swiper
          autoplay
          showsPagination
          dotColor={theme.swiperDot}
          activeDotColor={theme.swiperActiveDot}
          paginationStyle={{ bottom: 10 }}
          loop
          autoplayTimeout={4}
        >
          {OFFERS_DATA.map((offer) => (
            <View key={offer.id} style={styles.offerSlide}>
              <Image source={offer.image} style={styles.offerImage} resizeMode="cover" />
              <Text style={styles.offerTitle}>{offer.title}</Text>
            </View>
          ))}
        </Swiper>
      </View>

      {/* Canteen List */}
      <Text style={styles.sectionTitle}>Available Canteens ({canteens.length})</Text>
      {canteens.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="frown" size={40} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No canteens open right now</Text>
        </View>
      ) : (
        <FlatList
          data={canteens}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CanteenCard 
              canteen={item}
              onViewMenu={handleViewMenu}
              onViewDetails={handleViewDetails}
              theme={theme}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function CanteenCard({ canteen, onViewMenu, onViewDetails, theme }) {
  const styles = getStyles(theme);
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
      onPress={() => onViewDetails(canteen)}
      activeOpacity={0.9}
    >
      {/* If image exists, show it. If not, show placeholder. */}
      {canteen.image ? (
        <Image source={canteen.image} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.canteenName, { color: theme.textPrimary }]}>{canteen.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{canteen.rating}</Text>
          </View>
        </View>

        <View style={styles.timingContainer}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <Text style={[styles.timingText, { color: theme.textSecondary }]}>
            {canteen.timings.map(([start, end]) => `${start}-${end}`).join(' • ')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: theme.buttonPrimary }]}
    onPress={() => onViewMenu(canteen)}
  >
    <Text style={[styles.buttonText, { color: 'white' }]}>Check Now</Text>
  </TouchableOpacity>
</View>

      </View>
    </TouchableOpacity>
  );
}

