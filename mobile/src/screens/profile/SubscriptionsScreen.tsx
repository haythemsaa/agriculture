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
import { useSubscriptions } from '../../hooks/useSubscriptions';

const SubscriptionsScreen = ({ navigation }: any) => {
  const {
    subscriptions,
    loading,
    fetchSubscriptions,
    pauseSubscription,
    resumeSubscription,
    skipNextDelivery,
    cancelSubscription,
  } = useSubscriptions();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePause = async (subscriptionId: number) => {
    Alert.alert(
      'Mettre en pause',
      'Voulez-vous mettre cet abonnement en pause?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            const success = await pauseSubscription(subscriptionId);
            if (success) {
              Alert.alert('Succès', 'Abonnement mis en pause');
            }
          },
        },
      ]
    );
  };

  const handleResume = async (subscriptionId: number) => {
    const success = await resumeSubscription(subscriptionId);
    if (success) {
      Alert.alert('Succès', 'Abonnement réactivé');
    }
  };

  const handleSkip = async (subscriptionId: number) => {
    Alert.alert(
      'Sauter la prochaine livraison',
      'La prochaine livraison sera reportée au cycle suivant.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            const success = await skipNextDelivery(subscriptionId);
            if (success) {
              Alert.alert('Succès', 'Prochaine livraison sautée');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (subscriptionId: number) => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler cet abonnement? Cette action est irréversible.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelSubscription(subscriptionId);
            if (success) {
              Alert.alert('Succès', 'Abonnement annulé');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#10b981',
      paused: '#f59e0b',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      active: 'Actif',
      paused: 'En pause',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  };

  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      weekly: 'Hebdomadaire',
      biweekly: 'Toutes les 2 semaines',
      monthly: 'Mensuel',
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Mes Abonnements</Text>
        <Text style={styles.headerSubtitle}>
          Gérez vos livraisons récurrentes et économisez jusqu'à 20%
        </Text>
      </View>

      {/* Active Subscriptions */}
      {subscriptions.filter((s) => s.status === 'active').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements actifs</Text>
          {subscriptions
            .filter((s) => s.status === 'active')
            .map((subscription) => (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {subscription.product_name}
                    </Text>
                    <Text style={styles.quantity}>
                      {subscription.quantity} {subscription.unit} •{' '}
                      {getFrequencyLabel(subscription.frequency)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(subscription.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(subscription.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <View>
                    <Text style={styles.priceLabel}>Prix unitaire</Text>
                    <Text style={styles.price}>
                      {subscription.price.toFixed(2)} TND
                    </Text>
                  </View>
                  {subscription.discount_percent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        -{subscription.discount_percent}%
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Prochaine livraison:</Text>
                  <Text style={styles.deliveryDate}>
                    {new Date(subscription.next_delivery).toLocaleDateString('fr-TN')}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSkip(subscription.id)}
                  >
                    <Text style={styles.actionButtonText}>Sauter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePause(subscription.id)}
                  >
                    <Text style={styles.actionButtonText}>Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleCancel(subscription.id)}
                  >
                    <Text style={styles.actionButtonTextDanger}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Paused Subscriptions */}
      {subscriptions.filter((s) => s.status === 'paused').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements en pause</Text>
          {subscriptions
            .filter((s) => s.status === 'paused')
            .map((subscription) => (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {subscription.product_name}
                    </Text>
                    <Text style={styles.quantity}>
                      {subscription.quantity} {subscription.unit} •{' '}
                      {getFrequencyLabel(subscription.frequency)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(subscription.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusLabel(subscription.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleResume(subscription.id)}
                  >
                    <Text style={styles.actionButtonTextPrimary}>Réactiver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleCancel(subscription.id)}
                  >
                    <Text style={styles.actionButtonTextDanger}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      )}

      {subscriptions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Aucun abonnement</Text>
          <Text style={styles.emptyText}>
            Créez un abonnement pour recevoir vos produits préférés régulièrement et
            économiser jusqu'à 20%
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Découvrir les produits</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Benefits Card */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>
          Avantages des abonnements
        </Text>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>💰</Text>
          <Text style={styles.benefitText}>
            Économisez jusqu'à 20% sur vos produits préférés
          </Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🚚</Text>
          <Text style={styles.benefitText}>
            Livraison gratuite sur tous les abonnements
          </Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>⚙️</Text>
          <Text style={styles.benefitText}>
            Modifiez ou annulez à tout moment, sans engagement
          </Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>⏰</Text>
          <Text style={styles.benefitText}>
            Ne manquez jamais vos produits essentiels
          </Text>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
  },
  statusText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  discountBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  actionButtonPrimary: {
    backgroundColor: '#10b981',
  },
  actionButtonDanger: {
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});

export default SubscriptionsScreen;
