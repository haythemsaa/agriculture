import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLoyaltyProgram } from '../../hooks/useLoyaltyProgram';

const LoyaltyScreen = () => {
  const {
    account,
    rewards,
    transactions,
    loading,
    fetchAccount,
    fetchRewards,
    fetchTransactions,
    redeemReward,
    getTierBenefits,
  } = useLoyaltyProgram();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchAccount(),
      fetchRewards(),
      fetchTransactions(),
    ]);
  };

  const handleRedeemReward = async (rewardId: number) => {
    Alert.alert(
      'Échanger des points',
      'Voulez-vous échanger vos points contre cette récompense?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Échanger',
          onPress: async () => {
            const success = await redeemReward(rewardId);
            if (success) {
              Alert.alert('Succès', 'Récompense échangée avec succès!');
            }
          },
        },
      ]
    );
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
    };
    return colors[tier.toLowerCase()] || '#cd7f32';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!account) {
    return null;
  }

  const tierBenefits = getTierBenefits(account.tier);
  const progressPercent = account.next_tier_points
    ? (account.points / account.next_tier_points) * 100
    : 100;

  return (
    <ScrollView style={styles.container}>
      {/* Tier Card */}
      <View style={[styles.tierCard, { borderTopColor: getTierColor(account.tier) }]}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierBadge}>{account.tier.toUpperCase()}</Text>
          <Text style={styles.pointsLabel}>Points disponibles</Text>
        </View>
        <Text style={styles.pointsValue}>{account.points}</Text>

        {account.next_tier && account.next_tier_points && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {account.next_tier_points - account.points} points pour atteindre {account.next_tier}
            </Text>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Vos avantages {account.tier}</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>{tierBenefits.points_multiplier}x points sur chaque achat</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎁</Text>
            <Text style={styles.benefitText}>{tierBenefits.birthday_bonus} points bonus anniversaire</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚚</Text>
            <Text style={styles.benefitText}>
              {tierBenefits.free_shipping ? 'Livraison gratuite' : 'Réductions sur la livraison'}
            </Text>
          </View>
          {tierBenefits.early_access && (
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Accès anticipé aux promotions</Text>
            </View>
          )}
        </View>
      </View>

      {/* Available Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récompenses disponibles</Text>
        {rewards.filter(r => r.is_available).map((reward) => (
          <View key={reward.id} style={styles.rewardCard}>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardDescription}>{reward.description}</Text>
              <View style={styles.rewardFooter}>
                <Text style={styles.rewardCost}>{reward.points_cost} points</Text>
                {reward.expiry_date && (
                  <Text style={styles.rewardExpiry}>
                    Expire le {new Date(reward.expiry_date).toLocaleDateString('fr-TN')}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.redeemButton,
                account.points < reward.points_cost && styles.redeemButtonDisabled,
              ]}
              onPress={() => handleRedeemReward(reward.id)}
              disabled={account.points < reward.points_cost}
            >
              <Text style={styles.redeemButtonText}>
                {account.points < reward.points_cost ? 'Insuffisant' : 'Échanger'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique récent</Text>
        {transactions.slice(0, 10).map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionType}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.created_at).toLocaleDateString('fr-TN')}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionPoints,
                transaction.points > 0 ? styles.pointsEarned : styles.pointsSpent,
              ]}
            >
              {transaction.points > 0 ? '+' : ''}{transaction.points}
            </Text>
          </View>
        ))}
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
  tierCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderTopWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  benefitsSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 12,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  rewardExpiry: {
    fontSize: 11,
    color: '#ef4444',
  },
  redeemButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  redeemButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionPoints: {
    fontSize: 16,
    fontWeight: '700',
  },
  pointsEarned: {
    color: '#10b981',
  },
  pointsSpent: {
    color: '#ef4444',
  },
});

export default LoyaltyScreen;
