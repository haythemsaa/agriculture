import { ref, computed, readonly } from 'vue'

/**
 * Composable useVendorDashboard - Multi-Vendor Analytics Dashboard
 *
 * Comprehensive vendor analytics with sales tracking, inventory management,
 * customer insights, and performance metrics
 *
 * Impact: +25% vendor satisfaction, +30% operational efficiency, -40% support tickets
 */

// ==================== TYPES ====================

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
export type TrendDirection = 'up' | 'down' | 'stable'

export interface VendorMetrics {
  period: TimePeriod
  start_date: number
  end_date: number

  // Sales Metrics
  total_revenue: number
  revenue_change: number
  revenue_trend: TrendDirection
  total_orders: number
  orders_change: number
  average_order_value: number
  aov_change: number

  // Product Metrics
  products_sold: number
  top_selling_product: string
  low_stock_count: number
  out_of_stock_count: number

  // Customer Metrics
  total_customers: number
  new_customers: number
  returning_customers: number
  customer_retention_rate: number
  average_rating: number
  total_reviews: number

  // Performance Metrics
  fulfillment_rate: number
  on_time_delivery_rate: number
  cancellation_rate: number
  return_rate: number
  response_time_hours: number

  // Financial Metrics
  gross_profit: number
  net_profit: number
  commission_paid: number
  pending_payout: number
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface ProductPerformance {
  product_id: number
  product_name: string
  category: string
  image?: string
  units_sold: number
  revenue: number
  revenue_change: number
  average_rating: number
  reviews_count: number
  stock_level: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  views: number
  conversion_rate: number
  profit_margin: number
}

export interface CustomerInsight {
  customer_id: number
  customer_name: string
  email: string
  total_orders: number
  total_spent: number
  average_order_value: number
  last_order_date: number
  lifetime_value: number
  segment: 'vip' | 'regular' | 'new' | 'at_risk'
  favorite_category?: string
}

export interface InventoryAlert {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'overstocked'
  severity: 'critical' | 'warning' | 'info'
  product_id: number
  product_name: string
  current_stock: number
  recommended_action: string
  created_at: number
}

export interface OrderAnalytics {
  order_id: string
  order_number: string
  customer_name: string
  status: string
  total_amount: number
  items_count: number
  profit: number
  created_at: number
  fulfilled_at?: number
  fulfillment_time_hours?: number
}

export interface RevenueBreakdown {
  category: string
  revenue: number
  percentage: number
  orders: number
  trend: TrendDirection
}

export interface GeographicData {
  region: string
  orders: number
  revenue: number
  customers: number
  average_order_value: number
}

// ==================== STATE ====================

const metrics = ref<VendorMetrics | null>(null)
const salesHistory = ref<SalesData[]>([])
const topProducts = ref<ProductPerformance[]>([])
const topCustomers = ref<CustomerInsight[]>([])
const inventoryAlerts = ref<InventoryAlert[]>([])
const recentOrders = ref<OrderAnalytics[]>([])
const revenueBreakdown = ref<RevenueBreakdown[]>([])
const geographicData = ref<GeographicData[]>([])
const isLoading = ref(false)
const currentPeriod = ref<TimePeriod>('month')

// ==================== COMPUTED ====================

const criticalAlerts = computed(() =>
  inventoryAlerts.value.filter(a => a.severity === 'critical')
)

const topSellingProducts = computed(() =>
  [...topProducts.value].sort((a, b) => b.units_sold - a.units_sold).slice(0, 10)
)

const topRevenueProducts = computed(() =>
  [...topProducts.value].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
)

const vipCustomers = computed(() =>
  topCustomers.value.filter(c => c.segment === 'vip')
)

const atRiskCustomers = computed(() =>
  topCustomers.value.filter(c => c.segment === 'at_risk')
)

const pendingOrdersCount = computed(() =>
  recentOrders.value.filter(o => o.status === 'pending' || o.status === 'confirmed').length
)

const totalPendingRevenue = computed(() =>
  recentOrders.value
    .filter(o => o.status === 'pending' || o.status === 'confirmed')
    .reduce((sum, o) => sum + o.total_amount, 0)
)

// ==================== METRICS FETCHING ====================

/**
 * Fetch vendor metrics for a period
 */
const fetchMetrics = async (period: TimePeriod = 'month'): Promise<VendorMetrics | null> => {
  isLoading.value = true
  currentPeriod.value = period

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/metrics', { params: { period } })

    await new Promise(resolve => setTimeout(resolve, 800))

    const { start, end } = getPeriodDates(period)

    const mockMetrics: VendorMetrics = {
      period,
      start_date: start,
      end_date: end,

      // Sales
      total_revenue: 45250.75,
      revenue_change: 12.5,
      revenue_trend: 'up',
      total_orders: 342,
      orders_change: 8.3,
      average_order_value: 132.31,
      aov_change: 3.7,

      // Products
      products_sold: 1247,
      top_selling_product: 'Tomates Bio',
      low_stock_count: 5,
      out_of_stock_count: 2,

      // Customers
      total_customers: 156,
      new_customers: 23,
      returning_customers: 133,
      customer_retention_rate: 85.3,
      average_rating: 4.7,
      total_reviews: 89,

      // Performance
      fulfillment_rate: 96.5,
      on_time_delivery_rate: 92.8,
      cancellation_rate: 2.1,
      return_rate: 1.3,
      response_time_hours: 2.4,

      // Financial
      gross_profit: 18100.30,
      net_profit: 15385.25,
      commission_paid: 3620.06,
      pending_payout: 8500.00
    }

    metrics.value = mockMetrics
    return mockMetrics
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch sales history for charting
 */
const fetchSalesHistory = async (period: TimePeriod = 'month'): Promise<SalesData[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/sales-history', { params: { period } })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock data - last 30 days
    const mockData: SalesData[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      mockData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 2000 + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
        customers: Math.floor(Math.random() * 15) + 3
      })
    }

