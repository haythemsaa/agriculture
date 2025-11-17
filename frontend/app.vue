<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s - AgriTech Tunisia',
  meta: [
    { name: 'description', content: 'Marketplace agricole directe avec IA' }
  ]
})
</script>
