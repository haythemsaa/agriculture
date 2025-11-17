<template>
  <div class="card animate-pulse">
    <!-- Image skeleton -->
    <div class="h-48 bg-gray-300 rounded-t-lg mb-4"></div>

    <!-- Content skeleton -->
    <div class="space-y-3">
      <!-- Title -->
      <div class="h-4 bg-gray-300 rounded w-3/4"></div>

      <!-- Info lines -->
      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      <div class="h-3 bg-gray-200 rounded w-2/3"></div>

      <!-- Price -->
      <div class="flex items-center justify-between pt-2">
        <div class="h-6 bg-gray-300 rounded w-24"></div>
        <div class="h-8 w-8 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for basic skeleton
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
