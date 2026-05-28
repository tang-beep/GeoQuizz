<script setup lang="ts">
import {
  nextTick,
  onMounted,
  ref,
  watch
} from 'vue'

const props = defineProps<{
  currentCountryCode: string
  correctCountries: string[]
  revealedCountries: string[]
  wrongCountry: string | null
}>()

const emit = defineEmits<{
  selectCountry: [code: string]
}>()

const svgContent = ref('')

const mapRef = ref<HTMLDivElement | null>(
  null
)

function applyCountryStyles() {
  nextTick(() => {
    if (!mapRef.value) {
      return
    }

    const paths =
      mapRef.value.querySelectorAll('path')

    paths.forEach(path => {
      path.classList.remove(
        'correct',
        'wrong',
        'revealed'
      )

      const code = path.id

      if (
        props.correctCountries.includes(
          code
        )
      ) {
        path.classList.add('correct')
      }

      if (
        props.revealedCountries.includes(
          code
        )
      ) {
        path.classList.add('revealed')
      }

      if (
        props.wrongCountry === code
      ) {
        path.classList.add('wrong')
      }
    })
  })
}

function handleMapClick(event: MouseEvent) {
  const target = event.target as HTMLElement

  const path = target.closest('path')

  if (!path) {
    return
  }

  const code = path.id

  if (!code) {
    return
  }

  emit('selectCountry', code)
}

onMounted(async () => {
  const response = await fetch(
    '/map/world.svg'
  )

  svgContent.value =
    await response.text()

  applyCountryStyles()
})

watch(
  () => [
    props.correctCountries,
    props.revealedCountries,
    props.wrongCountry
  ],
  () => {
    applyCountryStyles()
  },
  { deep: true }
)
</script>

<template>
  <div
    ref="mapRef"
    class="world-map h-full w-full"
    v-html="svgContent"
    @click="handleMapClick"
  />
</template>

<style>
.world-map svg {
  width: 100%;
  height: 100%;
}

.world-map path {
  fill: #3f3f46;
  stroke: #18181b;
  pointer-events: all;
  transition:
    fill 0.15s,
    opacity 0.15s;
}

.world-map path:hover {
  fill: #52525b;
  cursor: pointer;
}

.world-map path.correct {
  fill: #22c55e;
}

.world-map path.wrong {
  fill: #ef4444;
}

.world-map path.revealed {
  fill: #a1a1aa;
}

.world-map circle {
  pointer-events: none;
}
</style>