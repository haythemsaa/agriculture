import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useReferralProgram } from '../../hooks/useReferralProgram';

const ReferralScreen = () => {
  const {
    account,
    referrals,
    stats,
    loading,
    fetchAccount,
    fetchReferrals,
    fetchStats,
    generateReferralCode,
    shareReferralCode,
  } = useReferralProgram();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchAccount(), fetchReferrals(), fetchStats()]);
  };

  const handleShare = async () => {
    if (!account?.referral_code) {
      Alert.alert('Erreur', 'Code de parrainage non disponible');
      return;
    }

    const success = await shareReferralCode(account.referral_code);
    if (!success) {
      Alert.alert('Erreur', 'Impossible de partager le code');
    }
  };

  const handleGenerateCode = async () => {
    const code = await generateReferralCode();
    if (code) {
      Alert.alert('Succès', `Votre nouveau code: ${code}`);
    }
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff',
    };
    return colors[tier.toLowerCase()] || '#10b981';
  };

  const getTierReward = (tier: string): string => {
    const rewards: Record<string, string> = {
      bronze: '5 TND',
      silver: '10 TND',
      gold: '15 TND',
      platinum: '25 TND',
      diamond: '50 TND',
    };
    return rewards[tier.toLowerCase()] || '5 TND';
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
      {/* Referral Code Card */}
      {account && (
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>Votre code de parrainage</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{account.referral_code}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤 Partager mon code</Text>
          </TouchableOpacity>
          <Text style={styles.codeHint}>
            Partagez votre code et gagnez des récompenses pour chaque ami parrainé!
          </Text>
        </View>
      )}

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_referrals}</Text>
            <Text style={styles.statLabel}>Parrainages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.successful_referrals}</Text>
            <Text style={styles.statLabel}>Réussis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_earnings.toFixed(0)} TND</Text>
            <Text style={styles.statLabel}>Gains totaux</Text>
          </View>
        </View>
      )}

      {/* Tier Info */}
      {account && (
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierTitle}>Niveau actuel</Text>
            <View
              style={[styles.tierBadge, { backgroundColor: getTierColor(account.tier) }]}
            >
              <Text style={styles.tierName}>{account.tier.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.tierReward}>
            Gagnez {getTierReward(account.tier)} par parrainage réussi
          </Text>

          {/* Tier Benefits */}
          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Vos avantages:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💰</Text>
              <Text style={styles.benefitText}>
                {getTierReward(account.tier)} par ami inscrit
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎁</Text>
              <Text style={styles.benefitText}>
                Bonus de {account.tier === 'diamond' ? '50' : '10'}% sur le premier achat de
                votre filleul
              </Text>
            </View>
            {account.tier !== 'bronze' && (
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⚡</Text>
                <Text style={styles.benefitText}>Paiements mensuels automatiques</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* How it works */}
      <View style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>Comment ça marche?</Text>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Partagez votre code</Text>
            <Text style={styles.stepDescription}>
              Envoyez votre code unique à vos amis et votre famille
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ils s'inscrivent</Text>
            <Text style={styles.stepDescription}>
              Vos filleuls utilisent votre code lors de l'inscription
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Vous gagnez!</Text>
            <Text style={styles.stepDescription}>
              Recevez votre récompense après leur première commande
            </Text>
          </View>
        </View>
      </View>

      {/* Referrals List */}
      {referrals.length > 0 && (
        <View style={styles.referralsCard}>
          <Text style={styles.referralsTitle}>
            Vos parrainages ({referrals.length})
          </Text>
          {referrals.map((referral) => (
            <View key={referral.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>{referral.referred_user_name}</Text>
                <Text style={styles.referralDate}>
                  {new Date(referral.created_at).toLocaleDateString('fr-TN')}
                </Text>
              </View>
              <View style={styles.referralStatus}>
                {referral.status === 'completed' ? (
                  <>
                    <Text style={styles.referralEarning}>
                      +{referral.commission.toFixed(2)} TND
                    </Text>
                    <Text style={styles.statusBadgeSuccess}>✓ Réussi</Text>
                  </>
                ) : (
                  <Text style={styles.statusBadgePending}>⏳ En attente</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Terms */}
      <View style={styles.termsCard}>
        <Text style={styles.termsTitle}>Conditions du programme</Text>
        <Text style={styles.termsText}>
          • Le parrainage est validé après le premier achat du filleul{'\n'}
          • Les récompenses sont créditées sous 48h{'\n'}
          • Minimum de retrait: 20 TND{'\n'}
          • Valable uniquement pour les nouveaux utilisateurs{'\n'}• Un seul code par utilisateur
        </Text>
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
  codeCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  codeTitle: {
    fontSize: 16,
    color: '#d1fae5',
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 4,
  },
  shareButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  codeHint: {
    fontSize: 13,
    color: '#d1fae5',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tierCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  tierReward: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 20,
  },
  benefits: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  howItWorksCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  referralsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  referralsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  referralEarning: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statusBadgeSuccess: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  statusBadgePending: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  termsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default ReferralScreen;
