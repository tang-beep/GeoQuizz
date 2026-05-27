<script setup lang="ts">
import type { Country } from '../types/country'

defineProps<{
  country: Country
}>()
</script>

<template>
  <img
    :key="country.code"
    :src="country.flag"
    :alt="country.name"
    class="mt-12 h-48 rounded-xl shadow-2xl"
  >
</template>