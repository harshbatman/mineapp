import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  const services = [
    { title: 'Construction', icon: 'office-building', description: 'Full-stack construction services for residential and commercial projects.' },
    { title: 'Renovation', icon: 'home-edit', description: 'Transform your space with our premium renovation solutions.' },
    { title: 'Service', icon: 'tools', description: 'Reliable maintenance and repair services at your doorstep.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.brandName}>Mine</Text>
          <Text style={styles.brandSubtitle}>by MAHTO</Text>
          <Text style={styles.tagline}>Full Stack Construction, Renovation, Service</Text>
        </View>

        <View style={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity key={index} style={styles.card} activeOpacity={0.8}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={service.icon} size={32} color="#FFD700" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardDescription}>{service.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 18,
    color: '#FFD700', // Gold color for premium feel
    marginTop: -5,
    marginBottom: 10,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 10,
  },
  servicesContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  ctaButton: {
    marginTop: 40,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
