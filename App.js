import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, TextInput, ActivityIndicator, Alert, Switch, Linking, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { translations } from './translations';

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
    profileImage: null
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

// --- Reusable Custom Header Component ---
function CustomHeader({ title, subtitle, navigation, showBack = false }) {
  return (
    <View style={styles.customHeaderContainer}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1A1A1A" />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1, alignItems: showBack ? 'flex-start' : 'center' }}>
        <Text style={styles.screenTitle}>{title}</Text>
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// --- HomeScreen Component ---
function HomeScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const { userData } = React.useContext(UserContext);
  const services = [
    {
      id: 'Construction',
      title: t('construction'),
      icon: 'home',
      description: 'Full-stack construction services for residential and commercial projects.'
    },
    {
      id: 'Renovation',
      title: t('renovation'),
      icon: 'auto-fix',
      description: 'Transform your space with our premium renovation solutions.'
    },
    {
      id: 'Service',
      title: t('service'),
      icon: 'hammer-wrench',
      description: 'Reliable maintenance and repair services at your doorstep.'
    },
  ];

  const handlePress = (serviceId) => {
    navigation.navigate(serviceId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Stylish Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>
            <Text style={styles.welcomeBrand}>mine</Text>
            <Text style={styles.welcomeSubtitle}>by MAHTO</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButtonCard}
            onPress={() => navigation.navigate('Profile')}
          >
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={{ width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: '#FFF' }} />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={48} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>{t('tagline')}</Text>

        <View style={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handlePress(service.id)}
            >
              <View style={styles.iconContainer}>
                {service.id === 'Construction' ? (
                  <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="home" size={24} color="#0047AB" style={{ position: 'absolute', bottom: 0, left: 0 }} />
                    <MaterialCommunityIcons
                      name="hammer"
                      size={20}
                      color="#0047AB"
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        transform: [{ scaleX: -1 }, { rotate: '30deg' }]
                      }}
                    />
                  </View>
                ) : (
                  <MaterialCommunityIcons name={service.icon} size={32} color="#0047AB" />
                )}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardDescription}>{service.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

// --- ProfileScreen Component ---
function ProfileScreen({ navigation }) {
  const { t } = React.useContext(LanguageContext);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [confirmPhone, setConfirmPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const accountItems = [
    { title: t('editProfile'), icon: 'account-edit', onPress: () => navigation.navigate('EditProfile') },
    { title: t('notification'), icon: 'bell-outline', onPress: () => navigation.navigate('Notification') },
    { title: t('languages'), icon: 'translate', onPress: () => navigation.navigate('Languages') },
  ];

  const informationItems = [
    { title: 'About Us', icon: 'information-outline', onPress: () => navigation.navigate('AboutUs') },
    { title: 'Terms & Condition', icon: 'file-document-outline', onPress: () => navigation.navigate('TermsCondition') },
    { title: 'Privacy Policy', icon: 'shield-check-outline', onPress: () => navigation.navigate('PrivacyPolicy') },
    { title: 'Refund Policy', icon: 'cash-refund', onPress: () => navigation.navigate('RefundPolicy') },
  ];

  const actionItems = [
    { title: t('logout'), icon: 'logout', color: '#FF3B30', onPress: () => setLogoutVisible(true) },
    { title: t('deleteAccount'), icon: 'delete-forever', color: '#FF3B30', onPress: () => setDeleteVisible(true) },
  ];

  const renderMenuSection = (title, items) => (
    <View style={styles.sectionContainer}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.profileMenuContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === items.length - 1 && styles.lastMenuItem]}
            onPress={item.onPress} // Added onPress handler
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, item.color && { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={24}
                  color={item.color || "#0047AB"}
                />
              </View>
              <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                {item.title}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title={t('myProfile')}
          subtitle="Manage your account settings" // Could translate
          navigation={navigation}
          showBack={true}
        />

        {renderMenuSection(t('accountSettings'), accountItems)}
        {renderMenuSection(t('support'), [
          { title: t('helpCenter'), icon: 'help-circle-outline', onPress: () => navigation.navigate('HelpCenter') },
          { title: t('contactUs'), icon: 'email-outline', onPress: () => navigation.navigate('ContactUs') },
          { title: t('rateUs'), icon: 'star-outline' },
        ])}
        {renderMenuSection(t('information'), informationItems)}
        {renderMenuSection(t('actions'), actionItems)}

      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutVisible}
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutCard}>
            <View style={styles.logoutIconContainer}>
              <MaterialCommunityIcons name="logout" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.logoutTitle}>{t('logout')}</Text>
            <Text style={styles.logoutMessage}>Are you sure you want to log out?</Text>

            <View style={styles.logoutButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelButtonText}>No, Stay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setLogoutVisible(false);
                  Alert.alert("Logged Out", "You have been logged out successfully.");
                }}
              >
                <Text style={styles.confirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteVisible}
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutCard}>
            <View style={styles.logoutIconContainer}>
              <MaterialCommunityIcons name="alert-octagon" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.logoutTitle}>{t('deleteAccount')}</Text>
            <Text style={styles.logoutMessage}>
              This action cannot be undone. Please confirm your details to delete permanently.
            </Text>

            <View style={styles.modalInputWrapper}>
              <MaterialCommunityIcons name="phone" size={20} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Phone Number"
                value={confirmPhone}
                onChangeText={setConfirmPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.logoutButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  if (confirmPhone && confirmPassword) {
                    setDeleteVisible(false);
                    Alert.alert("Account Deleted", "Your account has been permanently deleted.");
                    // Logic to navigate to login/welcome
                  } else {
                    Alert.alert("Error", "Please enter your phone and password.");
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Delete Forever</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' }]}>
                <MaterialCommunityIcons name="account" size={80} color="#0047AB" />
              </View>
            )}
            <TouchableOpacity style={styles.editIconBadge} onPress={pickImage}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
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
          <View style={[styles.contactCard, { backgroundColor: '#0047AB' }]}>
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
    { title: 'Commercial Projects', icon: 'domain', details: 'Offices, retail spaces, and warehouses.' },
    { title: 'Industrial Construction', icon: 'factory', details: 'Heavy-duty construction for industrial needs.' },
    { title: 'Project Management', icon: 'clipboard-list', details: 'End-to-end management of your build.' },
  ];

  const handlePress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Construction Services"
          subtitle="Building your dreams with precision."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {constructionServices.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridCard}
              onPress={() => handlePress(item)}
            >
              <MaterialCommunityIcons name={item.icon} size={40} color="#0047AB" style={{ marginBottom: 10 }} />
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
    { title: 'Kitchen Remodel', icon: 'silverware-fork-knife', details: 'Modern designs for the heart of your home.' },
    { title: 'Bathroom Upgrade', icon: 'shower', details: 'Spa-like retreats and functional layouts.' },
    { title: 'Flooring', icon: 'floor-plan', details: 'Hardwood, tile, and luxury vinyl installation.' },
    { title: 'Full Home Makeover', icon: 'home-circle', details: 'Complete transformation of your living space.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Renovation Services"
          subtitle="Revitalize your improved space."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {renovationServices.map((item, index) => (
            <View key={index} style={styles.gridCard}>
              <MaterialCommunityIcons name={item.icon} size={40} color="#0047AB" style={{ marginBottom: 10 }} />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDetails}>{item.details}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ServiceScreen Component ---
function ServiceScreen({ navigation }) {
  const serviceOptions = [
    { title: 'Plumbing', icon: 'water-pump', details: 'Leak repairs, installations, and maintenance.' },
    { title: 'Electrical', icon: 'flash', details: 'Wiring, lighting, and safety inspections.' },
    { title: 'HVAC', icon: 'air-conditioner', details: 'Heating, ventilation, and air conditioning.' },
    { title: 'General Repairs', icon: 'hammer-wrench', details: 'Fixing the small things before they grow.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomHeader
          title="Maintenance Services"
          subtitle="Reliable repairs when you need them."
          navigation={navigation}
          showBack={true}
        />

        <View style={styles.gridContainer}>
          {serviceOptions.map((item, index) => (
            <View key={index} style={styles.gridCard}>
              <MaterialCommunityIcons name={item.icon} size={40} color="#0047AB" style={{ marginBottom: 10 }} />
              <Text style={styles.gridTitle}>{item.title}</Text>
              <Text style={styles.gridDetails}>{item.details}</Text>
            </View>
          ))}
        </View>
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
            <Text style={{ fontSize: 13, color: '#0047AB', lineHeight: 20 }}>
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
            Today, building a home means dealing with fragmented vendors, contractors, workers, and middlemen. <Text style={{ fontWeight: 'bold', color: '#0047AB' }}>MAHTO</Text> simplifies this entire journey into a single, integrated platform — end to end.
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

// --- Main App Component with Navigation ---
export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: '#F8F9FA' },
              contentStyle: { backgroundColor: '#F8F9FA' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Construction" component={ConstructionScreen} />
            <Stack.Screen name="ResidentialBuild" component={ResidentialBuildScreen} />
            <Stack.Screen name="Renovation" component={RenovationScreen} />
            <Stack.Screen name="Service" component={ServiceScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Languages" component={LanguageScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="TermsCondition" component={TermsConditionScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Stylish Welcome Card Styles
  welcomeCard: {
    backgroundColor: '#0047AB',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: 20,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 0,
    fontWeight: '500',
  },
  welcomeBrand: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#FFFFFF', // Clean white
    marginTop: -5,
    letterSpacing: 1,
    fontWeight: '600',
  },
  profileButtonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0047AB',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  servicesContainer: {
    gap: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
  },
  ctaButton: {
    marginTop: 40,
    backgroundColor: '#0047AB',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Custom Header Styles
  customHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '47%', // 2 columns roughly
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridDetails: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  // Profile Styles
  profileMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  // Edit Profile Styles
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD', // Fallback color
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0047AB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    height: 50, // Fixed height for standard inputs
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#0047AB',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#0047AB',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Contact Us Styles
  contactCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  contactCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactCardDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  contactCardButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    alignItems: 'center',
  },
  contactCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  // Notification Styles
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  // Help Center Styles
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  helpCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8
  },
  helpCardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20
  },
  helpCardButton: {
    backgroundColor: '#0047AB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  helpCardButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15
  },
  // About Us Styles
  aboutHero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  aboutHeroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  aboutHeroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  aboutHeroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  aboutSection: {
    padding: 24,
    backgroundColor: '#FFF',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0047AB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aboutSectionSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
  },
  ecosystemContainer: {
    marginTop: 8,
  },
  ecoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
  },
  ecoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  ecoDesc: {
    fontSize: 13,
    color: '#666',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#0047AB',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  missionVisionContainer: {
    paddingHorizontal: 16,
  },
  mvCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mvIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mvTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  mvText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  mvQuote: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  // Terms Styles
  termsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  termsFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  termsFooterText: {
    fontSize: 13,
    color: '#0047AB',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  }
});
