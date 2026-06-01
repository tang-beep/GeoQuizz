<script setup lang="ts">
import type { GameElement } from '../types/game'

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
  usedCountries: string[]
  wrongCountry: string | null
  startElement?: GameElement
  highlightCountry?: string
}>()

const emit = defineEmits<{
  selectCountry: [code: string]
}>()

const svgContent = ref('')

const mapRef =
  ref<HTMLDivElement | null>(null)

const containerRef =
  ref<HTMLDivElement | null>(
    null
  )

const scale = ref(1)

const translateX = ref(0)
const translateY = ref(0)

const isDragging = ref(false)

const startX = ref(0)
const startY = ref(0)

const hasDragged = ref(false)

function applyCountryStyles() {
  nextTick(() => {
    if (!mapRef.value) {
      return
    }

    const paths =
      mapRef.value.querySelectorAll(
        'path'
      )

    paths.forEach(path => {
      path.classList.remove(
        'correct',
        'wrong',
        'revealed',
        'highlighted'
      )

      const code = path.id

      if (
        props.startElement ===
          'map' &&
        props.highlightCountry ===
          code
      ) {
        path.classList.add(
          'highlighted'
        )
      }

      if (
        props.correctCountries.includes(
          code
        )
      ) {
        path.classList.add(
          'correct'
        )
      }

      if (
        props.revealedCountries.includes(
          code
        )
      ) {
        path.classList.add(
          'revealed'
        )
      }

      if (
        props.wrongCountry === code
      ) {
        path.classList.add(
          'wrong'
        )
      }

      if (
        props.usedCountries.includes(
          code
        )
      ) {
        path.classList.add(
          'revealed'
        )
      }
    })
  })
}

function handleMapClick(
  event: MouseEvent
) {
  if (hasDragged.value) {
    return
  }

  const target =
    event.target as SVGPathElement

  if (
    !target ||
    target.tagName !== 'path'
  ) {
    return
  }

  const code = target.id

  if (!code) {
    return
  }

  emit('selectCountry', code)
}

function zoomIn() {
  scale.value = Math.min(
    scale.value + 0.5,
    20
  )
}

function zoomOut() {
  scale.value = Math.max(
    scale.value - 0.8,
    1
  )
}

function handleWheel(
  event: WheelEvent
) {
  event.preventDefault()

  const container =
    containerRef.value

  if (!container) {
    return
  }

  const rect =
    container.getBoundingClientRect()

  const mouseX =
    event.clientX - rect.left

  const mouseY =
    event.clientY - rect.top

  const zoomIntensity = 0.1

  const direction =
    event.deltaY > 0 ? -1 : 1

  const newScale = Math.min(
    Math.max(
      scale.value +
        direction *
          zoomIntensity,
      1
    ),
    20
  )

  const scaleRatio =
    newScale / scale.value

  translateX.value =
    mouseX -
    (mouseX -
      translateX.value) *
      scaleRatio

  translateY.value =
    mouseY -
    (mouseY -
      translateY.value) *
      scaleRatio

  scale.value = newScale
}

function startDrag(
  event: MouseEvent
) {
  isDragging.value = true

  hasDragged.value = false

  startX.value =
    event.clientX - translateX.value

  startY.value =
    event.clientY - translateY.value
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) {
    return
  }

  const nextX =
    event.clientX - startX.value

  const nextY =
    event.clientY - startY.value

  if (
    Math.abs(
      nextX - translateX.value
    ) > 4 ||
    Math.abs(
      nextY - translateY.value
    ) > 4
  ) {
    hasDragged.value = true
  }

  translateX.value = nextX
  translateY.value = nextY
}

function stopDrag() {
  isDragging.value = false
}

onMounted(async () => {
  const response = await fetch(
    '/map/world.svg'
  )

  svgContent.value =
    await response.text()

  applyCountryStyles()

  window.addEventListener(
    'mousemove',
    onDrag
  )

  window.addEventListener(
    'mouseup',
    stopDrag
  )
})

watch(
  () => [
    props.correctCountries,
    props.revealedCountries,
    props.usedCountries,
    props.wrongCountry,
    props.highlightCountry,
    props.startElement
  ],
  () => {
    applyCountryStyles()
  },
  { deep: true }
)
</script>

<template>
  <div
    ref="containerRef"
    class="relative h-full w-full overflow-hidden bg-zinc-900"
    @wheel="handleWheel"
    @mousedown="startDrag"
  >

    <div
      class="absolute right-4 top-4 z-50 flex flex-col gap-2"
    >

      <button
        class="rounded-lg bg-zinc-800 px-4 py-2 text-white transition hover:bg-zinc-700"
        @click="zoomIn"
      >
        +
      </button>

      <button
        class="rounded-lg bg-zinc-800 px-4 py-2 text-white transition hover:bg-zinc-700"
        @click="zoomOut"
      >
        −
      </button>

    </div>

    <div
      class="flex h-full w-full items-center justify-center"
    >

      <div
        ref="mapRef"
        class="world-map"
        :style="{
          transform: `
            translate3d(${translateX}px, ${translateY}px, 0)
            scale(${scale})
          `
        }"
        v-html="svgContent"
        @click="handleMapClick"
      />

    </div>

  </div>
</template>

<style>
.world-map {
  overflow: visible;

  transition:
    transform 0.02s linear;

  transform-origin: center;

  backface-visibility: hidden;
}

.world-map svg {
  width: 100%;
  height: auto;

  shape-rendering: geometricPrecision;

  vector-effect: non-scaling-stroke;
}

.world-map path {
  fill: #3f3f46;

  stroke: #18181b;

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

.world-map path.highlighted {
  fill: #eab308;
}
</style>