<script setup lang="ts">
import type { Country } from '../../shared/types/country'

defineProps<{
  country: Country
}>()
</script>

<template>
  <img
    :key="`${country.code}-${country.flag}`"
    :src="`${country.flag}?v=${country.code}`"
    class="mt-6 h-48 rounded-xl shadow-2xl"
  >
</template>