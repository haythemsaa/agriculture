<template>
  <div class="skip-navigation">
    <a
      href="#main-content"
      class="skip-link"
      @click.prevent="skipToMain"
    >
      Aller au contenu principal
    </a>
    <a
      href="#main-navigation"
      class="skip-link"
      @click.prevent="skipToNav"
    >
      Aller à la navigation
    </a>
  </div>

  <!-- Screen reader announcer -->
  <div
    id="a11y-announcer"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
  />
</template>

<script setup lang="ts">
import { useAccessibility } from '~/composables/useAccessibility'

const { useSkipLinks } = useAccessibility()
const { skipToContent } = useSkipLinks()

const skipToMain = () => {
  const mainContent = document.querySelector('#main-content') as HTMLElement
  if (mainContent) {
    mainContent.tabIndex = -1
    mainContent.focus()
    mainContent.scrollIntoView({ behavior: 'smooth' })
  }
}

const skipToNav = () => {
  const mainNav = document.querySelector('#main-navigation') as HTMLElement
  if (mainNav) {
    mainNav.tabIndex = -1
    mainNav.focus()
    mainNav.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.skip-navigation {
  position: relative;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #059669;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  font-weight: 500;
  z-index: 100;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
