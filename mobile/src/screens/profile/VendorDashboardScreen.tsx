import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useVendorDashboard } from '../../hooks/useVendorDashboard';

const { width } = Dimensions.get('window');

const VendorDashboardScreen = () => {
  const {
    metrics,
    topProducts,
    recentOrders,
    loading,
    fetchMetrics,
    fetchTopProducts,
    fetchRecentOrders,
  } = useVendorDashboard();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    await Promise.all([
      fetchMetrics(period),
      fetchTopProducts(period),
      fetchRecentOrders(),
    ]);
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(2)} TND`;
  };

  const getOrderStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
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
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
        >
          <Text
            style={[
              styles.periodText,
              period === 'week' && styles.periodTextActive,
            ]}
          >
            Semaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
        >
          <Text
            style={[
              styles.periodText,
              period === 'month' && styles.periodTextActive,
            ]}
          >
            Mois
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
          onPress={() => setPeriod('year')}
        >
          <Text
            style={[
              styles.periodText,
              period === 'year' && styles.periodTextActive,
            ]}
          >
            Année
          </Text>
        </TouchableOpacity>
      </View>

      {/* Key Metrics */}
      {metrics && (
        <>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <Text style={styles.metricIcon}>💰</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(metrics.revenue)}
              </Text>
              <Text style={styles.metricLabel}>Chiffre d'affaires</Text>
              {metrics.revenue_growth !== 0 && (
                <Text
                  style={[
                    styles.growth,
                    metrics.revenue_growth > 0 ? styles.growthPositive : styles.growthNegative,
                  ]}
                >
                  {metrics.revenue_growth > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(metrics.revenue_growth)}%
                </Text>
              )}
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>📦</Text>
              <Text style={styles.metricValue}>{metrics.orders}</Text>
              <Text style={styles.metricLabel}>Commandes</Text>
              {metrics.orders_growth !== 0 && (
                <Text
                  style={[
                    styles.growth,
                    metrics.orders_growth > 0 ? styles.growthPositive : styles.growthNegative,
                  ]}
                >
                  {metrics.orders_growth > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(metrics.orders_growth)}%
                </Text>
              )}
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>👥</Text>
              <Text style={styles.metricValue}>{metrics.customers}</Text>
              <Text style={styles.metricLabel}>Clients</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>⭐</Text>
              <Text style={styles.metricValue}>
                {metrics.average_rating.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>Note moyenne</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🎯</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(metrics.average_order_value)}
              </Text>
              <Text style={styles.metricLabel}>Panier moyen</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>📊</Text>
              <Text style={styles.metricValue}>
                {metrics.conversion_rate.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Taux conversion</Text>
            </View>
          </View>
        </>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produits les plus vendus</Text>
          {topProducts.map((product, index) => (
            <View key={product.product_id} style={styles.productCard}>
              <View style={styles.productRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.product_name}</Text>
                <Text style={styles.productStats}>
                  {product.units_sold} unités • {formatCurrency(product.revenue)}
                </Text>
              </View>
              <View style={styles.productMetric}>
                <Text style={styles.productOrders}>{product.orders}</Text>
                <Text style={styles.productOrdersLabel}>commandes</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes récentes</Text>
          {recentOrders.slice(0, 10).map((order) => (
            <View key={order.order_id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.order_number}</Text>
                <View
                  style={[
                    styles.orderStatus,
                    { backgroundColor: getOrderStatusColor(order.status) },
                  ]}
                >
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderCustomer}>{order.customer_name}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('fr-TN')}
                </Text>
                <Text style={styles.orderAmount}>
                  {formatCurrency(order.total_amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Gérer produits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Gérer stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Paiements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Rapports</Text>
          </TouchableOpacity>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#10b981',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricCardPrimary: {
    backgroundColor: '#10b981',
  },
  metricIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  growth: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  growthPositive: {
    color: '#10b981',
  },
  growthNegative: {
    color: '#ef4444',
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
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  productRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 13,
    color: '#6b7280',
  },
  productMetric: {
    alignItems: 'flex-end',
  },
  productOrders: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  productOrdersLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  actionCard: {
    width: (width - 40) / 2,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

export default VendorDashboardScreen;
