import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLiveShopping } from '../../hooks/useLiveShopping';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'LiveShopping'>;
};

const LiveShoppingScreen = ({ navigation }: Props) => {
  const {
    liveSessions,
    auctions,
    flashDeals,
    loading,
    fetchLiveSessions,
    fetchActiveAuctions,
    fetchActiveFlashDeals,
    joinSession,
    placeBid,
    claimDeal,
  } = useLiveShopping();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchLiveSessions(),
      fetchActiveAuctions(),
      fetchActiveFlashDeals(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinSession = async (sessionId: number) => {
    const success = await joinSession(sessionId);
    if (success) {
      Alert.alert('Succès', 'Vous avez rejoint la session live!');
    }
  };

  const handlePlaceBid = async (auctionId: number, currentBid: number) => {
    Alert.prompt(
      'Placer une enchère',
      `Enchère actuelle: ${currentBid.toFixed(2)} TND`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Enchérir',
          onPress: async (bidAmount) => {
            if (bidAmount) {
              const amount = parseFloat(bidAmount);
              const success = await placeBid(auctionId, amount);
              if (success) {
                Alert.alert('Succès', 'Votre enchère a été placée!');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleClaimDeal = async (dealId: number) => {
    const success = await claimDeal(dealId);
    if (success) {
      Alert.alert('Succès', 'Promotion ajoutée au panier!');
    }
  };

  const formatTimeRemaining = (endTime: number): string => {
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) return 'Terminé';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔴 Live Shopping</Text>
        <Text style={styles.headerSubtitle}>
          Sessions en direct, enchères et promotions flash
        </Text>
      </View>

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎥 Sessions Live</Text>
          {liveSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.liveCard}
              onPress={() => handleJoinSession(session.id)}
            >
              <View style={styles.liveCardHeader}>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>🔴 LIVE</Text>
                </View>
                <Text style={styles.viewersCount}>
                  👥 {session.viewers_count} spectateurs
                </Text>
              </View>
              <Text style={styles.liveTitle}>{session.title}</Text>
              <Text style={styles.liveHost}>par {session.host_name}</Text>
              <Text style={styles.liveDescription} numberOfLines={2}>
                {session.description}
              </Text>
              <View style={styles.liveFooter}>
                <Text style={styles.productsCount}>
                  {session.products_count} produits
                </Text>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinSession(session.id)}
                >
                  <Text style={styles.joinButtonText}>Rejoindre →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Active Auctions */}
      {auctions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔨 Enchères en cours</Text>
          {auctions.map((auction) => (
            <View key={auction.id} style={styles.auctionCard}>
              <View style={styles.auctionImageContainer}>
                {auction.product_image ? (
                  <Image
                    source={{ uri: auction.product_image }}
                    style={styles.auctionImage}
                  />
                ) : (
                  <View style={[styles.auctionImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>🌾</Text>
                  </View>
                )}
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>
                    ⏱️ {formatTimeRemaining(auction.end_time)}
                  </Text>
                </View>
              </View>
              <View style={styles.auctionInfo}>
                <Text style={styles.auctionProduct}>{auction.product_name}</Text>
                <View style={styles.bidInfo}>
                  <View>
                    <Text style={styles.bidLabel}>Enchère actuelle</Text>
                    <Text style={styles.bidAmount}>
                      {auction.current_bid.toFixed(2)} TND
                    </Text>
                  </View>
                  <View style={styles.bidStats}>
                    <Text style={styles.bidCount}>{auction.bids_count} enchères</Text>
                    <Text style={styles.bidIncrement}>
                      Min: +{auction.min_increment.toFixed(2)} TND
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bidButton}
                  onPress={() => handlePlaceBid(auction.id, auction.current_bid)}
                >
                  <Text style={styles.bidButtonText}>Enchérir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Promotions Flash</Text>
          {flashDeals.map((deal) => (
            <View key={deal.id} style={styles.dealCard}>
              <View style={styles.dealHeader}>
                <View style={styles.flashBadge}>
                  <Text style={styles.flashText}>⚡ FLASH</Text>
                </View>
                <Text style={styles.dealTimer}>
                  {formatTimeRemaining(deal.end_time)}
                </Text>
              </View>
              <View style={styles.dealContent}>
                <View style={styles.dealImageContainer}>
                  {deal.product_image ? (
                    <Image
                      source={{ uri: deal.product_image }}
                      style={styles.dealImage}
                    />
                  ) : (
                    <View style={[styles.dealImage, styles.imagePlaceholder]}>
                      <Text style={styles.placeholderTextSmall}>🌾</Text>
                    </View>
                  )}
                </View>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealProduct} numberOfLines={2}>
                    {deal.product_name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.dealPrice}>
                      {deal.flash_price.toFixed(2)} TND
                    </Text>
                    <Text style={styles.originalPrice}>
                      {deal.original_price.toFixed(2)} TND
                    </Text>
                  </View>
                  <View style={styles.stockBar}>
                    <View
                      style={[
                        styles.stockBarFill,
                        {
                          width: `${(deal.claimed_count / deal.max_quantity) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.stockText}>
                    {deal.max_quantity - deal.claimed_count} / {deal.max_quantity} restants
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  deal.claimed_count >= deal.max_quantity && styles.claimButtonDisabled,
                ]}
                onPress={() => handleClaimDeal(deal.id)}
                disabled={deal.claimed_count >= deal.max_quantity}
              >
                <Text style={styles.claimButtonText}>
                  {deal.claimed_count >= deal.max_quantity ? 'Épuisé' : 'Profiter'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {liveSessions.length === 0 && auctions.length === 0 && flashDeals.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📺</Text>
          <Text style={styles.emptyTitle}>Aucune session active</Text>
          <Text style={styles.emptyText}>
            Revenez plus tard pour découvrir nos sessions live, enchères et promotions flash
          </Text>
        </View>
      )}
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
    backgroundColor: '#111827',
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  liveCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  liveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewersCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  liveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  liveHost: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 8,
  },
  liveDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  liveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productsCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  auctionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  auctionImageContainer: {
    position: 'relative',
  },
  auctionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  placeholderTextSmall: {
    fontSize: 40,
  },
  timerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  auctionInfo: {
    padding: 16,
  },
  auctionProduct: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bidLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  bidStats: {
    alignItems: 'flex-end',
  },
  bidCount: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  bidIncrement: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bidButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dealCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flashBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flashText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealTimer: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '700',
  },
  dealContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dealImageContainer: {
    marginRight: 12,
  },
  dealImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  dealInfo: {
    flex: 1,
  },
  dealProduct: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  stockBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 6,
  },
  stockBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  stockText: {
    fontSize: 12,
    color: '#6b7280',
  },
  claimButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    lineHeight: 20,
  },
});

export default LiveShoppingScreen;
