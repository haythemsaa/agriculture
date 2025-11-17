/**
 * Composable for performance monitoring and optimization
 * Tracks page load times, component rendering, and user interactions
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface LoadingState {
  isLoading: boolean
  error: Error | null
  data: any
}

export const usePerformance = () => {
  const metrics = ref<PerformanceMetric[]>([])

  /**
   * Measure page load performance
   */
  const measurePageLoad = () => {
    if (!process.client) return

    window.addEventListener('load', () => {
      // Get navigation timing
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (perfData) {
        const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart
        const domInteractive = perfData.domInteractive - perfData.fetchStart
        const domComplete = perfData.domComplete - perfData.fetchStart

        addMetric('page_load', pageLoadTime, {
          domInteractive,
          domComplete,
          type: perfData.type,
        })

        // Log if page load is slow
        if (pageLoadTime > 3000) {
          console.warn(`⚠️ Slow page load: ${pageLoadTime}ms`)
        }
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        addMetric(entry.name, entry.startTime)
      })
    })
  }

  /**
   * Measure component rendering time
   */
  const measureRender = (componentName: string) => {
    if (!process.client) return { start: () => {}, end: () => {} }

    const startMark = `${componentName}-render-start`
    const endMark = `${componentName}-render-end`
    const measureName = `${componentName}-render`

    return {
      start: () => {
        performance.mark(startMark)
      },
      end: () => {
        performance.mark(endMark)
        performance.measure(measureName, startMark, endMark)

        const measure = performance.getEntriesByName(measureName)[0]
        if (measure) {
          addMetric(`render_${componentName}`, measure.duration)

          // Warn if render is slow
          if (measure.duration > 100) {
            console.warn(`⚠️ Slow render for ${componentName}: ${measure.duration.toFixed(2)}ms`)
          }
        }

        // Cleanup
        performance.clearMarks(startMark)
        performance.clearMarks(endMark)
        performance.clearMeasures(measureName)
      },
    }
  }

  /**
   * Measure API call performance
   */
  const measureApiCall = async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await apiCall()
      const duration = performance.now() - startTime

      addMetric(`api_${endpoint}`, duration, {
        success: true,
        endpoint,
      })

      // Warn if API call is slow
      if (duration > 1000) {
        console.warn(`⚠️ Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      addMetric(`api_${endpoint}`, duration, {
        success: false,
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }

  /**
   * Add a performance metric
   */
  const addMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    metrics.value.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    })

    // Keep only last 100 metrics
    if (metrics.value.length > 100) {
      metrics.value = metrics.value.slice(-100)
    }
  }

  /**
   * Get performance metrics summary
   */
  const getMetricsSummary = () => {
    const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {}

    metrics.value.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        }
      }

      const s = summary[metric.name]
      s.count++
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
    })

    return summary
  }

  /**
   * Log performance report to console
   */
  const logPerformanceReport = () => {
    const summary = getMetricsSummary()

    console.group('📊 Performance Report')
    Object.entries(summary).forEach(([name, stats]) => {
      console.log(
        `${name}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms, count=${stats.count}`
      )
    })
    console.groupEnd()
  }

  /**
   * Debounce function for performance optimization
   */
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        fn(...args)
      }, delay)
    }
  }

  /**
   * Throttle function for performance optimization
   */
  const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  /**
   * Lazy load images with IntersectionObserver
   */
  const useLazyLoad = (threshold: number = 0.1) => {
    const observer = ref<IntersectionObserver | null>(null)

    const observe = (element: HTMLElement, callback: () => void) => {
      if (!process.client) return

      if (!observer.value) {
        observer.value = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                callback()
                observer.value?.unobserve(entry.target)
              }
            })
          },
          { threshold }
        )
      }

      observer.value.observe(element)
    }

    const disconnect = () => {
      observer.value?.disconnect()
    }

    return { observe, disconnect }
  }

  /**
   * Check if device is low-end
   */
  const isLowEndDevice = () => {
    if (!process.client) return false

    // Check navigator.hardwareConcurrency (number of CPU cores)
    const cpuCores = navigator.hardwareConcurrency || 1

    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory || 4

    // Consider low-end if < 4 cores or < 4GB RAM
    return cpuCores < 4 || deviceMemory < 4
  }

  /**
   * Optimize animations based on device capability
   */
  const shouldReduceAnimations = () => {
    if (!process.client) return false

    // Check user preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check if low-end device
    const isLowEnd = isLowEndDevice()

    return prefersReducedMotion || isLowEnd
  }

  return {
    metrics: readonly(metrics),
    measurePageLoad,
    measureRender,
    measureApiCall,
    addMetric,
    getMetricsSummary,
    logPerformanceReport,
    debounce,
    throttle,
    useLazyLoad,
    isLowEndDevice,
    shouldReduceAnimations,
  }
}

/**
 * Composable for managing loading states
 */
export const useLoadingState = <T = any>(initialState: T | null = null) => {
  const state = reactive<LoadingState>({
    isLoading: false,
    error: null,
    data: initialState,
  })

  const execute = async <R = T>(asyncFn: () => Promise<R>): Promise<R | null> => {
    state.isLoading = true
    state.error = null

    try {
      const result = await asyncFn()
      state.data = result
      return result
    } catch (error) {
      state.error = error instanceof Error ? error : new Error('Unknown error')
      console.error('Loading error:', error)
      return null
    } finally {
      state.isLoading = false
    }
  }

  const reset = () => {
    state.isLoading = false
    state.error = null
    state.data = initialState
  }

  return {
    ...toRefs(state),
    execute,
    reset,
  }
}