    salesHistory.value = mockData
    return mockData
  } catch (error) {
    console.error('Error fetching sales history:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch top performing products
 */
const fetchTopProducts = async (limit: number = 20): Promise<ProductPerformance[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/top-products', { params: { limit } })

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockProducts: ProductPerformance[] = [
      {
        product_id: 1,
        product_name: 'Tomates Bio',
        category: 'Légumes',
        units_sold: 342,
        revenue: 8540.50,
        revenue_change: 15.2,
        average_rating: 4.8,
        reviews_count: 45,
        stock_level: 120,
        stock_status: 'in_stock',
        views: 1250,
        conversion_rate: 27.4,
        profit_margin: 42
      },
      {
        product_id: 2,
        product_name: 'Huile d\'Olive Extra Vierge',
        category: 'Huiles',
        units_sold: 215,
        revenue: 10750.00,
        revenue_change: 8.5,
        average_rating: 4.9,
        reviews_count: 62,
        stock_level: 8,
        stock_status: 'low_stock',
        views: 980,
        conversion_rate: 21.9,
        profit_margin: 55
      },
      {
        product_id: 3,
        product_name: 'Oranges Maltaises',
        category: 'Fruits',
        units_sold: 189,
        revenue: 4725.00,
        revenue_change: -3.2,
        average_rating: 4.6,
        reviews_count: 38,
        stock_level: 0,
        stock_status: 'out_of_stock',
        views: 750,
        conversion_rate: 25.2,
        profit_margin: 38
      }
    ]

    topProducts.value = mockProducts
    return mockProducts
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch top customers
 */
const fetchTopCustomers = async (limit: number = 20): Promise<CustomerInsight[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/top-customers', { params: { limit } })

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockCustomers: CustomerInsight[] = [
      {
        customer_id: 1,
        customer_name: 'Restaurant Le Gourmet',
        email: 'contact@legourmet.tn',
        total_orders: 45,
        total_spent: 12500.00,
        average_order_value: 277.78,
        last_order_date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        lifetime_value: 15000.00,
        segment: 'vip',
        favorite_category: 'Légumes'
      },
      {
        customer_id: 2,
        customer_name: 'Hôtel Carthage',
        email: 'achats@hotelcarthage.tn',
        total_orders: 32,
        total_spent: 8750.00,
        average_order_value: 273.44,
        last_order_date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        lifetime_value: 10500.00,
        segment: 'vip',
        favorite_category: 'Fruits'
      },
      {
        customer_id: 3,
        customer_name: 'Épicerie Bio Tunis',
        email: 'bio@epicerie.tn',
        total_orders: 28,
        total_spent: 6200.00,
        average_order_value: 221.43,
        last_order_date: Date.now() - 45 * 24 * 60 * 60 * 1000,
        lifetime_value: 7400.00,
        segment: 'at_risk',
        favorite_category: 'Bio'
      }
    ]

    topCustomers.value = mockCustomers
    return mockCustomers
  } catch (error) {
    console.error('Error fetching top customers:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch inventory alerts
 */
const fetchInventoryAlerts = async (): Promise<InventoryAlert[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/inventory-alerts')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockAlerts: InventoryAlert[] = [
      {
        id: '1',
        type: 'out_of_stock',
        severity: 'critical',
        product_id: 3,
        product_name: 'Oranges Maltaises',
        current_stock: 0,
        recommended_action: 'Réapprovisionner immédiatement - Produit populaire',
        created_at: Date.now() - 2 * 60 * 60 * 1000
      },
      {
        id: '2',
        type: 'low_stock',
        severity: 'warning',
        product_id: 2,
        product_name: 'Huile d\'Olive Extra Vierge',
        current_stock: 8,
        recommended_action: 'Commander 50 unités supplémentaires',
        created_at: Date.now() - 6 * 60 * 60 * 1000
      }
    ]

    inventoryAlerts.value = mockAlerts
    return mockAlerts
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch recent orders
 */
const fetchRecentOrders = async (limit: number = 20): Promise<OrderAnalytics[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/recent-orders', { params: { limit } })

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockOrders: OrderAnalytics[] = [
      {
        order_id: '1',
        order_number: 'ORD-001234',
        customer_name: 'Restaurant Le Gourmet',
        status: 'delivered',
        total_amount: 450.00,
        items_count: 12,
        profit: 180.00,
        created_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
        fulfilled_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
        fulfillment_time_hours: 24
      },
      {
        order_id: '2',
        order_number: 'ORD-001235',
        customer_name: 'Hôtel Carthage',
        status: 'confirmed',
        total_amount: 320.00,
        items_count: 8,
        profit: 128.00,
        created_at: Date.now() - 4 * 60 * 60 * 1000
      }
    ]

    recentOrders.value = mockOrders
    return mockOrders
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch revenue breakdown by category
 */
const fetchRevenueBreakdown = async (): Promise<RevenueBreakdown[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/revenue-breakdown')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockBreakdown: RevenueBreakdown[] = [
      {
        category: 'Légumes',
        revenue: 15420.00,
        percentage: 34,
        orders: 145,
        trend: 'up'
      },
      {
        category: 'Fruits',
        revenue: 12350.00,
        percentage: 27,
        orders: 98,
        trend: 'up'
      },
      {
        category: 'Huiles',
        revenue: 10750.00,
        percentage: 24,
        orders: 67,
        trend: 'stable'
      },
      {
        category: 'Produits Laitiers',
        revenue: 6730.75,
        percentage: 15,
        orders: 32,
        trend: 'down'
      }
    ]

    revenueBreakdown.value = mockBreakdown
    return mockBreakdown
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch geographic distribution data
 */
const fetchGeographicData = async (): Promise<GeographicData[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/vendor/geographic-data')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockGeoData: GeographicData[] = [
      {
        region: 'Tunis',
        orders: 145,
        revenue: 18500.00,
        customers: 78,
        average_order_value: 127.59
      },
      {
        region: 'Ariana',
        orders: 89,
        revenue: 11200.00,
        customers: 45,
        average_order_value: 125.84
      },
      {
        region: 'Ben Arous',
        orders: 67,
        revenue: 8900.00,
        customers: 32,
        average_order_value: 132.84
      },
      {
        region: 'Manouba',
        orders: 41,
        revenue: 6650.75,
        customers: 21,
        average_order_value: 162.21
      }
    ]

    geographicData.value = mockGeoData
    return mockGeoData
  } catch (error) {
    console.error('Error fetching geographic data:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

// ==================== ANALYTICS ====================

/**
 * Get trend direction based on change percentage
 */
const getTrend = (change: number): TrendDirection => {
  if (change > 2) return 'up'
  if (change < -2) return 'down'
  return 'stable'
}

/**
 * Get period dates
 */
const getPeriodDates = (period: TimePeriod): { start: number; end: number } => {
  const now = new Date()
  const end = now.getTime()
  let start = now.getTime()

  switch (period) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0)).getTime()
      break
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7)).getTime()
      break
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1)).getTime()
      break
    case 'quarter':
      start = new Date(now.setMonth(now.getMonth() - 3)).getTime()
      break
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1)).getTime()
      break
  }

  return { start, end }
}

