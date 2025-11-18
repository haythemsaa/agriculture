import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGamification } from '../../hooks/useGamification';

const GamificationScreen = () => {
  const {
    stats,
    badges,
    challenges,
    leaderboard,
    loading,
    fetchStats,
    fetchBadges,
    fetchActiveChallenges,
    fetchLeaderboard,
    claimChallenge,
  } = useGamification();

  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'leaderboard'>('badges');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchStats(),
      fetchBadges(),
      fetchActiveChallenges(),
      fetchLeaderboard('weekly'),
    ]);
  };

  const handleClaimChallenge = async (challengeId: number) => {
    const success = await claimChallenge(challengeId);
    if (success) {
      Alert.alert('Félicitations!', 'Vous avez complété ce défi et gagné des points!');
    }
  };

  const getBadgeColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: '#9ca3af',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b',
    };
    return colors[rarity] || '#9ca3af';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.levelSection}>
            <Text style={styles.levelLabel}>Niveau</Text>
            <Text style={styles.levelValue}>{stats.level}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(stats.xp / stats.next_level_xp) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {stats.xp} / {stats.next_level_xp} XP
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.badges_earned}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.challenges_completed}</Text>
              <Text style={styles.statLabel}>Défis</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.rank}</Text>
              <Text style={styles.statLabel}>Rang</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
          onPress={() => setActiveTab('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.tabTextActive]}>
            Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
            Défis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Classement
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.earned && styles.badgeCardLocked,
                  { borderColor: getBadgeColor(badge.rarity) },
                ]}
              >
                <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                  {badge.icon}
                </Text>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {badge.description}
                </Text>
                {badge.earned ? (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedText}>✓ Obtenu</Text>
                  </View>
                ) : (
                  <Text style={styles.badgeProgress}>
                    {badge.progress || 0} / {badge.requirement}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <View>
            {challenges.map((challenge) => {
              const progressPercent = (challenge.progress / challenge.target) * 100;
              const isCompleted = challenge.progress >= challenge.target;

              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeName}>{challenge.name}</Text>
                      <Text style={styles.challengeDescription}>
                        {challenge.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.challengeProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {challenge.progress} / {challenge.target}
                    </Text>
                  </View>

                  <View style={styles.challengeFooter}>
                    <View style={styles.rewardInfo}>
                      <Text style={styles.rewardLabel}>Récompense:</Text>
                      <Text style={styles.rewardValue}>{challenge.reward_xp} XP</Text>
                    </View>
                    {isCompleted && !challenge.claimed && (
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => handleClaimChallenge(challenge.id)}
                      >
                        <Text style={styles.claimButtonText}>Réclamer</Text>
                      </TouchableOpacity>
                    )}
                    {challenge.claimed && (
                      <View style={styles.claimedBadge}>
                        <Text style={styles.claimedText}>✓ Réclamé</Text>
                      </View>
                    )}
                  </View>

                  {challenge.end_time && (
                    <Text style={styles.challengeExpiry}>
                      Expire le {new Date(challenge.end_time).toLocaleDateString('fr-TN')}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <View>
            {leaderboard.map((entry, index) => (
              <View key={entry.user_id} style={styles.leaderboardCard}>
                <View style={styles.rankBadge}>
                  {index < 3 ? (
                    <Text style={styles.rankMedal}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Text>
                  ) : (
                    <Text style={styles.rankNumber}>{entry.rank}</Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{entry.user_name}</Text>
                  <Text style={styles.userLevel}>Niveau {entry.level}</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreValue}>{entry.total_xp}</Text>
                  <Text style={styles.scoreLabel}>XP</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  statsCard: {
    backgroundColor: '#10b981',
    padding: 24,
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelLabel: {
    fontSize: 14,
    color: '#d1fae5',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 13,
    color: '#d1fae5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#d1fae5',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#10b981',
  },
  content: {
    flex: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  badgeProgress: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  challengeProgress: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 6,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  claimButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  claimedBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimedText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  challengeExpiry: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'right',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankMedal: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 13,
    color: '#6b7280',
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
});

export default GamificationScreen;
