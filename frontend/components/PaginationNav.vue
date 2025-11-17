<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2" aria-label="Pagination">
    <!-- Previous Button -->
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      :class="[
        'px-3 py-2 rounded-lg transition',
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-primary-50 text-gray-700'
      ]"
    >
      ← Précédent
    </button>

    <!-- Page Numbers -->
    <div class="flex gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="page !== '...' && goToPage(Number(page))"
        :class="[
          'min-w-[2.5rem] h-10 rounded-lg transition',
          page === currentPage
            ? 'bg-primary-600 text-white font-semibold'
            : page === '...'
            ? 'bg-transparent text-gray-500 cursor-default'
            : 'bg-white hover:bg-primary-50 text-gray-700'
        ]"
        :disabled="page === '...'"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next Button -->
    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      :class="[
        'px-3 py-2 rounded-lg transition',
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-primary-50 text-gray-700'
      ]"
    >
      Suivant →
    </button>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 7,
})

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisible } = props

  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const leftSiblingIndex = Math.max(currentPage - 1, 2)
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages - 1)

    const showLeftDots = leftSiblingIndex > 2
    const showRightDots = rightSiblingIndex < totalPages - 1

    if (!showLeftDots && showRightDots) {
      // Show pages from start
      for (let i = 2; i < maxVisible - 1; i++) {
        pages.push(i)
      }
      pages.push('...')
    } else if (showLeftDots && !showRightDots) {
      // Show pages at end
      pages.push('...')
      for (let i = totalPages - (maxVisible - 3); i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages in middle
      pages.push('...')
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i)
      }
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages)
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('change', page)
  }
}
</script>