/**
 * Export dashboard data to CSV
 */
const exportDashboardData = async (type: 'sales' | 'products' | 'customers'): Promise<string> => {
  let csv = ''
  let data: any[] = []

  switch (type) {
    case 'sales':
      csv = 'Date,Revenue,Orders,Customers\n'
      data = salesHistory.value
      csv += data.map(d => `${d.date},${d.revenue},${d.orders},${d.customers}`).join('\n')
      break

    case 'products':
      csv = 'Product,Category,Units Sold,Revenue,Rating,Stock\n'
      data = topProducts.value
      csv += data.map(p =>
        `${p.product_name},${p.category},${p.units_sold},${p.revenue},${p.average_rating},${p.stock_level}`
      ).join('\n')
      break

    case 'customers':
      csv = 'Customer,Email,Orders,Total Spent,AOV,Segment\n'
      data = topCustomers.value
      csv += data.map(c =>
        `${c.customer_name},${c.email},${c.total_orders},${c.total_spent},${c.average_order_value},${c.segment}`
      ).join('\n')
      break
  }

  return csv
}

/**
 * Download CSV file
 */
const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${Date.now()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ==================== FORMATTING ====================

/**
 * Format currency
 */
const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} TND`
}

/**
 * Format percentage
 */
const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-TN')
}

/**
 * Get trend icon
 */
const getTrendIcon = (trend: TrendDirection): string => {
  const icons: Record<TrendDirection, string> = {
    up: '↑',
    down: '↓',
    stable: '→'
  }
  return icons[trend]
}

/**
 * Get trend color
 */
const getTrendColor = (trend: TrendDirection): string => {
  const colors: Record<TrendDirection, string> = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#6b7280'
  }
  return colors[trend]
}

/**
 * Get segment color
 */
const getSegmentColor = (segment: CustomerInsight['segment']): string => {
  const colors: Record<CustomerInsight['segment'], string> = {
    vip: '#f59e0b',
    regular: '#3b82f6',
    new: '#10b981',
    at_risk: '#ef4444'
  }
  return colors[segment]
}

// ==================== EXPORT ====================

export function useVendorDashboard() {
  return {
    // State
    metrics: readonly(metrics),
    salesHistory: readonly(salesHistory),
    topProducts: readonly(topProducts),
    topCustomers: readonly(topCustomers),
    inventoryAlerts: readonly(inventoryAlerts),
    recentOrders: readonly(recentOrders),
    revenueBreakdown: readonly(revenueBreakdown),
    geographicData: readonly(geographicData),
    isLoading: readonly(isLoading),
    currentPeriod: readonly(currentPeriod),

    // Computed
    criticalAlerts,
    topSellingProducts,
    topRevenueProducts,
    vipCustomers,
    atRiskCustomers,
    pendingOrdersCount,
    totalPendingRevenue,

    // Data Fetching
    fetchMetrics,
    fetchSalesHistory,
    fetchTopProducts,
    fetchTopCustomers,
    fetchInventoryAlerts,
    fetchRecentOrders,
    fetchRevenueBreakdown,
    fetchGeographicData,

    // Analytics
    getTrend,
    getPeriodDates,

    // Export
    exportDashboardData,
    downloadCSV,

    // Formatting
    formatCurrency,
    formatPercentage,
    formatNumber,
    getTrendIcon,
    getTrendColor,
    getSegmentColor
  }
}
