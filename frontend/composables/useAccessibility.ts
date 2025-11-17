/**
 * Composable for accessibility features
 * Provides utilities for keyboard navigation, ARIA attributes, and screen reader support
 */

interface FocusTrapOptions {
  initialFocus?: HTMLElement | null
  onEscape?: () => void
}

export const useAccessibility = () => {
  /**
   * Create a focus trap within a container
   * Useful for modals, dropdowns, and other overlay components
   */
  const createFocusTrap = (container: Ref<HTMLElement | null>, options: FocusTrapOptions = {}) => {
    const focusableElements = computed(() => {
      if (!container.value) return []

      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.value.querySelectorAll(selector)) as HTMLElement[]
    })

    const firstFocusable = computed(() => focusableElements.value[0])
    const lastFocusable = computed(() => focusableElements.value[focusableElements.value.length - 1])

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        if (e.key === 'Escape' && options.onEscape) {
          options.onEscape()
        }
        return
      }

      if (focusableElements.value.length === 0) return

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable.value) {
          e.preventDefault()
          lastFocusable.value?.focus()
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastFocusable.value) {
          e.preventDefault()
          firstFocusable.value?.focus()
        }
      }
    }

    const activate = () => {
      document.addEventListener('keydown', handleKeyDown)

      // Set initial focus
      nextTick(() => {
        const elementToFocus = options.initialFocus || firstFocusable.value
        elementToFocus?.focus()
      })
    }

    const deactivate = () => {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return {
      activate,
      deactivate,
      focusableElements,
    }
  }

  /**
   * Announce message to screen readers
   */
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!process.client) return

    const announcer = document.getElementById('a11y-announcer') || createAnnouncer()
    announcer.setAttribute('aria-live', priority)

    // Clear and set new message
    announcer.textContent = ''
    setTimeout(() => {
      announcer.textContent = message
    }, 100)
  }

  /**
   * Create screen reader announcer element
   */
  const createAnnouncer = () => {
    const announcer = document.createElement('div')
    announcer.id = 'a11y-announcer'
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
    return announcer
  }

  /**
   * Generate unique ID for ARIA relationships
   */
  const generateId = (prefix: string = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Manage skip links for keyboard navigation
   */
  const useSkipLinks = () => {
    const skipToContent = () => {
      const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
      if (mainContent instanceof HTMLElement) {
        mainContent.tabIndex = -1
        mainContent.focus()
        mainContent.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return { skipToContent }
  }

  /**
   * Keyboard navigation helpers
   */
  const handleArrowNavigation = (
    e: KeyboardEvent,
    items: Ref<any[]>,
    currentIndex: Ref<number>,
    onSelect?: (index: number) => void
  ) => {
    const key = e.key

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(key)) {
      return
    }

    e.preventDefault()

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        currentIndex.value = (currentIndex.value + 1) % items.value.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        currentIndex.value = currentIndex.value <= 0
          ? items.value.length - 1
          : currentIndex.value - 1
        break
      case 'Enter':
        if (onSelect && currentIndex.value >= 0) {
          onSelect(currentIndex.value)
        }
        break
      case 'Escape':
        currentIndex.value = -1
        break
    }
  }

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = () => {
    if (!process.client) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Manage ARIA expanded state
   */
  const useExpandable = (initialState = false) => {
    const isExpanded = ref(initialState)
    const ariaExpanded = computed(() => isExpanded.value.toString())

    const toggle = () => {
      isExpanded.value = !isExpanded.value
    }

    const expand = () => {
      isExpanded.value = true
    }

    const collapse = () => {
      isExpanded.value = false
    }

    return {
      isExpanded,
      ariaExpanded,
      toggle,
      expand,
      collapse,
    }
  }

  /**
   * Create accessible button props
   */
  const createButtonProps = (label: string, options: {
    pressed?: boolean
    expanded?: boolean
    controls?: string
    describedBy?: string
  } = {}) => {
    return {
      'aria-label': label,
      'aria-pressed': options.pressed?.toString(),
      'aria-expanded': options.expanded?.toString(),
      'aria-controls': options.controls,
      'aria-describedby': options.describedBy,
    }
  }

  return {
    createFocusTrap,
    announce,
    generateId,
    useSkipLinks,
    handleArrowNavigation,
    prefersReducedMotion,
    useExpandable,
    createButtonProps,
  }
}
