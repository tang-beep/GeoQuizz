<script setup lang="ts">
import type { Country }
from '../types/country'

defineProps<{
  countries: Country[]
}>()

const emit =
  defineEmits<{
    select: [code: string]
  }>()
</script>

<template>

  <div
    class="mt-6 grid grid-cols-2 gap-3"
  >

    <button
      v-for="country in countries"
      :key="country.code"
      class="rounded-xl bg-zinc-800 p-3 transition hover:bg-zinc-700"
      @click="
        emit(
          'select',
          country.code
        )
      "
    >
      <img
        :src="`https://flagcdn.com/${country.code.toLowerCase()}.svg`"
        :alt="country.name"
        class="h-20 w-full object-contain"
      >
    </button>

  </div>

</template>