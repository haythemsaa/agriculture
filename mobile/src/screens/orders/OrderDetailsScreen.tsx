import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { OrdersStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrderDetails'>;
  route: RouteProp<OrdersStackParamList, 'OrderDetails'>;
};

const OrderDetailsScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const { orderDetails, loading, fetchOrderDetails, cancelOrder } = useOrderTracking();

  useEffect(() => {
    fetchOrderDetails(orderId);
  }, [orderId]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelOrder(orderId, 'Client request');
            if (success) {
              Alert.alert('Succès', 'Commande annulée', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  if (loading || !orderDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(orderDetails.status);
  const canTrack = orderDetails.status === 'shipped';

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{orderDetails.order_number}</Text>
          <Text style={styles.orderDate}>
            {new Date(orderDetails.created_at).toLocaleDateString('fr-TN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(orderDetails.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(orderDetails.status)}</Text>
        </View>
      </View>

      {/* Track Order Button */}
      {canTrack && (
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() =>
            navigation.navigate('OrderTracking', { orderId: orderDetails.id })
          }
        >
          <Text style={styles.trackButtonIcon}>📍</Text>
          <Text style={styles.trackButtonText}>Suivre ma livraison en temps réel</Text>
        </TouchableOpacity>
      )}

      {/* Timeline */}
      <View style={styles.timelineCard}>
        <Text style={styles.cardTitle}>Statut de la commande</Text>
        <View style={styles.timeline}>
          {orderDetails.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < orderDetails.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{event.status}</Text>
                <Text style={styles.timelineDescription}>{event.description}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(event.created_at).toLocaleString('fr-TN')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsCard}>
        <Text style={styles.cardTitle}>Articles ({orderDetails.items.length})</Text>
        {orderDetails.items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemDetails}>
                {item.quantity} {item.unit} × {item.price.toFixed(2)} TND
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {(item.quantity * item.price).toFixed(2)} TND
            </Text>
          </View>
        ))}
      </View>

      {/* Payment Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Résumé</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>
            {orderDetails.subtotal.toFixed(2)} TND
          </Text>
        </View>
        {orderDetails.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remise</Text>
            <Text style={styles.discountValue}>
              -{orderDetails.discount.toFixed(2)} TND
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison</Text>
          <Text style={styles.summaryValue}>
            {orderDetails.shipping_cost === 0
              ? 'Gratuite'
              : `${orderDetails.shipping_cost.toFixed(2)} TND`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {orderDetails.total_amount.toFixed(2)} TND
          </Text>
        </View>
        {orderDetails.payment_method && (
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentLabel}>Moyen de paiement:</Text>
            <Text style={styles.paymentValue}>{orderDetails.payment_method}</Text>
          </View>
        )}
      </View>

      {/* Delivery Address */}
      <View style={styles.addressCard}>
        <Text style={styles.cardTitle}>Adresse de livraison</Text>
        <Text style={styles.addressText}>
          {orderDetails.delivery_address.address}
        </Text>
        <Text style={styles.addressText}>
          {orderDetails.delivery_address.city},{' '}
          {orderDetails.delivery_address.postal_code}
        </Text>
        {orderDetails.delivery_address.phone && (
          <Text style={styles.addressPhone}>
            📞 {orderDetails.delivery_address.phone}
          </Text>
        )}
      </View>

      {/* Vendor Info */}
      {orderDetails.vendor && (
        <View style={styles.vendorCard}>
          <Text style={styles.cardTitle}>Vendeur</Text>
          <Text style={styles.vendorName}>{orderDetails.vendor.name}</Text>
          {orderDetails.vendor.phone && (
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>
                💬 Contacter le vendeur
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Cancel Button */}
      {canCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
          <Text style={styles.cancelButtonText}>Annuler la commande</Text>
        </TouchableOpacity>
      )}

      {/* Help */}
      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpButtonText}>Besoin d'aide?</Text>
      </TouchableOpacity>

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
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 12,
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  trackButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 32,
    paddingBottom: 20,
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
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {},
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentMethod: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  addressCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
  },
  vendorCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  helpButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  bottomPadding: {
    height: 32,
  },
});

export default OrderDetailsScreen;
