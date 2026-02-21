import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, ImageBackground, Platform, ActivityIndicator, BackHandler, Animated, Dimensions, SafeAreaView, Switch, Linking, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { translations } from './translations';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Firebase Imports
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const LanguageContext = React.createContext();
const ScrollContext = React.createContext();

const ScrollProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    if (offset > 100 && !isCollapsed) {
      setIsCollapsed(true);
    } else if (offset < 50 && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <ScrollContext.Provider value={{ isCollapsed, setIsCollapsed, onScroll }}>
      {children}
    </ScrollContext.Provider>
  );
};

const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  const t = (key) => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const UserContext = React.createContext();

const SESSION_KEY = '@mineapp_user_session';

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    profileImage: null,
    listingsCount: 0,
    savedCount: 0
  });

  const updateUserData = useCallback((newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  }, []);

  // Save full session to AsyncStorage
  const saveSession = useCallback(async (data) => {
    try {
      const merged = { ...userData, ...data };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      setUserData(merged);
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [userData]);

  // Load session from AsyncStorage (called by App on startup)
  const loadSession = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        setUserData(JSON.parse(raw));
        return true; // session found
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
    return false; // no session
  }, []);

  // Clear session (called on Sign Out)
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUserData({
        name: '', phone: '', email: '', address: '',
        profileImage: null, listingsCount: 0, savedCount: 0
      });
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userData, updateUserData, saveSession, loadSession, logout }}>
      {children}
    </UserContext.Provider>
  );
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomHeader({ title, subtitle, navigation, showBack = false }) {
  return (
    <View style={styles.customHeaderContainer}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

// --- HomeScreen Component ---
function HomeScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const { userData } = React.useContext(UserContext);
  const { onScroll } = React.useContext(ScrollContext);

  const fullText = "Build Your Dream Home For Your Family";
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayText((prev) => {
        if (prev.length < fullText.length) {
          return fullText.substring(0, prev.length + 1);
        } else {
          return ""; // Loop back to start
        }
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const services = [
    { id: 'Construction', title: 'Construction', image: require('./assets/construction_3d.png') },
    { id: 'Renovation', title: 'Renovation', image: require('./assets/renovation_3d.png') },
    { id: 'Service', title: 'Service', image: require('./assets/services.png') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >

        <ImageBackground
          source={require('./assets/this.jpg')}
          style={{
            width: '100%',
            height: 320,
            justifyContent: 'flex-start',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            overflow: 'hidden'
          }}
          imageStyle={{
            height: 320,
            top: 0,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24
          }}
          resizeMode="cover"
        >
          <View style={[styles.uberHeader, { marginTop: Platform.OS === 'ios' ? 50 : 30, backgroundColor: 'transparent' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                {userData.profileImage ? (
                  <Image
                    source={{ uri: userData.profileImage }}
                    style={[styles.uberAvatar, { marginRight: 12, borderWidth: 2, borderColor: '#FFF' }]}
                  />
                ) : (
                  <View style={[styles.uberAvatar, { marginRight: 12, borderWidth: 2, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F3F3' }]}>
                    <MaterialCommunityIcons name="account" size={24} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>Hello, {userData.name.split(' ')[0]}</Text>
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: -1 }}>mine</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFF', marginTop: -8 }}>By MAHTO</Text>
          </View>
          <View style={{ paddingHorizontal: 20, marginBottom: 4, alignItems: 'center', height: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>{displayText}</Text>
          </View>
        </ImageBackground>

        <View style={[styles.uberServiceGrid, { marginTop: 32 }]}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.uberServiceCard, { backgroundColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }]}
              onPress={() => navigation.navigate(service.id)}
            >
              <View style={[styles.uberServiceIconBg, { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={service.image} style={{ width: 90, height: 90 }} resizeMode="contain" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.uberServiceTitle}>{service.title}</Text>
                <View style={{ marginLeft: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={[styles.uberSectionTitle, { marginBottom: 20, letterSpacing: -0.5 }]}>The MAHTO Difference</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '31%', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#2196F3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
                <MaterialCommunityIcons name="layers-triple-outline" size={30} color="#2196F3" />
              </View>
              <Text style={{ fontWeight: '800', fontSize: 13, textAlign: 'center', color: '#1A1A1A', marginBottom: 4 }}>Full Stack</Text>
              <Text style={{ color: '#777', fontSize: 10, textAlign: 'center', lineHeight: 14 }}>One team from plan to key.</Text>
            </View>

            <View style={{ width: '31%', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#9C27B0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
                <MaterialCommunityIcons name="account-hard-hat-outline" size={30} color="#9C27B0" />
              </View>
              <Text style={{ fontWeight: '800', fontSize: 13, textAlign: 'center', color: '#1A1A1A', marginBottom: 4 }}>Direct Labor</Text>
              <Text style={{ color: '#777', fontSize: 10, textAlign: 'center', lineHeight: 14 }}>No middlemen, direct execution.</Text>
            </View>

            <View style={{ width: '31%', alignItems: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
                <MaterialCommunityIcons name="tag-outline" size={30} color="#4CAF50" />
              </View>
              <Text style={{ fontWeight: '800', fontSize: 13, textAlign: 'center', color: '#1A1A1A', marginBottom: 4 }}>Factory Rate</Text>
              <Text style={{ color: '#777', fontSize: 10, textAlign: 'center', lineHeight: 14 }}>Sourced directly for you.</Text>
            </View>
          </View>
        </View>



        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            borderRadius: 24,
            padding: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
          }}
          onPress={() => navigation.navigate('AboutUs')}
        >
          <View style={{ flex: 1, zIndex: 1 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 }}>
              <Text style={{ color: '#FFB300', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>Premium Service</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6, letterSpacing: -0.5 }}>Full-Stack Construction</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 18, lineHeight: 20, fontWeight: '500' }}>
              End-to-end management by MAHTO experts. We bring your vision to life.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14, marginRight: 6 }}>Learn how it works</Text>
              <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#FFB300" />
            </View>
          </View>
          <View style={{ position: 'absolute', left: -20, bottom: -30, opacity: 0.12, transform: [{ rotate: '15deg' }] }}>
            <MaterialCommunityIcons name="hard-hat" size={160} color="#FFF" />
          </View>
          <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginLeft: 16, overflow: 'hidden' }}>
            <Image source={require('./assets/construction_3d.png')} style={{ width: 74, height: 74 }} resizeMode="contain" />
          </View>
        </TouchableOpacity>

        {/* ---- Ideas Section ---- */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('IdeasGallery')}
          style={{
            marginHorizontal: 20,
            marginBottom: 36,
            borderRadius: 24,
            backgroundColor: '#1A1A2E',
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
            overflow: 'hidden',
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 }}>
              <Text style={{ color: '#FFD700', fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>Inspiration</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 6, letterSpacing: -0.5 }}>💡 Ideas</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20, fontWeight: '500', marginBottom: 16 }}>
              Explore home, kitchen, bathroom, lawn & more design ideas.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#FFD700', fontWeight: '700', fontSize: 13, marginRight: 6 }}>Browse Ideas</Text>
              <MaterialCommunityIcons name="arrow-right-circle" size={18} color="#FFD700" />
            </View>
          </View>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center', marginLeft: 16 }}>
            <Text style={{ fontSize: 32 }}>🛋️</Text>
          </View>
          {/* Decorative background circle */}
          <View style={{ position: 'absolute', right: -30, bottom: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        </TouchableOpacity>


      </Animated.ScrollView>
    </View>
  );
}

// --- IdeasGalleryScreen Component ---
const ALL_IDEAS = [
  { label: 'Living Room', icon: 'sofa-outline', color: '#2196F3', bg: '#E3F2FD' },
  { label: 'Kitchen', icon: 'countertop-outline', color: '#FF9800', bg: '#FFF3E0' },
  { label: 'Bathroom', icon: 'shower', color: '#00BCD4', bg: '#E0F7FA' },
  { label: 'Dining Table', icon: 'table-furniture', color: '#9C27B0', bg: '#F3E5F5' },
  { label: 'Home Library', icon: 'bookshelf', color: '#795548', bg: '#EFEBE9' },
  { label: 'Lawn & Garden', icon: 'flower-outline', color: '#4CAF50', bg: '#E8F5E9' },
  { label: 'Bedroom', icon: 'bed-outline', color: '#E91E63', bg: '#FCE4EC' },
  { label: 'Front Elevation', icon: 'home-city', color: '#607D8B', bg: '#ECEFF1', image: require('./assets/raj.png') },
];

function IdeasGalleryScreen({ navigation }) {
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 48) / 2;
  const [selectedIdea, setSelectedIdea] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 48, paddingBottom: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 }}>💡 Ideas</Text>
          <Text style={{ fontSize: 12, color: '#888', fontWeight: '500', marginTop: 1 }}>Choose a category to get inspired</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {ALL_IDEAS.map((idea, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => idea.image ? setSelectedIdea(idea) : null}
              style={{
                width: cardWidth,
                marginBottom: 16,
                borderRadius: 20,
                backgroundColor: '#FFF',
                padding: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.07,
                shadowRadius: 12,
                elevation: 4,
                borderWidth: 1,
                borderColor: idea.image ? idea.color + '55' : '#F0F2F5',
              }}
            >
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: idea.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
                <MaterialCommunityIcons name={idea.icon} size={32} color={idea.color} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 4 }}>{idea.label}</Text>
              <Text style={{ fontSize: 11, color: idea.image ? idea.color : '#AAA', fontWeight: '600' }}>
                {idea.image ? 'Tap to view →' : 'Coming soon'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Full-screen image viewer modal */}
      <Modal
        visible={selectedIdea !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedIdea(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          {selectedIdea && (
            <>
              <View style={{ width: '100%', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 }}>{selectedIdea.label}</Text>
                <TouchableOpacity
                  onPress={() => setSelectedIdea(null)}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' }}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Image
                source={selectedIdea.image}
                style={{ width: '95%', height: '70%', borderRadius: 20 }}
                resizeMode="contain"
              />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 16, fontWeight: '500' }}>Tap ✕ to close</Text>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}



// --- ProfileScreen Component ---
function ProfileScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const { userData, logout } = React.useContext(UserContext);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const { onScroll } = React.useContext(ScrollContext);

  const menuItems = [
    { title: 'Edit Profile', icon: 'account-edit-outline', onPress: () => navigation.navigate('EditProfile') },
    { title: 'Settings', icon: 'cog-outline', onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ paddingTop: 60, paddingHorizontal: 20, alignItems: 'center' }}>
          {/* Profile Photo Centered */}
          <View style={{ marginBottom: 16 }}>
            {userData.profileImage ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F3F3' }}
              />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account" size={80} color="#000" />
              </View>
            )}
          </View>

          <Text style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>{userData.name}</Text>


          <View style={{ marginBottom: 32 }} />

          {/* Settings Section */}
          <View style={{ width: '100%', backgroundColor: '#F9F9F9', borderRadius: 16, padding: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#666', marginLeft: 12, marginTop: 12, marginBottom: 8, textTransform: 'uppercase' }}>Settings & Support</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: index === menuItems.length - 1 ? 0 : 1, borderBottomColor: '#EEE' }}
                onPress={item.onPress}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}>
                  <MaterialCommunityIcons name={item.icon} size={22} color="#000" />
                </View>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#000' }}>{item.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20, marginTop: 12 }}
            onPress={() => setLogoutVisible(true)}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <MaterialCommunityIcons name="logout" size={22} color="#FF3B30" />
            </View>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: '#FF3B30' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutVisible}
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutCard}>
            <Text style={styles.logoutTitle}>Sign out of your account?</Text>
            <Text style={styles.logoutMessage}>You'll need to sign back in to access your projects.</Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={async () => {
                setLogoutVisible(false);
                await logout();
                navigation.replace('Login');
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLogoutVisible(false)}
            >
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- SettingsScreen Component ---
function SettingsScreen({ navigation }) {
  const settingsSections = [
    {
      title: 'App Preferences',
      items: [
        { title: 'Notification Inbox', subtitle: 'View your message history', icon: 'email-receive-outline', color: '#E3F2FD', iconColor: '#2196F3', onPress: () => navigation.navigate('NotificationInbox') },
        { title: 'Notifications', subtitle: 'Manage alert sounds and types', icon: 'bell-outline', color: '#F3E5F5', iconColor: '#9C27B0', onPress: () => navigation.navigate('Notification') },
        { title: 'Languages', subtitle: 'Choose your preferred language', icon: 'translate', color: '#E8F5E9', iconColor: '#4CAF50', onPress: () => navigation.navigate('Languages') },
      ]
    },
    {
      title: 'Support & Feedback',
      items: [
        { title: 'About Us', subtitle: 'Learn more about MAHTO', icon: 'information-outline', color: '#FFF3E0', iconColor: '#FF9800', onPress: () => navigation.navigate('AboutUs') },
        { title: 'Contact Us', subtitle: 'Get in touch with our team', icon: 'headphones', color: '#E0F2F1', iconColor: '#009688', onPress: () => navigation.navigate('ContactUs') },
        { title: 'Rate Us', subtitle: 'Tell us what you think', icon: 'star-outline', color: '#FFFDE7', iconColor: '#FBC02D', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.mine.app') },
        { title: 'Help center/FAQ', subtitle: 'Common questions and answers', icon: 'frequently-asked-questions', color: '#F1F8E9', iconColor: '#8BC34A', onPress: () => navigation.navigate('HelpCenter') },
      ]
    },
    {
      title: 'Legal & Privacy',
      items: [
        { title: 'Terms & Condition', subtitle: 'App usage rules', icon: 'file-document-outline', color: '#FCE4EC', iconColor: '#E91E63', onPress: () => navigation.navigate('TermsCondition') },
        { title: 'Refund Policy', subtitle: 'Payment and return terms', icon: 'cash-refund', color: '#FFF8E1', iconColor: '#FFC107', onPress: () => navigation.navigate('RefundPolicy') },
        { title: 'Privacy Policy', subtitle: 'How we protect your data', icon: 'shield-lock-outline', color: '#E8EAF6', iconColor: '#3F51B5', onPress: () => navigation.navigate('PrivacyPolicy') },
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { title: 'Delete Account', subtitle: 'Permanently remove your data', icon: 'delete-forever-outline', color: '#FFEBEE', iconColor: '#F44336', onPress: () => navigation.navigate('DeleteAccount') },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <CustomHeader
        title="Settings"
        subtitle="Manage your app preferences"
        navigation={navigation}
        showBack={true}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}>
        {settingsSections.map((section, sIndex) => (
          <View key={sIndex} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{section.title}</Text>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: iIndex === section.items.length - 1 ? 0 : 1,
                    borderBottomColor: '#F8F8F8'
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: item.color, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 4, fontWeight: '500' }}>{item.subtitle}</Text>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#BBB" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}



// --- NotificationInboxScreen Component ---
function NotificationInboxScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Notification Inbox" navigation={navigation} showBack={true} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <MaterialCommunityIcons name="email-open-outline" size={80} color="#EEE" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#AAA', marginTop: 16 }}>Your inbox is empty</Text>
        <Text style={{ fontSize: 14, color: '#CCC', textAlign: 'center', marginTop: 8 }}>We'll notify you here when there's something new.</Text>
      </View>
    </SafeAreaView>
  );
}

// --- DeleteAccountScreen Component ---
function DeleteAccountScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter your phone and password to confirm.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you absolutely sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              Alert.alert("Account Deleted", "Your account has been permanently removed.");
              // Reset navigation to a hypothetical landing/auth screen or logout
              navigation.navigate('Root');
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Delete Account" navigation={navigation} showBack={true} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 20 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <MaterialCommunityIcons name="alert-octagon" size={60} color="#FF3B30" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>Account Deletion</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            This action is permanent. All your data, including projects, saved properties, and history, will be lost forever.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Phone Number</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F9F9F9', borderHorizontalWidth: 1, borderColor: '#EEE' }]}>
            <MaterialCommunityIcons name="phone" size={20} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F9F9F9', borderHorizontalWidth: 1, borderColor: '#EEE' }]}>
            <MaterialCommunityIcons name="lock" size={20} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#FF3B30', marginTop: 24, shadowColor: '#FF3B30', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Permanently Delete Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 20, alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#666', fontWeight: '600' }}>Cancel and Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- EditProfileScreen Component ---
function EditProfileScreen({ navigation }) {
  const { userData, updateUserData } = React.useContext(UserContext);

  const [name, setName] = useState(userData.name);
  const [phone, setPhone] = useState(userData.phone);
  const [email, setEmail] = useState(userData.email);
  const [address, setAddress] = useState(userData.address);
  const [profileImage, setProfileImage] = useState(userData.profileImage);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to fetch address.');
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        const formattedAddress = `${addr.street || ''} ${addr.name || ''}, ${addr.city}, ${addr.region}, ${addr.postalCode}, ${addr.country}`;
        setAddress(formattedAddress.replace(/ ,/g, ''));
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri || uri.startsWith('http')) return uri;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profiles/${userData.phone.replace(/[^0-9]/g, '') || Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (e) {
      console.error("Upload failed", e);
      return uri;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let finalImageUrl = profileImage;

    if (profileImage && !profileImage.startsWith('http')) {
      finalImageUrl = await uploadImage(profileImage);
    }

    updateUserData({ name, phone, email, address, profileImage: finalImageUrl });
    setSaving(false);
    Alert.alert('Success', 'Profile updated successfully!');
    navigation.goBack();
  };

  const renderInputCard = (title, items) => (
    <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{title}</Text>
      <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 16, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
        {items.map((item, index) => (
          <View key={index} style={{ marginBottom: index === items.length - 1 ? 0 : 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: item.bg, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                <MaterialCommunityIcons name={item.icon} size={16} color={item.iconColor} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#444' }}>{item.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F0F2F5', height: item.multiline ? 80 : 50, paddingHorizontal: 16, justifyContent: 'center' }}>
                <TextInput
                  style={{ fontSize: 15, color: '#1A1A1A', height: '100%' }}
                  value={item.value}
                  onChangeText={item.onChange}
                  placeholder={item.placeholder}
                  keyboardType={item.keyboardType || 'default'}
                  multiline={item.multiline}
                  textAlignVertical={item.multiline ? 'top' : 'center'}
                />
              </View>
              {item.rightAction && (
                <TouchableOpacity
                  onPress={item.rightAction}
                  disabled={item.loading}
                  style={{ marginLeft: 10, width: 50, height: 50, borderRadius: 12, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}
                >
                  {item.loading ? <ActivityIndicator size="small" color="#FFF" /> : <MaterialCommunityIcons name={item.rightIcon} size={22} color="#FFF" />}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title="Edit Profile"
          subtitle="Keep your information up to date"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ alignItems: 'center', marginVertical: 32 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: '#FFF', backgroundColor: '#F3F4F6', overflow: 'hidden', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10 }}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="account" size={80} color="#D1D5DB" />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.9}
              style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: '#000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', elevation: 4 }}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {renderInputCard('Basic Information', [
          { label: 'Full Name', value: name, onChange: setName, icon: 'account-outline', bg: '#E3F2FD', iconColor: '#2196F3', placeholder: 'Enter your name' },
          { label: 'Email Address', value: email, onChange: setEmail, icon: 'email-outline', bg: '#F3E5F5', iconColor: '#9C27B0', placeholder: 'Enter your email', keyboardType: 'email-address' },
        ])}

        {renderInputCard('Contact & Location', [
          { label: 'Phone Number', value: phone, onChange: setPhone, icon: 'phone-outline', bg: '#E8F5E9', iconColor: '#4CAF50', placeholder: 'Enter phone number', keyboardType: 'phone-pad' },
          { label: 'Address', value: address, onChange: setAddress, icon: 'map-marker-outline', bg: '#FFF3E0', iconColor: '#FF9800', placeholder: 'Enter your address', multiline: true, rightAction: getCurrentLocation, rightIcon: 'crosshairs-gps', loading: loadingLocation },
        ])}

        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
            style={{ backgroundColor: '#000', borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- NotificationScreen Component ---
function NotificationScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [promoEnabled, setPromoEnabled] = useState(false);

  const toggleSwitch = (type) => {
    switch (type) {
      case 'push': setPushEnabled(!pushEnabled); break;
      case 'email': setEmailEnabled(!emailEnabled); break;
      case 'sms': setSmsEnabled(!smsEnabled); break;
      case 'promo': setPromoEnabled(!promoEnabled); break;
    }
  };

  const renderSection = (title, items) => (
    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
      <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{title}</Text>
      <View style={{ backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
        {items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
              borderBottomWidth: index === items.length - 1 ? 0 : 1,
              borderBottomColor: '#F8F8F8'
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: item.bg, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 4, fontWeight: '500' }}>{item.subtitle}</Text>
            </View>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#000" }}
              thumbColor="#FFF"
              ios_backgroundColor="#E0E0E0"
              onValueChange={item.onToggle}
              value={item.value}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title={t('notification')}
          subtitle="Manage your alert preferences"
          navigation={navigation}
          showBack={true}
        />

        {renderSection(t('general'), [
          { title: t('pushNotif'), subtitle: 'Receive alerts on your device', icon: 'bell-ring-outline', bg: '#E3F2FD', iconColor: '#2196F3', value: pushEnabled, onToggle: () => toggleSwitch('push') },
          { title: t('emailNotif'), subtitle: 'Receive updates via email', icon: 'email-outline', bg: '#F3E5F5', iconColor: '#9C27B0', value: emailEnabled, onToggle: () => toggleSwitch('email') },
          { title: t('smsNotif'), subtitle: 'Receive updates via SMS', icon: 'message-text-outline', bg: '#E8F5E9', iconColor: '#4CAF50', value: smsEnabled, onToggle: () => toggleSwitch('sms') },
        ])}

        {renderSection(t('marketing'), [
          { title: t('promoOffers'), subtitle: 'Get updates on sales and offers', icon: 'tag-outline', bg: '#FFF3E0', iconColor: '#FF9800', value: promoEnabled, onToggle: () => toggleSwitch('promo') },
        ])}

        <View style={{ paddingHorizontal: 30, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 16 }}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#666" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#666', lineHeight: 18 }}>
              Stay updated with your project progress and latest offers. You can change these preferences anytime.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- LanguageScreen Component ---
function LanguageScreen({ navigation }) {
  const { setLocale, locale, t } = React.useContext(LanguageContext);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'ks', name: 'Kashmiri', native: 'کأشُر' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'raj', name: 'Rajasthani', native: 'राजस्थानी' },
    { code: 'bgc', name: 'Haryanvi', native: 'हरियाणवी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  ];

  const handleLanguageSelect = (code) => {
    setLocale(code);
    Alert.alert('Language Updated', 'App language has been updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title={t('languages')}
          subtitle="Choose your preferred language"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>Available Languages</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
            {languages.map((lang, index) => {
              const isSelected = locale === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleLanguageSelect(lang.code)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 18,
                    backgroundColor: isSelected ? '#F8F9FA' : '#FFF',
                    borderBottomWidth: index === languages.length - 1 ? 0 : 1,
                    borderBottomColor: '#F8F8F8'
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isSelected ? '#000' : '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? '#FFF' : '#666' }}>{lang.code.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? '#000' : '#1A1A1A' }}>{lang.name}</Text>
                    <Text style={{ fontSize: 12, color: isSelected ? '#444' : '#999', marginTop: 4, fontWeight: '500' }}>{lang.native}</Text>
                  </View>
                  {isSelected && (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 30, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 16 }}>
            <MaterialCommunityIcons name="translate" size={20} color="#666" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#666', lineHeight: 18 }}>
              Changing language will update most of the interface text. More translations are being added regularly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- HelpCenterScreen Component ---
function HelpCenterScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    {
      title: 'Booking & Services',
      items: [
        { question: 'How do I book a service?', answer: 'Simply navigate to the service category you need (Construction, Renovation, or Service), select a specific service, and follow the booking prompts.' },
        { question: 'How can I track my request?', answer: 'You can track the status of your service requests in the "My Orders" section (coming soon).' },
      ]
    },
    {
      title: 'Payments & Policies',
      items: [
        { question: 'Is there a cancellation fee?', answer: 'Cancellations made within 24 hours of the scheduled service may incur a small fee. Please check our Terms & Conditions for more details.' },
        { question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, UPIs, and net banking for all transactions.' },
      ]
    },
    {
      title: 'Technical Support',
      items: [
        { question: 'App is freezing/not working', answer: 'Try restarting the app. if the problem persists, please report a bug via the contact section below.' },
      ]
    }
  ];

  const contactOptions = [
    { title: 'Report a Bug', icon: 'bug-outline', bg: '#FFEBEE', color: '#F44336', action: () => Linking.openURL('mailto:support@mahtoji.tech?subject=Bug Report') },
    { title: 'Feature Request', icon: 'lightbulb-on-outline', bg: '#FFFDE7', color: '#FBC02D', action: () => Linking.openURL('mailto:support@mahtoji.tech?subject=Feature Request') },
    { title: 'CEO Office', icon: 'medal-outline', bg: '#E8EAF6', color: '#3F51B5', action: () => Linking.openURL('mailto:harshkumarceo@mahtoji.tech?subject=CEO Office Inquiry') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title={t('helpCenter')}
          subtitle="How can we help you today?"
          navigation={navigation}
          showBack={true}
        />

        {/* Categories & FAQs */}
        {categories.map((cat, cIdx) => (
          <View key={cIdx} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{cat.title}</Text>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 8, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
              {cat.items.map((faq, fIdx) => {
                const globalIdx = `${cIdx}-${fIdx}`;
                const isExpanded = expandedIndex === globalIdx;
                return (
                  <TouchableOpacity
                    key={fIdx}
                    onPress={() => setExpandedIndex(isExpanded ? null : globalIdx)}
                    activeOpacity={0.7}
                    style={{
                      padding: 16,
                      borderBottomWidth: fIdx === cat.items.length - 1 ? 0 : 1,
                      borderBottomColor: '#F8F8F8'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A1A', lineHeight: 20 }}>{faq.question}</Text>
                      <MaterialCommunityIcons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={isExpanded ? "#000" : "#BBB"}
                      />
                    </View>
                    {isExpanded && (
                      <Text style={{ fontSize: 13, color: '#666', marginTop: 12, lineHeight: 20 }}>
                        {faq.answer}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Still Need Help? */}
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>Still Need Help?</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 12, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
            {contactOptions.map((opt, oIdx) => (
              <TouchableOpacity
                key={oIdx}
                onPress={opt.action}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderBottomWidth: oIdx === contactOptions.length - 1 ? 0 : 1,
                  borderBottomColor: '#F8F8F8'
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: opt.bg, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name={opt.icon} size={20} color={opt.color} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>{opt.title}</Text>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#BBB" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={{ paddingHorizontal: 30, marginTop: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#AAA" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#AAA', fontWeight: '500' }}>Average Response Time: 24-48 Hours</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ResidentialBuildScreen Component ---
function ResidentialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Consultation', desc: 'Discuss your vision and budget.', icon: 'account-voice', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'Design & Planning', desc: 'Architectural drawings & 3D modeling.', icon: 'pencil-ruler', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Construction', desc: 'Building with premium quality materials.', icon: 'hammer-wrench', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Handover', desc: 'Final inspection & key delivery.', icon: 'key-variant', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Residential Build"
          subtitle="Your Dream Home, Our Expertise."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#0047AB',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#0047AB',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="home-city-outline" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Custom Homes</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              From modern villas to cozy cottages, we specialize in building residential properties that stand the test of time.
            </Text>
          </View>
        </View>

        {/* Steps Section as Stylish Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>How We Work</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Start Your Project</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- CommercialBuildScreen Component ---
function CommercialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Project Scoping', desc: 'Define precise requirements for scale.', icon: 'file-document-outline', color: '#00BCD4', bg: '#E0F7FA' },
    { title: 'Design & Code', desc: 'Strict compliance with planning codes.', icon: 'ruler-square', color: '#3F51B5', bg: '#E8EAF6' },
    { title: 'Execution', desc: 'Minimal downtime & rapid delivery.', icon: 'hard-hat', color: '#FF5722', bg: '#FBE9E7' },
    { title: 'Launch', desc: 'Final checks for an impressive opening.', icon: 'rocket-launch-outline', color: '#E91E63', bg: '#FCE4EC' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Commercial Projects"
          subtitle="Spaces for Business Success."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#002B5B', // Deep, professional navy
            borderRadius: 24,
            padding: 28,
            shadowColor: '#002B5B',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="office-building" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Business Infrastructure</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              We build modern commercial spaces, from retail stores to corporate offices, designed to enhance productivity and impress your clients.
            </Text>
          </View>
        </View>

        {/* Steps Section as Stylish Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Our Process</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Get a Quote</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- IndustrialBuildScreen Component ---
// --- IndustrialBuildScreen Component ---
function IndustrialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Site Analysis', desc: 'Evaluating terrain & logistics.', icon: 'map-search-outline', color: '#607D8B', bg: '#ECEFF1' },
    { title: 'Heavy Engineering', desc: 'Structural integrity for machinery.', icon: 'robot-industrial', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Safety Systems', desc: 'Implementing strict protocols.', icon: 'shield-alert-outline', color: '#E53935', bg: '#FFEBEE' },
    { title: 'Operations Transfer', desc: 'Seamless handover for use.', icon: 'truck-delivery-outline', color: '#43A047', bg: '#E8F5E9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Industrial Construction"
          subtitle="Built for Heavy Duty."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#1C1C1E', // Very dark gray, almost black
            borderRadius: 24,
            padding: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#333',
          }}>
            <MaterialCommunityIcons name="factory" size={64} color="#FFB300" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Industrial Solutions</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Robust construction for factories, warehouses, and industrial plants. We prioritize uncompromising safety, durability, and operational efficiency.
            </Text>
          </View>
        </View>

        {/* Steps Section as Stylish Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Key Steps</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#FFB300', // Warning/Industrial yellow-orange
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#FFB300',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#000', fontSize: 17, fontWeight: '900', marginRight: 10, letterSpacing: 0.5 }}>Consult Engineers</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#000" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ProjectManagementScreen Component ---
function ProjectManagementScreen({ navigation }) {
  const features = [
    { title: 'Timeline Control', desc: 'Strict tracking of deadlines.', icon: 'calendar-clock-outline', color: '#8E24AA', bg: '#F3E5F5' },
    { title: 'Cost Budgeting', desc: 'Precise resource allocation.', icon: 'finance', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'Quality Checks', desc: 'Rigorous standard inspections.', icon: 'check-decagram-outline', color: '#1976D2', bg: '#E3F2FD' },
    { title: 'Vendor Sync', desc: 'Managing all subcontractors.', icon: 'account-group-outline', color: '#FF9800', bg: '#FFF3E0' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Project Management"
          subtitle="Orchestrating Success."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#4A148C', // Deep, rich purple for management/orchestration
            borderRadius: 24,
            padding: 28,
            shadowColor: '#4A148C',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>End-to-End Control</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              We take the stress out of construction. Our expert managers ensure your project is completed on time, within budget, and to the highest industry standards.
            </Text>
          </View>
        </View>

        {/* Steps Section as Stylish Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Our Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {features.map((item, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Hire a Manager</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ContactUsScreen Component ---
// --- ContactUsScreen Component ---
function ContactUsScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);

  const contactChannels = [
    {
      title: 'Direct Support',
      items: [
        { title: 'General Support', subtitle: 'For bugs, features, or queries', icon: 'email-outline', bg: '#E3F2FD', iconColor: '#2196F3', action: () => Linking.openURL('mailto:support@mahtoji.tech') },
        { title: 'CEO\'s Office', subtitle: 'For critical escalations', icon: 'medal-outline', bg: '#FFF3E0', iconColor: '#FF9800', action: () => Linking.openURL('mailto:harshkumarceo@mahtoji.tech') },
      ]
    },
    {
      title: 'Operating Hours',
      items: [
        { title: 'Response Time', subtitle: 'Expect a reply within 24-48 hours', icon: 'clock-outline', bg: '#F3E5F5', iconColor: '#9C27B0', action: null },
        { title: 'Working Days', subtitle: 'Monday to Saturday (9 AM - 5 PM)', icon: 'calendar-check-outline', bg: '#E8F5E9', iconColor: '#4CAF50', action: null },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title={t('contactUs')}
          subtitle="We're here to help you build better"
          navigation={navigation}
          showBack={true}
        />

        {contactChannels.map((section, sIndex) => (
          <View key={sIndex} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{section.title}</Text>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  onPress={item.action}
                  disabled={!item.action}
                  activeOpacity={item.action ? 0.7 : 1}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 18,
                    borderBottomWidth: iIndex === section.items.length - 1 ? 0 : 1,
                    borderBottomColor: '#F8F8F8'
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: item.bg, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 4, fontWeight: '500' }}>{item.subtitle}</Text>
                  </View>
                  {item.action && (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#BBB" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ paddingHorizontal: 30, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F8F9FA', padding: 18, borderRadius: 20 }}>
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#666" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#666', lineHeight: 20 }}>
              <Text style={{ fontWeight: 'bold', color: '#444' }}>Pro Tip:</Text> Please attach screenshots or photos when reporting bugs to help our engineers fix them faster.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ConstructionScreen Component ---
function ConstructionScreen({ navigation }) {
  const constructionServices = [
    { title: 'Home Construction', icon: 'home-city-outline', image: require('./assets/homeconstruction.png'), details: 'Custom homes built from the ground up.', route: 'ResidentialBuild', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'Residential Building', icon: 'domain', image: require('./assets/resendential.png'), details: 'Multi-story apartment & residential complexes.', route: 'ResidentialBuild', color: '#00BCD4', bg: '#E0F7FA' },
    { title: 'Commercial Projects', icon: 'office-building', image: require('./assets/commercial.png'), details: 'Offices, retail spaces, and warehouses.', route: 'CommercialBuild', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Industrial Construction', icon: 'factory', image: require('./assets/industrial.png'), details: 'Heavy-duty construction for industrial needs.', route: 'IndustrialBuild', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Project Management', icon: 'clipboard-list-outline', image: require('./assets/management.png'), details: 'End-to-end management of your build.', route: 'ProjectManagement', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Construction"
          subtitle="Building your dreams with precision."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#FF7F50', // A vibrant coral
            borderRadius: 24,
            padding: 28,
            shadowColor: '#FF7F50',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="hard-hat" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Master Builders</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              We transform blueprints into reality with uncompromising quality, safety, and architectural excellence.
            </Text>
          </View>
        </View>

        {/* Categories Section as Stylish Square Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Our Sectors</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {constructionServices.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => item.route && navigation.navigate(item.route)}
                style={{
                  width: '47.5%',
                  backgroundColor: '#FFF',
                  padding: 20,
                  borderRadius: 24,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: '#F0F2F5',
                  marginBottom: 16,
                }}
              >
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  backgroundColor: item.image ? 'transparent' : item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  {item.image ? (
                    <ExpoImage source={item.image} style={{ width: 100, height: 100, borderRadius: 24 }} contentFit="cover" />
                  ) : (
                    <MaterialCommunityIcons name={item.icon} size={64} color={item.color} />
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#666', lineHeight: 16, fontWeight: '500', textAlign: 'center' }}>{item.details}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- RenovationScreen Component ---
function RenovationScreen({ navigation }) {
  const renovationServices = [
    { title: 'Kitchen Remodel', icon: 'silverware-fork-knife', image: require('./assets/kitchen.png'), details: 'Modern designs for your home heart.', route: 'KitchenRemodel', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Bathroom Upgrade', icon: 'shower', image: require('./assets/bathroom.png'), details: 'Spa-like retreats & functional layouts.', route: 'BathroomUpgrade', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Flooring', icon: 'floor-plan', image: require('./assets/flooring.png'), details: 'Hardwood, tile, & vinyl installation.', route: 'FlooringMakeover', color: '#795548', bg: '#EFEBE9' },
    { title: 'Full Home Makeover', icon: 'home-circle-outline', image: require('./assets/fullhome.png'), details: 'Complete living space transformation.', route: 'FullHomeMakeover', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'Home Painting', icon: 'format-paint', image: require('./assets/painting.png'), details: 'Professional interior & exterior work.', route: 'HomePainting', color: '#E91E63', bg: '#FCE4EC' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Renovation"
          subtitle="Revitalize your improved space."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#9C27B0', // Purple for creativity/renovation
            borderRadius: 24,
            padding: 28,
            shadowColor: '#9C27B0',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="home-edit-outline" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Transform Your Space</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              From modern kitchens to serene bathrooms, we bring new life to your home with expert craftsmanship and premium materials.
            </Text>
          </View>
        </View>

        {/* Categories Section as Stylish Square Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Renovation Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {renovationServices.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => item.route && navigation.navigate(item.route)}
                style={{
                  width: '47.5%',
                  backgroundColor: '#FFF',
                  padding: 20,
                  borderRadius: 24,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: '#F0F2F5',
                  marginBottom: 16,
                }}
              >
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  backgroundColor: item.image ? 'transparent' : item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  {item.image ? (
                    <ExpoImage source={item.image} style={{ width: 100, height: 100, borderRadius: 24 }} contentFit="cover" />
                  ) : (
                    <MaterialCommunityIcons name={item.icon} size={64} color={item.color} />
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#666', lineHeight: 16, fontWeight: '500', textAlign: 'center' }}>{item.details}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Renovation Detail Screens ---
function KitchenRemodelScreen({ navigation }) {
  const steps = [
    { title: 'Layout Optimization', desc: 'Improving workflow and space.', icon: 'arrow-expand-all', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Cabinetry', desc: 'Custom smart storage solutions.', icon: 'cupboard', color: '#795548', bg: '#EFEBE9' },
    { title: 'Countertops', desc: 'Granite, quartz, and marble.', icon: 'texture-box', color: '#607D8B', bg: '#ECEFF1' },
    { title: 'Appliances', desc: 'Integration of modern fixtures.', icon: 'lightbulb-on-outline', color: '#2196F3', bg: '#E3F2FD' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Kitchen Remodel" subtitle="The Heart of Your Home." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#FF9800',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#FF9800',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="chef-hat" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Culinary Masterpiece</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Transform your kitchen into a modern, functional, and stylish space perfect for cooking and gathering.
            </Text>
          </View>
        </View>

        {/* Steps Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>What We Offer</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Plan My Kitchen</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function BathroomUpgradeScreen({ navigation }) {
  const steps = [
    { title: 'Luxury Fixtures', desc: 'Rain showers & modern faucets.', icon: 'water-pump', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Tile & Flooring', desc: 'Water-resistant stylish options.', icon: 'checkerboard', color: '#00BCD4', bg: '#E0F7FA' },
    { title: 'Vanity & Storage', desc: 'Elegant vanities with space.', icon: 'dresser', color: '#9C27B0', bg: '#F3E5F5' },
    { title: 'Ventilation', desc: 'Mood lighting & air circulation.', icon: 'fan', color: '#4CAF50', bg: '#E8F5E9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Bathroom Upgrade" subtitle="Your Personal Spa." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#00BCD4',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#00BCD4',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="shower-head" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Refresh & Relax</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Upgrade your bathroom into a serene retreat with modern amenities and luxurious finishes.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Features</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Upgrade Bathroom</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FlooringMakeoverScreen({ navigation }) {
  const steps = [
    { title: 'Hardwood', desc: 'Timeless elegance & durability.', icon: 'tree', color: '#795548', bg: '#EFEBE9' },
    { title: 'Ceramic Tile', desc: 'Versatile and easy to maintain.', icon: 'grid', color: '#607D8B', bg: '#ECEFF1' },
    { title: 'Luxury Vinyl', desc: 'Waterproof and cost-effective.', icon: 'layers', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Carpet', desc: 'Soft comfort for living areas.', icon: 'rug', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Flooring" subtitle="Foundation of Style." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#795548',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#795548',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="floor-plan" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Step into Luxury</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Choose from a wide range of premium flooring options to elevate the look and feel of your home.
            </Text>
          </View>
        </View>

        {/* Options Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Options</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Get Flooring Quote</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FullHomeMakeoverScreen({ navigation }) {
  const steps = [
    { title: 'Concept Design', desc: 'Holistic vision for entire home.', icon: 'lightbulb-on-outline', color: '#FFB300', bg: '#FFF8E1' },
    { title: 'Structure', desc: 'Wall removal & reconfiguration.', icon: 'wall', color: '#D32F2F', bg: '#FFEBEE' },
    { title: 'Systems Update', desc: 'Plumbing, electric & HVAC.', icon: 'lightning-bolt-outline', color: '#1976D2', bg: '#E3F2FD' },
    { title: 'Finishing', desc: 'Paint, trim, and decor styling.', icon: 'palette-outline', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Full Home Makeover" subtitle="Complete Transformation." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#4CAF50',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#4CAF50',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="home-modern" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Reimagine Your Home</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              A comprehensive renovation service to completely transform your living space into your dream home.
            </Text>
          </View>
        </View>

        {/* Approach Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Our Approach</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Start Makeover</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomePaintingScreen({ navigation }) {
  const steps = [
    { title: 'Color Consultation', desc: 'Expert advice on palettes.', icon: 'palette-swatch-outline', color: '#E91E63', bg: '#FCE4EC' },
    { title: 'Surface Prep', desc: 'Repairing imperfections.', icon: 'format-paint', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Interior Painting', desc: 'Walls, ceilings, and trim.', icon: 'roller-skate', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Exterior Painting', desc: 'Durable finishes for appeal.', icon: 'home-roof', color: '#4CAF50', bg: '#E8F5E9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Home Painting" subtitle="A Fresh Coat of Life." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#EC407A',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#EC407A',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="format-paint" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Vibrant Spaces</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Professional interior and exterior painting services to refresh your home and protect your investment.
            </Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {steps.map((step, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: step.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={step.icon} size={26} color={step.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {step.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Get Painting Quote</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ServiceScreen Component ---
function ServiceScreen({ navigation }) {
  const serviceOptions = [
    { title: 'Plumbing', icon: 'water-pump', image: require('./assets/plumbing.png'), details: 'Leak repairs, installs, & maintenance.', route: 'Plumbing', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Electrical', icon: 'flash', image: require('./assets/electrical.png'), details: 'Wiring, lighting, & safety checks.', route: 'Electrical', color: '#FFB300', bg: '#FFF8E1' },
    { title: 'HVAC', icon: 'air-conditioner', image: require('./assets/hvac.png'), details: 'Heating, ventilation, & air systems.', route: 'HVAC', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'General Repairs', icon: 'hammer-wrench', image: require('./assets/genral.png'), details: 'Small fixes before they grow.', route: 'GeneralRepairs', color: '#E91E63', bg: '#FCE4EC' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Maintenance"
          subtitle="Reliable repairs when you need them."
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#075E54', // Deep green for reliability/maintenance
            borderRadius: 24,
            padding: 28,
            shadowColor: '#075E54',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="tools" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Service & Care</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Your home deserves the best care. From sudden leaks to scheduled safety checks, our experts are just a tap away.
            </Text>
          </View>
        </View>

        {/* Categories Section as Stylish Square Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Maintenance Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {serviceOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => item.route && navigation.navigate(item.route)}
                style={{
                  width: '47.5%',
                  backgroundColor: '#FFF',
                  padding: 20,
                  borderRadius: 24,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.06,
                  shadowRadius: 16,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: '#F0F2F5',
                  marginBottom: 16,
                }}
              >
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  backgroundColor: item.image ? 'transparent' : item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  {item.image ? (
                    <ExpoImage source={item.image} style={{ width: 100, height: 100, borderRadius: 24 }} contentFit="cover" />
                  ) : (
                    <MaterialCommunityIcons name={item.icon} size={64} color={item.color} />
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#666', lineHeight: 16, fontWeight: '500', textAlign: 'center' }}>{item.details}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Maintenance Service Components ---

function PlumbingScreen({ navigation }) {
  const services = [
    { title: 'Leak Detection', desc: 'Finding hidden leaks.', icon: 'water-off-outline', color: '#2196F3', bg: '#E3F2FD' },
    { title: 'Pipe Repair', desc: 'Replace old or burst pipes.', icon: 'pipe', color: '#1E88E5', bg: '#E0E3FF' },
    { title: 'Fixture Install', desc: 'Faucets, sinks, and toilets.', icon: 'toilet', color: '#0288D1', bg: '#E1F5FE' },
    { title: 'Drain Clean', desc: 'Unclogging drains fast.', icon: 'water-remove-outline', color: '#0277BD', bg: '#E1F5FE' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Plumbing Services" subtitle="Expert Flow Control." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#2196F3',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#2196F3',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="water-pump" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Reliable Plumbing</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              From emergency repairs to scheduled maintenance, our plumbers ensure your water systems run smoothly.
            </Text>
          </View>
        </View>

        {/* Steps Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Our Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {services.map((item, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Call a Plumber</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ElectricalScreen({ navigation }) {
  const services = [
    { title: 'Wiring & Rewiring', desc: 'Safe legal infrastructure.', icon: 'power-plug', color: '#FFB300', bg: '#FFF8E1' },
    { title: 'Lighting Install', desc: 'Smart, LED, and ambient.', icon: 'ceiling-light', color: '#FBC02D', bg: '#FFFDE7' },
    { title: 'Panel Upgrades', desc: 'Modernize circuit breakers.', icon: 'flash-alert-outline', color: '#FF9800', bg: '#FFF3E0' },
    { title: 'Safety Checks', desc: 'Compliance & hazard checks.', icon: 'shield-check-outline', color: '#4CAF50', bg: '#E8F5E9' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Electrical Services" subtitle="Powering Your Life." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#FFB300',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#FFB300',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="flash-outline" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Expert Electricians</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Certified electricians for all your residential and commercial electrical needs. Safety and precision guaranteed.
            </Text>
          </View>
        </View>

        {/* Steps Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>What We Do</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {services.map((item, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Book Electrician</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HVACScreen({ navigation }) {
  const services = [
    { title: 'AC Installation', desc: 'Split, window, & central AC.', icon: 'air-conditioner', color: '#4CAF50', bg: '#E8F5E9' },
    { title: 'Heater Repair', desc: 'Furnace and heater maintenance.', icon: 'fire-circle', color: '#FF5722', bg: '#FBE9E7' },
    { title: 'Duct Cleaning', desc: 'Improving indoor air quality.', icon: 'weather-windy', color: '#03A9F4', bg: '#E1F5FE' },
    { title: 'Smart Setup', desc: 'Smart climate control solutions.', icon: 'thermometer-lines', color: '#673AB7', bg: '#EDE7F6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="HVAC Services" subtitle="Comfort in All Seasons." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#4CAF50',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#4CAF50',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="air-conditioner" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Climate Control</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Keep your home cool in summer and warm in winter with our professional HVAC installation and services.
            </Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>Services</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {services.map((item, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Schedule Service</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function GeneralRepairsScreen({ navigation }) {
  const services = [
    { title: 'Handyman', desc: 'Furniture, mounting, & more.', icon: 'account-hard-hat-outline', color: '#E91E63', bg: '#FCE4EC' },
    { title: 'Drywall Repair', desc: 'Patching holes and cracks.', icon: 'wall', color: '#795548', bg: '#EFEBE9' },
    { title: 'Door & Window', desc: 'Fixing jams, locks, & hinges.', icon: 'door-open', color: '#1976D2', bg: '#E3F2FD' },
    { title: 'Touch-ups', desc: 'Small area professional painting.', icon: 'format-paint', color: '#9C27B0', bg: '#F3E5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="General Repairs" subtitle="Small Fixes, Big Impact." navigation={navigation} showBack={true} />

        {/* Hero Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <View style={{
            backgroundColor: '#E91E63',
            borderRadius: 24,
            padding: 28,
            shadowColor: '#E91E63',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
            alignItems: 'center',
          }}>
            <MaterialCommunityIcons name="hammer-wrench" size={64} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 12, letterSpacing: 0.5 }}>Home Maintenance</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Don't let small problems become big headaches. Our general repair services cover all the odd jobs around your house.
            </Text>
          </View>
        </View>

        {/* What We Fix Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, paddingLeft: 4, letterSpacing: 0.5 }}>What We Fix</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {services.map((item, index) => (
              <View key={index} style={{
                width: '47.5%',
                backgroundColor: '#FFF',
                padding: 18,
                borderRadius: 22,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.2, flexShrink: 1 }}>{index + 1}. {item.title}</Text>
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
                    <MaterialCommunityIcons name="chevron-right" size={14} color="#000" />
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#777', lineHeight: 18, fontWeight: '500' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={{
            marginHorizontal: 20,
            backgroundColor: '#1A1A1A',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('ContactUs')}
        >
          <Text style={{ color: '#FFF', fontSize: 17, fontWeight: '800', marginRight: 10, letterSpacing: 0.5 }}>Request Handyman</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- TermsConditionScreen Component ---
function TermsConditionScreen({ navigation }) {
  const content = [
    {
      title: "1. Introduction",
      icon: "handshake-outline",
      bg: "#E3F2FD",
      iconColor: "#2196F3",
      text: "Welcome to MAHTO. By accessing or using our platform, you agree to represent that you are at least 18 years old and capable of entering into binding contracts. These Terms & Conditions govern your use of our website, mobile application, and services."
    },
    {
      title: "2. User Accounts",
      icon: "account-box-outline",
      bg: "#F3E5F5",
      iconColor: "#9C27B0",
      text: "To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      title: "3. Services",
      icon: "cog-transfer-outline",
      bg: "#E8F5E9",
      iconColor: "#4CAF50",
      text: "MAHTO connects users with construction professionals, material suppliers, and financial services. We act as a facilitator and platform provider. While we vet our partners, the final service agreement is between you and the service provider."
    },
    {
      title: "4. Payments",
      icon: "credit-card-outline",
      bg: "#FFF3E0",
      iconColor: "#FF9800",
      text: "All payments made through the MAHTO platform are secured. Payment terms for specific construction or renovation projects will be detailed in the respective service agreements."
    },
    {
      title: "5. IP Rights",
      icon: "shield-check-outline",
      bg: "#E0F2F1",
      iconColor: "#009688",
      text: "All content, trademarks, and data on this platform, including the MAHTO brand and logo, are the property of MAHTO and are protected by applicable intellectual property laws."
    },
    {
      title: "6. Liability",
      icon: "alert-circle-outline",
      bg: "#FFEBEE",
      iconColor: "#F44336",
      text: "MAHTO shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the services."
    },
    {
      title: "7. Changes",
      icon: "update",
      bg: "#E8EAF6",
      iconColor: "#3F51B5",
      text: "We reserve the right to modify these terms at any time. We will provide notice of significant changes. Your continued use of the platform constitutes acceptance of the new terms."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title="Terms & Conditions"
          subtitle="Legal agreement for using MAHTO"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>Last Updated: February 2026</Text>
        </View>

        {content.map((section, index) => (
          <View key={index} style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: section.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialCommunityIcons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{section.title}</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 22, fontWeight: '500' }}>
                {section.text}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ paddingHorizontal: 30, marginTop: 10, marginBottom: 40 }}>
          <View style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
            <MaterialCommunityIcons name="check-decagram-outline" size={20} color="#4CAF50" style={{ marginRight: 12, marginTop: 2 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#666', lineHeight: 18 }}>
              By using the MAHTO platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- PrivacyPolicyScreen Component ---
function PrivacyPolicyScreen({ navigation }) {
  const content = [
    {
      title: "1. Data Collection",
      icon: "database-outline",
      bg: "#E3F2FD",
      iconColor: "#2196F3",
      text: "We collect personal information you provide directly to us (such as name, email, phone number) and information automatically collected from your device (such as location, IP address, and usage data)."
    },
    {
      title: "2. Data Usage",
      icon: "cog-outline",
      bg: "#F3E5F5",
      iconColor: "#9C27B0",
      text: "We use your information to provide construction and renovation services, process payments, communicate with you, and improve our platform. We may also use it for safety and security purposes."
    },
    {
      title: "3. Data Sharing",
      icon: "share-variant-outline",
      bg: "#E8F5E9",
      iconColor: "#4CAF50",
      text: "We share your information with service providers (contractors, workers) to fulfill your requests. We do not sell your personal data to third parties for marketing purposes."
    },
    {
      title: "4. Security",
      icon: "shield-lock-outline",
      bg: "#FFF3E0",
      iconColor: "#FF9800",
      text: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      title: "5. Your Rights",
      icon: "account-check-outline",
      bg: "#E0F2F1",
      iconColor: "#009688",
      text: "You have the right to access, correct, or delete your personal information. You can manage your communication preferences in the Notification settings."
    },
    {
      title: "6. Tracking",
      icon: "cookie-outline",
      bg: "#FFEBEE",
      iconColor: "#F44336",
      text: "We may use cookies and similar tracking technologies to track the activity on our service and hold certain information to enhance your experience."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title="Privacy Policy"
          subtitle="How we handle your data"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>Last Updated: February 2026</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: '#E3F2FD', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#2196F3" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#000', lineHeight: 20, fontWeight: '500' }}>
              At MAHTO, we are committed to protecting your privacy and ensuring the security of your personal information.
            </Text>
          </View>
        </View>

        {content.map((section, index) => (
          <View key={index} style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: section.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialCommunityIcons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{section.title}</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 22, fontWeight: '500' }}>
                {section.text}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ paddingHorizontal: 30, marginTop: 10, marginBottom: 40 }}>
          <View style={{ backgroundColor: '#F8F9FA', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#666" style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>
              Questions? support@mahtoji.tech
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- RefundPolicyScreen Component ---
function RefundPolicyScreen({ navigation }) {
  const content = [
    {
      title: "1. Cancellations",
      icon: "calendar-remove-outline",
      bg: "#E3F2FD",
      iconColor: "#2196F3",
      text: "You may cancel a scheduled service request up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours may incur a cancellation fee of up to ₹500 or 10% of the service value, whichever is lower."
    },
    {
      title: "2. Quality Issues",
      icon: "star-off-outline",
      bg: "#F3E5F5",
      iconColor: "#9C27B0",
      text: "If you are dissatisfied with the quality of service provided, please report the issue within 48 hours of service completion. We will investigate and, if the claim is valid, offer a rework or a partial/full refund based on the severity of the issue."
    },
    {
      title: "3. Material Returns",
      icon: "package-variant-closed",
      bg: "#E8F5E9",
      iconColor: "#4CAF50",
      text: "Unused and undamaged construction materials purchased through MAHTO can be returned within 7 days of delivery. A restocking fee may apply. Custom-ordered materials are non-refundable unless defective."
    },
    {
      title: "4. Processing",
      icon: "timer-sand-empty",
      bg: "#FFF3E0",
      iconColor: "#FF9800",
      text: "Approved refunds will be processed within 5-7 business days and credited back to the original payment method. For cash payments, refunds will be credited to your MAHTO wallet or bank account."
    },
    {
      title: "5. Advances",
      icon: "cash-multiple",
      bg: "#E8EAF6",
      iconColor: "#3F51B5",
      text: "Advance payments for large projects are refundable only if the project is cancelled before any work has commenced or materials have been procured. Once work begins, advances are adjusted against completed milestones."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title="Refund Policy"
          subtitle="Cancellations & Returns"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>Last Updated: February 2026</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: '#FFF3E0', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#FF9800" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#000', lineHeight: 20, fontWeight: '500' }}>
              <Text style={{ fontWeight: 'bold' }}>Note:</Text> Refund requests must be raised via the Help Center or by emailing support@mahtoji.tech.
            </Text>
          </View>
        </View>

        {content.map((section, index) => (
          <View key={index} style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: section.bg, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <MaterialCommunityIcons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{section.title}</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 22, fontWeight: '500' }}>
                {section.text}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ paddingHorizontal: 30, marginTop: 10, marginBottom: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#AAA', fontWeight: '500' }}>
            MAHTO - Fairness and transparency in every transaction.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- AboutUsScreen Component ---
// --- AboutUsScreen Component ---
function AboutUsScreen({ navigation }) {
  const ecosystmItems = [
    { title: 'MAHTO', subtitle: 'Worker, Contractor & Shops', icon: 'account-hard-hat', bg: '#E3F2FD', iconColor: '#2196F3' },
    { title: 'Mine (by MAHTO)', subtitle: 'Full-stack Construction & Reno', icon: 'home-city', bg: '#F3E5F5', iconColor: '#9C27B0' },
    { title: 'MAHTO Home Loans', subtitle: 'Financing your dream home', icon: 'bank', bg: '#E8F5E9', iconColor: '#4CAF50' },
    { title: 'MAHTO Properties', subtitle: 'Land & Property Listings', icon: 'terrain', bg: '#FFF3E0', iconColor: '#FF9800' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}>
        <CustomHeader
          title="About MAHTO"
          subtitle="Building the future of home building"
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: '#000', borderRadius: 28, padding: 24, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10 }}>
            <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <MaterialCommunityIcons name="home-group" size={32} color="#FFF" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF' }}>MAHTO</Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '500' }}>The Home Building OS</Text>
            <View style={{ height: 1.5, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 }} />
            <Text style={{ fontSize: 14, color: '#FFF', lineHeight: 22, opacity: 0.9 }}>
              MAHTO is building the unified platform that brings together everything required to build a home — from land and labor to construction materials, financing, and delivery.
            </Text>
          </View>
        </View>

        {/* The Problem & Solution */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>Our Mission</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>"Sabka sar apni chhaat."</Text>
            <Text style={{ fontSize: 14, color: '#666', lineHeight: 22 }}>
              Today, building a home is fragmented and complex. We simplify this journey into a single, integrated platform. Our mission is to ensure everyone has a roof over their head — and not just any roof, but their <Text style={{ fontWeight: 'bold', color: '#000' }}>own roof.</Text>
            </Text>
          </View>
        </View>

        {/* Ecosystem Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#AAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>What we're building</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 12, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
            {ecosystmItems.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 14,
                  borderBottomWidth: index === ecosystmItems.length - 1 ? 0 : 1,
                  borderBottomColor: '#F8F8F8'
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: item.bg, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 2, fontWeight: '500' }}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Vision Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: '#002171', borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialCommunityIcons name="eye-outline" size={24} color="#FFF" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFF' }}>Our Vision</Text>
            </View>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 24 }}>
              To raise global living standards by becoming the operating system for home building. We want to be the foundation upon which the world builds its future dwellings.
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#F0F0F0', letterSpacing: 6 }}>MAHTO</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Main Application Components ---
// --- SavedPropertiesScreen Component ---
function SavedPropertiesScreen({ navigation }) {
  const { userData } = React.useContext(UserContext);
  const { onScroll } = React.useContext(ScrollContext);
  const savedItems = [
    { id: 1, title: 'Luxury Villa', location: 'South Delhi', price: '₹5.5 Cr', icon: 'home-modern' },
    { id: 2, title: 'Modern Office', location: 'Gurugram', price: '₹2.1 Cr', icon: 'office-building' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <CustomHeader title="Saved Items" subtitle={`${userData.savedCount} items you loved`} navigation={navigation} showBack={true} />
        <View style={{ paddingHorizontal: 20 }}>
          {savedItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.uberRecentItem}>
              <View style={styles.uberRecentIcon}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#000" />
              </View>
              <View style={styles.uberRecentContent}>
                <Text style={styles.uberRecentTitle}>{item.title}</Text>
                <Text style={styles.uberRecentSub}>{item.location} • {item.price}</Text>
              </View>
              <MaterialCommunityIcons name="heart" size={24} color="#FF3B30" />
            </TouchableOpacity>
          ))}
          {userData.savedCount > 2 && (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>+ {userData.savedCount - 2} more items</Text>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// --- ActivityScreen Component ---
// --- LoginScreen Component ---
const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+93', flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+1684', flag: '🇦🇸', name: 'American Samoa' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+1264', flag: '🇦🇮', name: 'Anguilla' },
  { code: '+672', flag: '🇦🇶', name: 'Antarctica' },
  { code: '+1268', flag: '🇦🇬', name: 'Antigua and Barbuda' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+297', flag: '🇦🇼', name: 'Aruba' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+1242', flag: '🇧🇸', name: 'Bahamas' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+1246', flag: '🇧🇧', name: 'Barbados' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+1441', flag: '🇧🇲', name: 'Bermuda' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei Darussalam' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+238', flag: '🇨🇻', name: 'Cape Verde' },
  { code: '+1345', flag: '🇰🇾', name: 'Cayman Islands' },
  { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
  { code: '+235', flag: '🇹🇩', name: 'Chad' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', flag: '🇨🇩', name: 'Congo, DR' },
  { code: '+682', flag: '🇨🇰', name: 'Cook Islands' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+53', flag: '🇨🇺', name: 'Cuba' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+1767', flag: '🇩🇲', name: 'Dominica' },
  { code: '+1809', flag: '🇩🇴', name: 'Dominican Republic' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+500', flag: '🇫🇰', name: 'Falkland Islands' },
  { code: '+298', flag: '🇫🇴', name: 'Faroe Islands' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+594', flag: '🇬🇫', name: 'French Guiana' },
  { code: '+689', flag: '🇵🇫', name: 'French Polynesia' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+350', flag: '🇬🇮', name: 'Gibraltar' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+299', flag: '🇬🇱', name: 'Greenland' },
  { code: '+1473', flag: '🇬🇩', name: 'Grenada' },
  { code: '+590', flag: '🇬🇵', name: 'Guadeloupe' },
  { code: '+1671', flag: '🇬🇺', name: 'Guam' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
  { code: '+592', flag: '🇬🇾', name: 'Guyana' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+379', flag: '🇻🇦', name: 'Holy See' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+1876', flag: '🇯🇲', name: 'Jamaica' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+7', flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
  { code: '+850', flag: '🇰🇵', name: 'North Korea' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+853', flag: '🇲🇴', name: 'Macao' },
  { code: '+389', flag: '🇲🇰', name: 'Macedonia' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
  { code: '+596', flag: '🇲🇶', name: 'Martinique' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
  { code: '+262', flag: '🇾🇹', name: 'Mayotte' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+1664', flag: '🇲🇸', name: 'Montserrat' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+674', flag: '🇳🇷', name: 'Nauru' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+687', flag: '🇳🇨', name: 'New Caledonia' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+683', flag: '🇳🇺', name: 'Niue' },
  { code: '+672', flag: '🇳🇫', name: 'Norfolk Island' },
  { code: '+1670', flag: '🇲🇵', name: 'Northern Mariana Islands' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+680', flag: '🇵🇼', name: 'Palau' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+1787', flag: '🇵🇷', name: 'Puerto Rico' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+262', flag: '🇷🇪', name: 'Reunion' },
  { code: '+1869', flag: '🇰🇳', name: 'Saint Kitts and Nevis' },
  { code: '+1758', flag: '🇱🇨', name: 'Saint Lucia' },
  { code: '+508', flag: '🇵🇲', name: 'Saint Pierre and Miquelon' },
  { code: '+1784', flag: '🇻🇨', name: 'Saint Vincent' },
  { code: '+685', flag: '🇼🇸', name: 'Samoa' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+239', flag: '🇸🇹', name: 'Sao Tome and Principe' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+597', flag: '🇸🇷', name: 'Suriname' },
  { code: '+268', flag: '🇸🇿', name: 'Swaziland' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+690', flag: '🇹🇰', name: 'Tokelau' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+1868', flag: '🇹🇹', name: 'Trinidad and Tobago' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+1649', flag: '🇹🇨', name: 'Turks and Caicos' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+1284', flag: '🇻🇬', name: 'Virgin Islands, British' },
  { code: '+1340', flag: '🇻🇮', name: 'Virgin Islands, U.S.' },
  { code: '+681', flag: '🇼🇫', name: 'Wallis and Futuna' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
];

function LoginScreen({ navigation }) {
  const { saveSession } = React.useContext(UserContext);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter both phone and password.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await saveSession({ phone: `${selectedCountry.code} ${phone}` });
      setLoading(false);
      navigation.replace('Root');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF' }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, justifyContent: 'center' }}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 42, fontWeight: '950', color: '#000', letterSpacing: -2 }}>mine</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#666', marginTop: -5, textTransform: 'uppercase', letterSpacing: 2 }}>By MAHTO</Text>
        </View>

        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#000' }}>Welcome back</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' }]}>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{ flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#EEE', paddingRight: 10, marginRight: 12 }}
            >
              <Text style={{ fontSize: 18, marginRight: 4 }}>{selectedCountry.flag}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000' }}>{selectedCountry.code}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#AAA" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#AAA"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Modal for Country Picker */}
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 600 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '800' }}>Select Country</Text>
                <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); }}>
                  <MaterialCommunityIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' }}>
                <MaterialCommunityIcons name="magnify" size={20} color="#AAA" />
                <TextInput
                  style={{ flex: 1, height: 45, marginLeft: 8, fontSize: 16, color: '#000' }}
                  placeholder="Search country or code..."
                  placeholderTextColor="#AAA"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredCountries.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowPicker(false);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 15 }}>{item.flag}</Text>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ fontSize: 16, color: '#666' }}>{item.code}</Text>
                  </TouchableOpacity>
                ))}
                {filteredCountries.length === 0 && (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#AAA', fontSize: 16 }}>No countries found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' }]}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#000" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#AAA" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 30 }}>
          <Text style={{ color: '#000', fontWeight: '700', fontSize: 14 }}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { borderRadius: 16, height: 60, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.saveButtonText, { fontSize: 18 }]}>Continue with MAHTO ID</Text>}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40 }}>
          <Text style={{ color: '#AAA', fontWeight: '500' }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: '#000', fontWeight: '800' }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- RegisterScreen Component ---
function RegisterScreen({ navigation }) {
  const { saveSession } = React.useContext(UserContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await saveSession({ name, phone: `${selectedCountry.code} ${phone}` });
      setLoading(false);
      // Auto-login: go directly to Root, no need to log in again
      navigation.replace('Root');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF' }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 25, paddingTop: 60 }}>
        <TouchableOpacity
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        <View style={{ marginBottom: 40 }}>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 42, fontWeight: '950', color: '#000', letterSpacing: -2 }}>mine</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#666', marginTop: -5, textTransform: 'uppercase', letterSpacing: 2 }}>By MAHTO</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#000', marginTop: 30 }}>Create Account</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' }]}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#000" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#AAA"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' }]}>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{ flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#EEE', paddingRight: 10, marginRight: 12 }}
            >
              <Text style={{ fontSize: 18, marginRight: 4 }}>{selectedCountry.flag}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000' }}>{selectedCountry.code}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#AAA" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#AAA"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Modal for Country Picker */}
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 600 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '800' }}>Select Country</Text>
                <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); }}>
                  <MaterialCommunityIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: '#F8F9FA', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' }}>
                <MaterialCommunityIcons name="magnify" size={20} color="#AAA" />
                <TextInput
                  style={{ flex: 1, height: 45, marginLeft: 8, fontSize: 16, color: '#000' }}
                  placeholder="Search country or code..."
                  placeholderTextColor="#AAA"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredCountries.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                    onPress={() => {
                      setSelectedCountry(item);
                      setShowPicker(false);
                      setSearchQuery('');
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 15 }}>{item.flag}</Text>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ fontSize: 16, color: '#666' }}>{item.code}</Text>
                  </TouchableOpacity>
                ))}
                {filteredCountries.length === 0 && (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#AAA', fontSize: 16 }}>No countries found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' }]}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#000" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#AAA" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { borderRadius: 16, height: 60, marginTop: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.saveButtonText, { fontSize: 18 }]}>Create Account</Text>}
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
          <Text style={{ color: '#AAA', fontWeight: '500', marginBottom: 16 }}>Already have an account?</Text>
          <TouchableOpacity
            style={[styles.saveButton, { borderRadius: 16, height: 60, width: '100%', backgroundColor: '#000', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, marginTop: 0 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.saveButtonText, { color: '#FFF', fontSize: 16 }]}>Continue with MAHTO ID</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityScreen({ navigation }) {
  const { onScroll } = React.useContext(ScrollContext);
  const activities = [
    { id: 1, title: 'Consultation', status: 'Completed', date: 'May 05', icon: 'check-circle' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <CustomHeader title="Activity" subtitle="Track your projects" navigation={navigation} showBack={false} />
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.uberSectionTitle, { marginTop: 10 }]}>Past Projects</Text>
          {activities.map(item => (
            <TouchableOpacity key={item.id} style={styles.uberRecentItem}>
              <View style={styles.uberRecentIcon}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#000" />
              </View>
              <View style={styles.uberRecentContent}>
                <Text style={styles.uberRecentTitle}>{item.title}</Text>
                <Text style={styles.uberRecentSub}>{item.status} • {item.date}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}


const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { isCollapsed, setIsCollapsed } = React.useContext(ScrollContext);
  const animation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isCollapsed ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  }, [isCollapsed]);

  const { width: screenWidth } = Dimensions.get('window');
  const barWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth * 0.8, 60]
  });

  return (
    <View style={{
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Animated.View style={{
        flexDirection: 'row',
        backgroundColor: '#000',
        height: 60,
        width: barWidth,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-around',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        overflow: 'hidden',
        alignSelf: isCollapsed ? 'flex-start' : 'center',
        marginLeft: isCollapsed ? 30 : 0,
      }}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            if (isCollapsed) {
              setIsCollapsed(false);
            } else {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }
          };

          const iconName = route.name === 'Home' ? 'home-variant' :
            route.name === 'Activity' ? 'clock-outline' :
              route.name === 'Saved' ? 'heart-outline' : 'account-outline';

          if (isCollapsed && !isFocused) return null;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{ flex: isCollapsed ? 0 : 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={isFocused ? '#FFF' : '#888'}
              />
              {!isCollapsed && isFocused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', marginTop: 4 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
};

function MainTabs({ navigation }) {
  const { t } = React.useContext(LanguageContext);

  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Saved" component={SavedPropertiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Inner App that has access to UserContext
function AppNavigator() {
  const { loadSession } = React.useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const found = await loadSession();
      setIsLoggedIn(found);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  if (isLoading) {
    // Splash while checking stored session
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 42, fontWeight: '950', color: '#000', letterSpacing: -2 }}>mine</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#666', marginTop: -5, textTransform: 'uppercase', letterSpacing: 2 }}>By MAHTO</Text>
        <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? 'Root' : 'Login'}
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#FFF' },
        contentStyle: { backgroundColor: '#FFF' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Root" component={MainTabs} />
      <Stack.Screen name="Construction" component={ConstructionScreen} />
      <Stack.Screen name="ResidentialBuild" component={ResidentialBuildScreen} />
      <Stack.Screen name="CommercialBuild" component={CommercialBuildScreen} />
      <Stack.Screen name="IndustrialBuild" component={IndustrialBuildScreen} />
      <Stack.Screen name="ProjectManagement" component={ProjectManagementScreen} />
      <Stack.Screen name="Renovation" component={RenovationScreen} />
      <Stack.Screen name="KitchenRemodel" component={KitchenRemodelScreen} />
      <Stack.Screen name="BathroomUpgrade" component={BathroomUpgradeScreen} />
      <Stack.Screen name="FlooringMakeover" component={FlooringMakeoverScreen} />
      <Stack.Screen name="FullHomeMakeover" component={FullHomeMakeoverScreen} />
      <Stack.Screen name="HomePainting" component={HomePaintingScreen} />
      <Stack.Screen name="Service" component={ServiceScreen} />
      <Stack.Screen name="Plumbing" component={PlumbingScreen} />
      <Stack.Screen name="Electrical" component={ElectricalScreen} />
      <Stack.Screen name="HVAC" component={HVACScreen} />
      <Stack.Screen name="GeneralRepairs" component={GeneralRepairsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      <Stack.Screen name="NotificationInbox" component={NotificationInboxScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Languages" component={LanguageScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="TermsCondition" component={TermsConditionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="SavedProperties" component={SavedPropertiesScreen} />
      <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
      <Stack.Screen name="IdeasGallery" component={IdeasGalleryScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <ScrollProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ScrollProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 0,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  // Uber Style Styles
  uberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  uberBrand: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1.5,
  },
  uberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },
  uberGreeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  uberSearchContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  uberSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  uberSearchDot: {
    width: 8,
    height: 8,
    backgroundColor: '#000',
    borderRadius: 2,
    marginRight: 12,
  },
  uberSearchText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  uberSearchRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uberDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#DDD',
    marginHorizontal: 12,
  },
  uberNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginLeft: 6,
    marginRight: 4,
  },
  uberServiceGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 32,
    gap: 12,
  },
  uberServiceCard: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uberServiceIconBg: {
    marginBottom: 8,
  },
  uberServiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  uberPromoCard: {
    marginHorizontal: 20,
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 32,
  },
  uberPromoTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  uberPromoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  uberPromoDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
    lineHeight: 18,
  },
  uberPromoBtn: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  uberPromoBtnText: {
    color: '#FFF',
    fontWeight: '600',
    marginRight: 8,
  },
  uberPromoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  uberRecentSection: {
    paddingHorizontal: 20,
  },
  uberSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  uberRecentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  uberRecentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uberRecentContent: {
    flex: 1,
  },
  uberRecentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  uberRecentSub: {
    fontSize: 14,
    color: '#555',
  },
  // Custom Header Styles
  customHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 20,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  gridDetails: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  // Profile / Account Styles
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileMenuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  // Form Styles (Uber-like clean)
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // CTA Buttons
  ctaButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  // Profile Header Styles
  profileHeaderContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  profileImageContainer: {
    position: 'relative',
    width: 140,
    height: 140,
  },
  profileImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  // Utilities
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  logoutCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F3F3',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
