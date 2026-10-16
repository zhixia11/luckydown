<script setup lang="ts">
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomeView from './HomeView.vue'
const route = useRoute()
const isHome = route.path === '/' || route.path === '/index.html'
</script>

<template>
  <HomeView v-if="isHome" />
  <DefaultTheme.Layout v-else />
</template>