<script setup lang="ts">
import type { Country }
from '../../shared/types/country'

defineProps<{
  countries: Country[]
  disabled?: boolean
  success?: boolean
  error?: boolean
}>()

const emit =
  defineEmits<{
    select: [code: string]
  }>()
</script>

<template>

  <div
    :class="
      countries.length === 1
        ? 'mt-6 flex justify-center'
        : 'mt-6 grid grid-cols-2 gap-3'
    "
  >

    <button
      v-for="country in countries"
      :key="country.code"
      :disabled="disabled"
      :class="[
        countries.length === 1
          ? 'w-64 p-4'
          : 'p-3',

        success
          ? 'bg-green-600'
          : error
            ? 'bg-red-600'
            : 'bg-zinc-800 hover:bg-zinc-700'
      ]"
      class="rounded-xl transition disabled:cursor-default"
      @click="
        emit(
          'select',
          country.code
        )
      "
    >
      <img
        :src="`https://flagcdn.com/${country.code.toLowerCase()}.svg`"
        :class="
          countries.length === 1
            ? 'h-32 w-full object-contain'
            : 'h-20 w-full object-contain'
        "
      >
    </button>

  </div>

</template>