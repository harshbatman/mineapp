import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, TextInput, ActivityIndicator, Alert, Switch, Linking, Modal, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { translations } from './translations';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const LanguageContext = React.createContext();

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

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: 'Harsh Mahto',
    phone: '+91 9876543210',
    email: 'harsh.batman@example.com',
    address: '123 Construction St, Delhi',
    profileImage: null,
    listingsCount: 12,
    savedCount: 45
  });

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
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
    { id: 'Construction', title: 'Construction', image: require('./assets/construction.png') },
    { id: 'Renovation', title: 'Renovation', image: require('./assets/renovation.png') },
    { id: 'Service', title: 'Service', image: require('./assets/services.png') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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
                <Image
                  source={userData.profileImage ? { uri: userData.profileImage } : require('./assets/adaptive-icon.png')}
                  style={[styles.uberAvatar, { marginRight: 12, borderWidth: 2, borderColor: '#FFF' }]}
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>Hi, {userData.name.split(' ')[0]}</Text>
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
              <View style={[styles.uberServiceIconBg, { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' }]}>
                <Image source={service.image} style={{ width: 56, height: 56 }} resizeMode="contain" />
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

        <View style={styles.uberPromoCard}>
          <View style={styles.uberPromoTextContainer}>
            <Text style={styles.uberPromoTitle}>Full-Stack Construction</Text>
            <Text style={styles.uberPromoDesc}>End-to-end service managed by MAHTO experts.</Text>
            <TouchableOpacity style={styles.uberPromoBtn} onPress={() => navigation.navigate('AboutUs')}>
              <Text style={styles.uberPromoBtnText}>How it works</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.uberPromoIcon}>
            <MaterialCommunityIcons name="shield-check" size={60} color="#000" opacity={0.1} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={[styles.uberSectionTitle, { marginBottom: 16 }]}>The MAHTO Difference</Text>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="layers" size={24} color="#000" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>End-to-End Stack</Text>
                <Text style={{ color: '#666', fontSize: 13 }}>From plan to possession, one unified team.</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account-group" size={24} color="#000" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>Direct Execution</Text>
                <Text style={{ color: '#666', fontSize: 13 }}>In-house labor and professional engineers.</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="currency-usd" size={24} color="#000" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 16 }}>Factory Pricing</Text>
                <Text style={{ color: '#666', fontSize: 13 }}>Materials sourced directly for maximum value.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.uberRecentSection}>
          <Text style={styles.uberSectionTitle}>Your recent projects</Text>
          <TouchableOpacity style={styles.uberRecentItem}>
            <View style={styles.uberRecentIcon}>
              <MaterialCommunityIcons name="history" size={24} color="#000" />
            </View>
            <View style={styles.uberRecentContent}>
              <Text style={styles.uberRecentTitle}>Home Renovation</Text>
              <Text style={styles.uberRecentSub}>123 Construction St, Delhi</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// --- ProfileScreen Component ---
function ProfileScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const { userData } = React.useContext(UserContext);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const menuItems = [
    { title: 'Edit Profile', icon: 'account-edit-outline', onPress: () => navigation.navigate('EditProfile') },
    { title: 'Settings', icon: 'cog-outline', onPress: () => navigation.navigate('Settings') },
    { title: 'Rate Us', icon: 'star-outline', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.mine.app') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
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
      </ScrollView>

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
              onPress={() => {
                setLogoutVisible(false);
                Alert.alert("Signed Out", "You have been signed out successfully.");
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
  const settingsItems = [
    { title: 'Notification Inbox', icon: 'email-receive-outline', onPress: () => navigation.navigate('NotificationInbox') },
    { title: 'Notification', icon: 'bell-outline', onPress: () => navigation.navigate('Notification') },
    { title: 'Languages', icon: 'translate', onPress: () => navigation.navigate('Languages') },
    { title: 'About Us', icon: 'information-outline', onPress: () => navigation.navigate('AboutUs') },
    { title: 'Contact Us', icon: 'headphones', onPress: () => navigation.navigate('ContactUs') },
    { title: 'Help & Support', icon: 'help-circle-outline', onPress: () => navigation.navigate('HelpSupportMenu') },
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#F9F9F9', borderRadius: 16, padding: 8 }}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: index === settingsItems.length - 1 ? 0 : 1, borderBottomColor: '#EEE' }}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- HelpSupportMenuScreen Component ---
function HelpSupportMenuScreen({ navigation }) {
  const menuItems = [
    { title: 'FAQ', icon: 'frequently-asked-questions', onPress: () => navigation.navigate('HelpCenter') },
    { title: 'Terms & Condition', icon: 'file-document-outline', onPress: () => navigation.navigate('TermsCondition') },
    { title: 'Refund Policy', icon: 'cash-refund', onPress: () => navigation.navigate('RefundPolicy') },
    { title: 'Privacy Policy', icon: 'shield-lock-outline', onPress: () => navigation.navigate('PrivacyPolicy') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Help & Support" navigation={navigation} showBack={true} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <View style={{ backgroundColor: '#F9F9F9', borderRadius: 16, padding: 8 }}>
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

// --- EditProfileScreen Component ---
function EditProfileScreen({ navigation }) {
  const { userData, updateUserData } = React.useContext(UserContext);

  const [name, setName] = useState(userData.name);
  const [phone, setPhone] = useState(userData.phone);
  const [email, setEmail] = useState(userData.email);
  const [address, setAddress] = useState(userData.address);
  const [profileImage, setProfileImage] = useState(userData.profileImage);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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
        Alert.alert('Permission to access location was denied');
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
      Alert.alert('Error fetching location', error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    updateUserData({ name, phone, email, address, profileImage });
    Alert.alert('Profile Updated', 'Your changes have been saved successfully.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Edit Profile"
          subtitle="Update your personal details"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }]}>
                  <MaterialCommunityIcons name="account" size={80} color="#0047AB" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editIconBadge} onPress={pickImage} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter your email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.addressContainer}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  placeholder="Enter your address"
                />
              </View>
              <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={loadingLocation}>
                {loadingLocation ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
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

  const NotificationItem = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.notificationItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        trackColor={{ false: "#767577", true: "#0047AB" }}
        thumbColor={value ? "#f4f3f4" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title={t('notification')}
          subtitle="Manage your alert preferences"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('general')}</Text>
          <View style={styles.notificationCard}>
            <NotificationItem
              title={t('pushNotif')}
              subtitle="Receive alerts on your device"
              value={pushEnabled}
              onValueChange={() => toggleSwitch('push')}
            />
            <View style={styles.divider} />
            <NotificationItem
              title={t('emailNotif')}
              subtitle="Receive updates via email"
              value={emailEnabled}
              onValueChange={() => toggleSwitch('email')}
            />
            <View style={styles.divider} />
            <NotificationItem
              title={t('smsNotif')}
              subtitle="Receive updates via SMS"
              value={smsEnabled}
              onValueChange={() => toggleSwitch('sms')}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('marketing')}</Text>
          <View style={styles.notificationCard}>
            <NotificationItem
              title={t('promoOffers')}
              subtitle="Get updates on sales and offers"
              value={promoEnabled}
              onValueChange={() => toggleSwitch('promo')}
            />
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
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'ur', name: 'Urdu (اردو)' },
    { code: 'ks', name: 'Kashmiri (کأشُر)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'raj', name: 'Rajasthani (राजस्थानी)' },
    { code: 'bgc', name: 'Haryanvi (हरियाणवी)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'ne', name: 'Nepali (नेपाली)' },
    { code: 'as', name: 'Assamese (অসমীয়া)' },
    { code: 'bho', name: 'Bhojpuri (भोजपुरी)' },
    { code: 'mai', name: 'Maithili (मैथिली)' },
  ];

  const handleLanguageSelect = (code) => {
    setLocale(code);
    // Optional: Go back after selection
    // navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title={t('languages')}
          subtitle="Select your preferred language"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.notificationCard}>
          {/* Reusing notificationCard style for consistent look */}
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.notificationItem, { paddingVertical: 16 }]} // Slightly larger tap area
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <Text style={[styles.notificationTitle, { fontWeight: locale === lang.code ? 'bold' : 'normal', color: locale === lang.code ? '#0047AB' : '#333' }]}>
                {lang.name}
              </Text>
              {locale === lang.code && <MaterialCommunityIcons name="check" size={24} color="#0047AB" />}
              {index < languages.length - 1 && <View style={[styles.divider, { position: 'absolute', bottom: 0, left: 0, right: 0 }]} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- HelpCenterScreen Component ---
function HelpCenterScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);

  const faqs = [
    { question: 'How do I book a service?', answer: 'Simply navigate to the service category you need (Construction, Renovation, or Service), select a specific service, and follow the booking prompts.' },
    { question: 'Is there a cancellation fee?', answer: 'Cancellations made within 24 hours of the scheduled service may incur a small fee. Please check our Terms & Conditions for more details.' },
    { question: 'How can I track my request?', answer: 'You can track the status of your service requests in the "My Orders" section (coming soon).' },
    { question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, UPIs, and net banking.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title={t('helpCenter')}
          subtitle="We are here to help you"
          navigation={navigation}
          showBack={true}
        />

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <MaterialCommunityIcons name="lifebuoy" size={64} color="#0047AB" />
          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 16, color: '#1A1A1A' }}>
            Facing any issue while using{'\n'}mine by MAHTO?
          </Text>
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 8, paddingHorizontal: 20, lineHeight: 20 }}>
            We're here to help you bridge the gap between your problems and solutions.
          </Text>
        </View>

        {/* Pro Tip */}
        <View style={{ backgroundColor: '#E3F2FD', padding: 16, borderRadius: 16, flexDirection: 'row', marginBottom: 24, alignItems: 'center' }}>
          <MaterialCommunityIcons name="camera-outline" size={24} color="#0047AB" style={{ marginRight: 12 }} />
          <Text style={{ flex: 1, color: '#333', lineHeight: 20, fontSize: 13 }}>
            <Text style={{ fontWeight: 'bold' }}>Pro Tip:</Text> Please attach a screenshot or image of the issue in your email to help us clarify and resolve the problem faster.
          </Text>
        </View>

        {/* Report a Bug */}
        <View style={styles.helpCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bug-outline" size={24} color="#0047AB" />
          </View>
          <Text style={styles.helpCardTitle}>Report a Bug</Text>
          <Text style={styles.helpCardDesc}>Found a technical glitch or an error? Let our tech team know immediately.</Text>
          <TouchableOpacity style={styles.helpCardButton} onPress={() => Linking.openURL('mailto:support@mahtoji.tech?subject=Bug Report')}>
            <Text style={styles.helpCardButtonText}>Contact Support</Text>
            <MaterialCommunityIcons name="email-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Feature Request */}
        <View style={styles.helpCard}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#0047AB" />
          </View>
          <Text style={styles.helpCardTitle}>Feature Request</Text>
          <Text style={styles.helpCardDesc}>Have an idea to make MAHTO better? We'd love to hear your suggestions.</Text>
          <TouchableOpacity style={styles.helpCardButton} onPress={() => Linking.openURL('mailto:support@mahtoji.tech?subject=Feature Request')}>
            <Text style={styles.helpCardButtonText}>Send Suggestion</Text>
            <MaterialCommunityIcons name="email-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* CEO Office */}
        <View style={[styles.helpCard, { backgroundColor: '#002171', borderColor: '#002171' }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <MaterialCommunityIcons name="medal-outline" size={24} color="#FFF" />
          </View>
          <Text style={[styles.helpCardTitle, { color: '#FFF' }]}>CEO's Office</Text>
          <Text style={[styles.helpCardDesc, { color: '#B3CDE0' }]}>For critical escalations or partnership inquiries directly to the leadership.</Text>
          <TouchableOpacity style={[styles.helpCardButton, { backgroundColor: '#FFF' }]} onPress={() => Linking.openURL('mailto:harshkumarceo@mahtoji.tech?subject=CEO Office Inquiry')}>
            <Text style={[styles.helpCardButtonText, { color: '#002171' }]}>Contact CEO Office</Text>
            <MaterialCommunityIcons name="email-outline" size={20} color="#002171" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Standard Response Time */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 40 }}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" style={{ marginRight: 6 }} />
          <Text style={{ color: '#666', fontSize: 12 }}>Standard Response Time: 24 - 48 Hours</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={[styles.notificationCard, { marginBottom: 12 }]}>
              <Text style={styles.notificationTitle}>{faq.question}</Text>
              <Text style={{ fontSize: 14, color: '#555', marginTop: 4, lineHeight: 20 }}>{faq.answer}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ResidentialBuildScreen Component ---
function ResidentialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Consultation', desc: 'We meet to discuss your vision and budget.', icon: 'account-voice' },
    { title: 'Design & Planning', desc: 'Architectural drawings and 3D modeling.', icon: 'pencil-ruler' },
    { title: 'Construction', desc: 'Building your dream home with quality materials.', icon: 'hammer-wrench' },
    { title: 'Handover', desc: 'Final inspection and key handover.', icon: 'key-variant' },
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
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: '100%',
            height: 200,
            borderRadius: 20,
            backgroundColor: '#E3F2FD',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <MaterialCommunityIcons name="home-city" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Custom Homes</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
            From modern villas to cozy cottages, we specialize in building residential properties that stand the test of time.
          </Text>
        </View>

        {/* Steps Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How We Work</Text>
          {steps.map((step, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              backgroundColor: '#FFF',
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F0F0F0'
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#E3F2FD',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Start Your Project</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- CommercialBuildScreen Component ---
function CommercialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Project Scoping', desc: 'Defining requirements for office or retail space.', icon: 'file-document-outline' },
    { title: 'Design & Compliance', desc: 'Creating functional designs that meet regulations.', icon: 'ruler-square' },
    { title: 'Execution', desc: 'Efficient construction to minimize downtime.', icon: 'hard-hat' },
    { title: 'Launch Ready', desc: 'Final checks for a grand opening.', icon: 'rocket-launch' },
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

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: '100%',
            height: 200,
            borderRadius: 20,
            backgroundColor: '#F3F3F3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <MaterialCommunityIcons name="office-building" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Business Infrastructure</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
            We build modern commercial spaces, from retail stores to corporate offices, designed to enhance productivity and impress clients.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Process</Text>
          {steps.map((step, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              backgroundColor: '#FFF',
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: '#F3F3F3'
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#F3F3F3',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Get a Quote</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- IndustrialBuildScreen Component ---
function IndustrialBuildScreen({ navigation }) {
  const steps = [
    { title: 'Site Analysis', desc: 'Evaluating terrain and logistics access.', icon: 'map-search' },
    { title: 'Heavy Engineering', desc: 'Structural integrity for heavy machinery.', icon: 'robot-industrial' },
    { title: 'Safety Systems', desc: 'Implementing fire and safety protocols.', icon: 'shield-check' },
    { title: 'Operations Transfer', desc: 'Seamless handover for immediate use.', icon: 'truck-delivery' },
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

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: '100%',
            height: 200,
            borderRadius: 20,
            backgroundColor: '#F3F3F3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <MaterialCommunityIcons name="factory" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Industrial Solutions</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
            Robust construction for factories, warehouses, and industrial plants. We prioritize safety, durability, and efficiency.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Steps</Text>
          {steps.map((step, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              backgroundColor: '#FFF',
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: '#F3F3F3'
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#F3F3F3',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Consult Engineers</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ProjectManagementScreen Component ---
function ProjectManagementScreen({ navigation }) {
  const features = [
    { title: 'Timeline Management', desc: 'Keeping your project on strict deadlines.', icon: 'calendar-clock' },
    { title: 'Cost Control', desc: 'Monitoring budget and resource allocation.', icon: 'finance' },
    { title: 'Quality Assurance', desc: 'Regular inspections and standards checks.', icon: 'check-decagram' },
    { title: 'Vendor Coordination', desc: 'Managing subcontractors and suppliers.', icon: 'account-group' },
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

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: '100%',
            height: 200,
            borderRadius: 20,
            backgroundColor: '#F3F3F3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <MaterialCommunityIcons name="clipboard-check" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>End-to-End Management</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
            We take the stress out of construction. Our expert managers ensure your project is completed on time, within budget, and to the highest standards.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {features.map((item, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              backgroundColor: '#FFF',
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: '#F3F3F3'
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#F3F3F3',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Hire a Manager</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ContactUsScreen Component ---
function ContactUsScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title={t('contactUs')}
          subtitle=""
          navigation={navigation}
          showBack={true}
        />

        <View style={{ paddingHorizontal: 4 }}>
          {/* General Support Card */}
          <View style={[styles.contactCard, { backgroundColor: '#000' }]}>
            <MaterialCommunityIcons name="email" size={48} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={styles.contactCardTitle}>General Support</Text>
            <Text style={styles.contactCardDesc}>For bugs, feature requests, or general queries.</Text>
            <TouchableOpacity
              style={styles.contactCardButton}
              onPress={() => Linking.openURL('mailto:support@mahtoji.tech')}
            >
              <Text style={styles.contactCardButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* CEO's Office Card */}
          <View style={[styles.contactCard, { backgroundColor: '#001529' }]}>
            <MaterialCommunityIcons name="medal" size={48} color="#FFF" style={{ marginBottom: 16 }} />
            <Text style={styles.contactCardTitle}>CEO's Office</Text>
            <Text style={styles.contactCardDesc}>For critical escalations or leadership inquiries.</Text>
            <TouchableOpacity
              style={[styles.contactCardButton, { borderColor: '#B3CDE0' }]}
              onPress={() => Linking.openURL('mailto:harshkumarceo@mahtoji.tech')}
            >
              <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Contact CEO Office</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#0047AB" style={{ marginRight: 12 }} />
          <Text style={styles.infoBannerText}>
            Response Time: 24-48 Hours. Please attach images to clarify problems.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ConstructionScreen Component ---
function ConstructionScreen({ navigation }) {
  const constructionServices = [
    { title: 'Residential Building', icon: 'home', details: 'Custom homes built from the ground up.', route: 'ResidentialBuild' },
    { title: 'Commercial Projects', icon: 'domain', details: 'Offices, retail spaces, and warehouses.', route: 'CommercialBuild' },
    { title: 'Industrial Construction', icon: 'factory', details: 'Heavy-duty construction for industrial needs.', route: 'IndustrialBuild' },
    { title: 'Project Management', icon: 'clipboard-list', details: 'End-to-end management of your build.', route: 'ProjectManagement' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          title="Construction"
          subtitle="Building your dreams with precision."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {constructionServices.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <MaterialCommunityIcons name={item.icon} size={32} color="#000" />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDetails}>{item.details}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- RenovationScreen Component ---
function RenovationScreen({ navigation }) {
  const renovationServices = [
    { title: 'Kitchen Remodel', icon: 'silverware-fork-knife', details: 'Modern designs for the heart of your home.', route: 'KitchenRemodel' },
    { title: 'Bathroom Upgrade', icon: 'shower', details: 'Spa-like retreats and functional layouts.', route: 'BathroomUpgrade' },
    { title: 'Flooring', icon: 'floor-plan', details: 'Hardwood, tile, and luxury vinyl installation.', route: 'FlooringMakeover' },
    { title: 'Full Home Makeover', icon: 'home-circle', details: 'Complete transformation of your living space.', route: 'FullHomeMakeover' },
    { title: 'Home Painting', icon: 'format-paint', details: 'Interior and exterior professional painting.', route: 'HomePainting' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          title="Renovation"
          subtitle="Revitalize your improved space."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {renovationServices.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <MaterialCommunityIcons name={item.icon} size={32} color="#000" />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDetails}>{item.details}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Renovation Detail Screens ---
function KitchenRemodelScreen({ navigation }) {
  const steps = [
    { title: 'Layout Optimization', desc: 'Improving workflow and space utilization.', icon: 'arrow-expand-all' },
    { title: 'Cabinetry & Storage', desc: 'Custom cabinets and smart storage solutions.', icon: 'cupboard' },
    { title: 'Countertops & Backsplash', desc: 'Premium materials like granite, quartz, and marble.', icon: 'texture-box' },
    { title: 'Appliances & Lighting', desc: 'Integration of modern appliances and fixtures.', icon: 'lightbulb-on-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Kitchen Remodel" subtitle="The Heart of Your Home." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="chef-hat" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Culinary Masterpiece</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Transform your kitchen into a modern, functional, and stylish space perfect for cooking and gathering.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          {steps.map((step, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Plan My Kitchen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function BathroomUpgradeScreen({ navigation }) {
  const steps = [
    { title: 'Luxury Fixtures', desc: 'Rain showers, soaking tubs, and modern faucets.', icon: 'water-pump' },
    { title: 'Tile & Flooring', desc: 'Water-resistant, stylish tiling options.', icon: 'checkerboard' },
    { title: 'Vanity & Storage', desc: 'Elegant vanities with ample space.', icon: 'dresser' },
    { title: 'Lighting & Ventilation', desc: 'Mood lighting and proper air circulation.', icon: 'fan' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Bathroom Upgrade" subtitle="Your Personal Spa." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="shower-head" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Refresh & Relax</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Upgrade your bathroom into a serene retreat with modern amenities and luxurious finishes.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          {steps.map((step, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Upgrade Bathroom</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FlooringMakeoverScreen({ navigation }) {
  const steps = [
    { title: 'Hardwood', desc: 'Timeless elegance and durability.', icon: 'tree' },
    { title: 'Ceramic Tile', desc: 'Versatile and easy to maintain.', icon: 'grid' },
    { title: 'Luxury Vinyl', desc: 'Waterproof and cost-effective.', icon: 'layers' },
    { title: 'Carpet', desc: 'Soft comfort for bedrooms and living areas.', icon: 'rug' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Flooring" subtitle="Foundation of Style." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="floor-plan" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Step into Luxury</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Choose from a wide range of premium flooring options to elevate the look and feel of your home.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Options</Text>
          {steps.map((step, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Get Flooring Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FullHomeMakeoverScreen({ navigation }) {
  const steps = [
    { title: 'Concept Design', desc: 'Holistic vision for your entire home.', icon: 'lightbulb-on' },
    { title: 'Structural Changes', desc: 'Wall removal and room reconfiguration.', icon: 'wall' },
    { title: 'Systems Update', desc: 'Plumbing, electrical, and HVAC upgrades.', icon: 'lightning-bolt' },
    { title: 'Finishing Touches', desc: 'Paint, trim, and decor styling.', icon: 'palette' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Full Home Makeover" subtitle="Complete Transformation." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="home-modern" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Reimagine Your Home</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>A comprehensive renovation service to completely transform your living space into your dream home.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Approach</Text>
          {steps.map((step, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Start Makeover</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomePaintingScreen({ navigation }) {
  const steps = [
    { title: 'Color Consultation', desc: 'Expert advice on color palettes.', icon: 'palette-swatch' },
    { title: 'Surface Prep', desc: 'Sanding, priming, and repairing imperfections.', icon: 'format-paint' },
    { title: 'Interior Painting', desc: 'Walls, ceilings, and trim.', icon: 'roller-skate' },
    { title: 'Exterior Painting', desc: 'Durable finishes for curb appeal.', icon: 'home-roof' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Home Painting" subtitle="A Fresh Coat of Life." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="format-paint" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Vibrant Spaces</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Professional interior and exterior painting services to refresh your home and protect your investment.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          {steps.map((step, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={step.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{step.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Get Painting Quote</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ServiceScreen Component ---
function ServiceScreen({ navigation }) {
  const serviceOptions = [
    { title: 'Plumbing', icon: 'water-pump', details: 'Leak repairs, installations, and maintenance.', route: 'Plumbing' },
    { title: 'Electrical', icon: 'flash', details: 'Wiring, lighting, and safety inspections.', route: 'Electrical' },
    { title: 'HVAC', icon: 'air-conditioner', details: 'Heating, ventilation, and air conditioning.', route: 'HVAC' },
    { title: 'General Repairs', icon: 'hammer-wrench', details: 'Fixing the small things before they grow.', route: 'GeneralRepairs' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          title="Maintenance"
          subtitle="Reliable repairs when you need them."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {serviceOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <MaterialCommunityIcons name={item.icon} size={32} color="#000" />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDetails}>{item.details}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Maintenance Service Components ---

function PlumbingScreen({ navigation }) {
  const services = [
    { title: 'Leak Detection', desc: 'Finding and fixing hidden leaks.', icon: 'water-off' },
    { title: 'Pipe Repair', desc: 'Replace old or burst pipes.', icon: 'pipe' },
    { title: 'Fixture Install', desc: 'Faucets, sinks, and toilets.', icon: 'toilet' },
    { title: 'Drain Cleaning', desc: 'Unclogging drains efficiently.', icon: 'water-remove' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Plumbing Services" subtitle="Expert Flow Control." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="water-pump" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Reliable Plumbing</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>From emergency repairs to scheduled maintenance, our plumbers ensure your water systems run smoothly.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          {services.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Call a Plumber</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ElectricalScreen({ navigation }) {
  const services = [
    { title: 'Wiring & Rewiring', desc: 'Safe electrical infrastructure.', icon: 'power-plug' },
    { title: 'Lighting Install', desc: 'Smart, LED, and ambient lighting.', icon: 'ceiling-light' },
    { title: 'Panel Upgrades', desc: 'Modernize your circuit breakers.', icon: 'flash-alert' },
    { title: 'Safety Inspections', desc: 'Compliance and hazard checks.', icon: 'shield-check' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="Electrical Services" subtitle="Powering Your Life." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="flash" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Expert Electricians</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Certified electricians for all your residential and commercial electrical needs. Safety first.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          {services.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Book Electrician</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HVACScreen({ navigation }) {
  const services = [
    { title: 'AC Installation', desc: 'Split, window, and central AC systems.', icon: 'air-conditioner' },
    { title: 'Heater Repair', desc: 'Furnace and heater maintenance.', icon: 'fire' },
    { title: 'Duct Cleaning', desc: 'Improving air quality.', icon: 'weather-windy' },
    { title: 'Thermostat Setup', desc: 'Smart climate control.', icon: 'thermometer' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="HVAC Services" subtitle="Comfort in All Seasons." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="air-conditioner" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Climate Control</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Keep your home cool in summer and warm in winter with our professional HVAC services.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          {services.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Schedule Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function GeneralRepairsScreen({ navigation }) {
  const services = [
    { title: 'Handyman Services', desc: 'Furniture assembly, mounting, etc.', icon: 'account-hard-hat' },
    { title: 'Drywall Repair', desc: 'Patching holes and cracks.', icon: 'wall' },
    { title: 'Door & Window', desc: 'Fixing jams, locks, and hinges.', icon: 'door' },
    { title: 'Painting Touch-ups', desc: 'Small area repainting.', icon: 'format-paint' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader title="General Repairs" subtitle="Small Fixes, Big Impact." navigation={navigation} showBack={true} />
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="hammer-wrench" size={80} color="#0047AB" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 }}>Home Maintenance</Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>Don't let small problems become big headaches. Our general repair services cover all the odd jobs around your house.</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What We Fix</Text>
          {services.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, backgroundColor: '#F3F3F3' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#0047AB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: '#000', shadowColor: '#0047AB' }]} onPress={() => navigation.navigate('ContactUs')}>
          <Text style={styles.ctaText}>Request Handyman</Text>
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
      text: "Welcome to MAHTO. By accessing or using our platform, you agree to represent that you are at least 18 years old and capable of entering into binding contracts. These Terms & Conditions govern your use of our website, mobile application, and services."
    },
    {
      title: "2. User Accounts",
      text: "To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      title: "3. Services",
      text: "MAHTO connects users with construction professionals, material suppliers, and financial services. We act as a facilitator and platform provider. While we vet our partners, the final service agreement is between you and the service provider."
    },
    {
      title: "4. Payments",
      text: "All payments made through the MAHTO platform are secured. Payment terms for specific construction or renovation projects will be detailed in the respective service agreements."
    },
    {
      title: "5. Intellectual Property",
      text: "All content, trademarks, and data on this platform, including the MAHTO brand and logo, are the property of MAHTO and are protected by applicable intellectual property laws."
    },
    {
      title: "6. Limitation of Liability",
      text: "MAHTO shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the services."
    },
    {
      title: "7. Changes to Terms",
      text: "We reserve the right to modify these terms at any time. We will provide notice of significant changes. Your continued use of the platform constitutes acceptance of the new terms."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Terms & Conditions"
          subtitle="Please read carefully"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.lastUpdatedText}>Last Updated: February 2026</Text>

          {content.map((section, index) => (
            <View key={index} style={styles.termsSection}>
              <Text style={styles.termsTitle}>{section.title}</Text>
              <Text style={styles.termsText}>{section.text}</Text>
            </View>
          ))}

          <View style={styles.termsFooter}>
            <Text style={styles.termsFooterText}>
              By using MAHTO, you acknowledge that you have read and understood these agreements.
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
      title: "1. Information We Collect",
      text: "We collect personal information you provide directly to us (such as name, email, phone number) and information automatically collected from your device (such as location, IP address, and usage data)."
    },
    {
      title: "2. How We Use Your Information",
      text: "We use your information to provide construction and renovation services, process payments, communicate with you, and improve our platform. We may also use it for safety and security purposes."
    },
    {
      title: "3. Information Sharing",
      text: "We share your information with service providers (contractors, workers) to fulfill your requests. We do not sell your personal data to third parties for marketing purposes."
    },
    {
      title: "4. Data Security",
      text: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      title: "5. Your Rights",
      text: "You have the right to access, correct, or delete your personal information. You can manage your communication preferences in the Notification settings."
    },
    {
      title: "6. Cookies and Tracking",
      text: "We may use cookies and similar tracking technologies to track the activity on our service and hold certain information to enhance your experience."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Privacy Policy"
          subtitle="How we handle your data"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.lastUpdatedText}>Last Updated: February 2026</Text>

          <View style={{ marginBottom: 24, padding: 12, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
            <Text style={{ fontSize: 13, color: '#000', lineHeight: 20 }}>
              At MAHTO, we are committed to protecting your privacy and ensuring the security of your personal information.
            </Text>
          </View>

          {content.map((section, index) => (
            <View key={index} style={styles.termsSection}>
              <Text style={styles.termsTitle}>{section.title}</Text>
              <Text style={styles.termsText}>{section.text}</Text>
            </View>
          ))}

          <View style={styles.termsFooter}>
            <Text style={styles.termsFooterText}>
              If you have any questions about this Privacy Policy, please contact us at support@mahtoji.tech.
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
      title: "1. Service Cancellations",
      text: "You may cancel a scheduled service request up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours may incur a cancellation fee of up to ₹500 or 10% of the service value, whichever is lower."
    },
    {
      title: "2. Service Quality Issues",
      text: "If you are dissatisfied with the quality of service provided, please report the issue within 48 hours of service completion. We will investigate and, if the claim is valid, offer a rework or a partial/full refund based on the severity of the issue."
    },
    {
      title: "3. Material Returns",
      text: "Unused and undamaged construction materials purchased through MAHTO can be returned within 7 days of delivery. A restocking fee may apply. Custom-ordered materials are non-refundable unless defective."
    },
    {
      title: "4. Refund Processing",
      text: "Approved refunds will be processed within 5-7 business days and credited back to the original payment method. For cash payments, refunds will be credited to your MAHTO wallet or bank account."
    },
    {
      title: "5. Advance Payments",
      text: "Advance payments for large projects are refundable only if the project is cancelled before any work has commenced or materials have been procured. Once work begins, advances are adjusted against completed milestones."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Refund Policy"
          subtitle="Cancellations & Returns"
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.lastUpdatedText}>Last Updated: February 2026</Text>

          <View style={{ marginBottom: 24, padding: 12, backgroundColor: '#FFF3E0', borderRadius: 8 }}>
            <Text style={{ fontSize: 13, color: '#E65100', lineHeight: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>Note:</Text> Refund requests must be raised via the Help Center or by emailing support@mahtoji.tech.
            </Text>
          </View>

          {content.map((section, index) => (
            <View key={index} style={styles.termsSection}>
              <Text style={styles.termsTitle}>{section.title}</Text>
              <Text style={styles.termsText}>{section.text}</Text>
            </View>
          ))}

          <View style={styles.termsFooter}>
            <Text style={styles.termsFooterText}>
              We strive to ensure fair and transparent handling of all refund requests.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- AboutUsScreen Component ---
function AboutUsScreen({ navigation }) {
  const EcosystemItem = ({ icon, title, desc }) => (
    <View style={styles.ecoItem}>
      <View style={styles.ecoIconBox}>
        <MaterialCommunityIcons name={icon} size={24} color="#0047AB" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ecoTitle}>{title}</Text>
        <Text style={styles.ecoDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="About MAHTO"
          subtitle="The future of home building"
          navigation={navigation}
          showBack={true}
        />

        {/* Hero Section */}
        <View style={styles.aboutHero}>
          <View style={styles.aboutHeroIconContainer}>
            <MaterialCommunityIcons name="home-group" size={48} color="#FFF" />
          </View>
          <Text style={styles.aboutHeroTitle}>MAHTO - Home Building OS</Text>
          <Text style={styles.aboutHeroSubtitle}>
            MAHTO is the operating system for home building.
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutText}>
            We are building one unified system that brings together everything required to build a home — from land and labor to construction materials, financing, and delivery.
          </Text>
          <Text style={[styles.aboutText, { marginTop: 12 }]}>
            Today, building a home means dealing with fragmented vendors, contractors, workers, and middlemen. <Text style={{ fontWeight: 'bold', color: '#000' }}>MAHTO</Text> simplifies this entire journey into a single, integrated platform — end to end.
          </Text>
        </View>

        {/* Ecosystem */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>What we’re building</Text>
          <Text style={styles.aboutSectionSubtitle}>MAHTO Ecosystem</Text>

          <View style={styles.ecosystemContainer}>
            <EcosystemItem
              icon="account-hard-hat"
              title="MAHTO"
              desc="Worker, Contractor & Shops Marketplace"
            />
            <EcosystemItem
              icon="home-city"
              title="Mine (by MAHTO)"
              desc="Full-stack Construction & Renovation Services"
            />
            <EcosystemItem
              icon="bank"
              title="MAHTO Home Loans"
              desc="Home Loans Marketplace"
            />
            <EcosystemItem
              icon="terrain"
              title="MAHTO Land & Properties"
              desc="Land & Property Listings"
            />
          </View>

          <View style={styles.infoNote}>
            <MaterialCommunityIcons name="information" size={20} color="#0047AB" />
            <Text style={styles.infoNoteText}>
              “Full-stack” at MAHTO means from land to lending — not just design to construction.
            </Text>
          </View>
        </View>

        {/* Mission & Vision */}
        <View style={styles.missionVisionContainer}>
          <View style={styles.mvCard}>
            <View style={styles.mvIconCircle}>
              <MaterialCommunityIcons name="target" size={24} color="#FFF" />
            </View>
            <Text style={styles.mvTitle}>Our Mission</Text>
            <Text style={styles.mvText}>A roof over every head — not a roof, but own roof.</Text>
            <Text style={styles.mvQuote}>“Sabka sar apni chhaat.”</Text>
          </View>

          <View style={styles.mvCard}>
            <View style={[styles.mvIconCircle, { backgroundColor: '#002171' }]}>
              <MaterialCommunityIcons name="eye-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.mvTitle}>Our Vision</Text>
            <Text style={styles.mvText}>To raise living standards by becoming the global operating system for home building.</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 40 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#E0E0E0', letterSpacing: 4 }}>MAHTO</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Main Application Components ---
// --- SavedPropertiesScreen Component ---
function SavedPropertiesScreen({ navigation }) {
  const { userData } = React.useContext(UserContext);
  const savedItems = [
    { id: 1, title: 'Luxury Villa', location: 'South Delhi', price: '₹5.5 Cr', icon: 'home-modern' },
    { id: 2, title: 'Modern Office', location: 'Gurugram', price: '₹2.1 Cr', icon: 'office-building' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ActivityScreen Component ---
function ActivityScreen({ navigation }) {
  const activities = [
    { id: 1, title: 'Home Renovation', status: 'In Progress', date: 'June 12', icon: 'progress-wrench' },
    { id: 2, title: 'Consultation', status: 'Completed', date: 'May 05', icon: 'check-circle' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
      </ScrollView>
    </SafeAreaView>
  );
}


function MainTabs() {
  const { t } = React.useContext(LanguageContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          height: Platform.OS === 'ios' ? 100 : 85,
          paddingBottom: Platform.OS === 'ios' ? 40 : 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#AAA',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-variant';
          else if (route.name === 'Activity') iconName = 'clock-outline';
          else if (route.name === 'Saved') iconName = 'heart-outline';
          else if (route.name === 'Profile') iconName = 'account-outline';
          return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Saved" component={SavedPropertiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: '#FFF' },
              contentStyle: { backgroundColor: '#FFF' },
            }}
          >
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
            <Stack.Screen name="HelpSupportMenu" component={HelpSupportMenuScreen} />
            <Stack.Screen name="NotificationInbox" component={NotificationInboxScreen} />
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
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 40,
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
    padding: 24,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  uberPromoDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  uberPromoBtn: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F3F3',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
