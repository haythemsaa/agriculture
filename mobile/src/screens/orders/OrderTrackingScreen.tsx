import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OrdersStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrderTracking'>;
  route: RouteProp<OrdersStackParamList, 'OrderTracking'>;
};

const OrderTrackingScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const { trackingInfo, loading, fetchTrackingInfo } = useOrderTracking();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrackingData();
  }, [orderId]);

  const loadTrackingData = async () => {
    await fetchTrackingInfo(orderId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrackingData();
    setRefreshing(false);
  };

  if (loading && !refreshing || !trackingInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const estimatedDelivery = new Date(trackingInfo.estimated_delivery);
  const isDelayed = trackingInfo.status === 'delayed';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
      }
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.orderNumber}>#{trackingInfo.order_number}</Text>
        <Text style={styles.currentStatus}>{trackingInfo.current_status}</Text>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Livraison estimée:</Text>
          <Text style={[styles.deliveryDate, isDelayed && styles.deliveryDateDelayed]}>
            {estimatedDelivery.toLocaleDateString('fr-TN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          {isDelayed && (
            <Text style={styles.delayedNotice}>⚠️ Retard possible</Text>
          )}
        </View>
      </View>

      {/* Live GPS Location */}
      {trackingInfo.gps_location && (
        <View style={styles.mapCard}>
          <Text style={styles.cardTitle}>Position en temps réel</Text>
          {/* In a real app, use react-native-maps here */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>
              Latitude: {trackingInfo.gps_location.lat.toFixed(4)}
              {'\n'}
              Longitude: {trackingInfo.gps_location.lng.toFixed(4)}
            </Text>
            {trackingInfo.gps_location.last_updated && (
              <Text style={styles.mapUpdate}>
                Mise à jour:{' '}
                {new Date(trackingInfo.gps_location.last_updated).toLocaleTimeString('fr-TN')}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Driver Info */}
      {trackingInfo.driver && (
        <View style={styles.driverCard}>
          <Text style={styles.cardTitle}>Votre livreur</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {trackingInfo.driver.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{trackingInfo.driver.name}</Text>
              {trackingInfo.driver.phone && (
                <Text style={styles.driverPhone}>📞 {trackingInfo.driver.phone}</Text>
              )}
              {trackingInfo.driver.vehicle && (
                <Text style={styles.driverVehicle}>
                  🚗 {trackingInfo.driver.vehicle}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Tracking Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.cardTitle}>Suivi de la livraison</Text>
        <View style={styles.timeline}>
          {trackingInfo.timeline.map((event, index) => {
            const isLatest = index === 0;
            const isCompleted = true; // All events in timeline are completed
            return (
              <View key={index} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    isLatest && styles.timelineDotActive,
                    !isCompleted && styles.timelineDotPending,
                  ]}
                />
                {index < trackingInfo.timeline.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      !isCompleted && styles.timelineLinePending,
                    ]}
                  />
                )}
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      isLatest && styles.timelineTitleActive,
                    ]}
                  >
                    {event.status}
                  </Text>
                  <Text style={styles.timelineDescription}>{event.description}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(event.timestamp).toLocaleString('fr-TN')}
                  </Text>
                  {event.location && (
                    <Text style={styles.timelineLocation}>📍 {event.location}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Delivery Photos */}
      {trackingInfo.delivery_photos && trackingInfo.delivery_photos.length > 0 && (
        <View style={styles.photosCard}>
          <Text style={styles.cardTitle}>Photos de livraison</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trackingInfo.delivery_photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                {photo.url ? (
                  <Image source={{ uri: photo.url }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>📷</Text>
                  </View>
                )}
                {photo.caption && (
                  <Text style={styles.photoCaption}>{photo.caption}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contact Information */}
      <View style={styles.contactCard}>
        <Text style={styles.cardTitle}>Besoin d'aide?</Text>
        <Text style={styles.contactText}>
          Pour toute question concernant votre livraison, contactez notre support.
        </Text>
        <View style={styles.contactButtons}>
          <View style={styles.contactButton}>
            <Text style={styles.contactButtonIcon}>💬</Text>
            <Text style={styles.contactButtonText}>Chat</Text>
          </View>
          <View style={styles.contactButton}>
            <Text style={styles.contactButtonIcon}>📞</Text>
            <Text style={styles.contactButtonText}>Appeler</Text>
          </View>
          <View style={styles.contactButton}>
            <Text style={styles.contactButtonIcon}>✉️</Text>
            <Text style={styles.contactButtonText}>Email</Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      {trackingInfo.delivery_instructions && (
        <View style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>Instructions de livraison</Text>
          <Text style={styles.instructionsText}>
            {trackingInfo.delivery_instructions}
          </Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#10b981',
    padding: 24,
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    color: '#d1fae5',
    marginBottom: 4,
  },
  currentStatus: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  deliveryInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  deliveryLabel: {
    fontSize: 13,
    color: '#d1fae5',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  deliveryDateDelayed: {
    color: '#fecaca',
  },
  delayedNotice: {
    fontSize: 13,
    color: '#fef3c7',
    marginTop: 8,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    paddingBottom: 12,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mapText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapUpdate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  driverCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#6b7280',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 32,
    paddingBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  timelineDotActive: {
    width: 16,
    height: 16,
    top: 2,
    left: -2,
    borderWidth: 3,
  },
  timelineDotPending: {
    backgroundColor: '#e5e7eb',
    borderColor: '#f3f4f6',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: '#d1fae5',
  },
  timelineLinePending: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {},
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineTitleActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  timelineDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  photosCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderRadius: 12,
  },
  photoContainer: {
    marginLeft: 16,
    marginBottom: 16,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
  },
  photoCaption: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    maxWidth: 160,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});

export default OrderTrackingScreen;
