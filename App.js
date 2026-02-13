import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
  const services = [
    {
      id: 'Construction',
      title: 'Construction',
      icon: 'home',
      description: 'Full-stack construction services for residential and commercial projects.'
    },
    {
      id: 'Renovation',
      title: 'Renovation',
      icon: 'auto-fix',
      description: 'Transform your space with our premium renovation solutions.'
    },
    {
      id: 'Service',
      title: 'Service',
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
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.welcomeBrand}>mine</Text>
            <Text style={styles.welcomeSubtitle}>by MAHTO</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButtonCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account-circle" size={48} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>Full Stack Construction, Renovation, Service</Text>

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
  const accountItems = [
    { title: 'Edit Profile', icon: 'account-edit' },
    { title: 'Notification', icon: 'bell-outline' },
    { title: 'Languages', icon: 'translate' },
  ];

  const informationItems = [
    { title: 'About Us', icon: 'information-outline' },
    { title: 'Terms & Condition', icon: 'file-document-outline' },
    { title: 'Privacy Policy', icon: 'shield-check-outline' },
    { title: 'Refund Policy', icon: 'cash-refund' },
  ];

  const actionItems = [
    { title: 'Logout', icon: 'logout', color: '#FF3B30' },
    { title: 'Permanent Account Delete', icon: 'delete-forever', color: '#FF3B30' },
  ];

  const renderMenuSection = (title, items) => (
    <View style={styles.sectionContainer}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.profileMenuContainer}>
        {items.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.menuItem, index === items.length - 1 && styles.lastMenuItem]}>
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
          title="My Profile"
          subtitle="Manage your account settings"
          navigation={navigation}
          showBack={true}
        />

        {renderMenuSection('Account Settings', accountItems)}
        {renderMenuSection('Help & Support', [
          { title: 'Help Center/FAQ', icon: 'help-circle-outline' },
          { title: 'Contact Us', icon: 'email-outline' },
          { title: 'Rate Us', icon: 'star-outline' },
        ])}
        {renderMenuSection('Information', informationItems)}
        {renderMenuSection('Actions', actionItems)}

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ConstructionScreen Component ---
function ConstructionScreen({ navigation }) {
  const constructionServices = [
    { title: 'Residential Building', icon: 'home', details: 'Custom homes built from the ground up.' },
    { title: 'Commercial Projects', icon: 'domain', details: 'Offices, retail spaces, and warehouses.' },
    { title: 'Industrial Construction', icon: 'factory', details: 'Heavy-duty construction for industrial needs.' },
    { title: 'Project Management', icon: 'clipboard-list', details: 'End-to-end management of your build.' },
  ];

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

// --- Main App Component with Navigation ---
export default function App() {
  return (
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
        <Stack.Screen name="Renovation" component={RenovationScreen} />
        <Stack.Screen name="Service" component={ServiceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
    borderRadius: 50,
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
});
