<script setup lang="ts">
import type { Country } from '../types/country'
import type { GameElement } from '../types/game'

defineProps<{
  country: Country
  startElement: GameElement
}>()
</script>

<template>

  <FlagCard
    v-if="startElement === 'flag'"
    :country="country"
  />

  <div
    v-else-if="
      startElement === 'country'
    "
    class="mt-8 rounded-xl bg-zinc-800 p-8 text-center"
  >
    <p
      class="text-3xl font-bold"
    >
      {{ country.names[0] }}
    </p>
  </div>

  <div
    v-else-if="
      startElement === 'capital'
    "
    class="mt-8 rounded-xl bg-zinc-800 p-8 text-center"
  >
    <p
      class="text-3xl font-bold"
    >
      {{ country.capitals[0] }}
    </p>
  </div>

</template>