<script setup lang="ts">
import type { GameElement } from '../types/game'

import {
  nextTick,
  onMounted,
  ref,
  watch
} from 'vue'

import { useMapCamera } from '../composables/useMapCamera'
import type { MapConfig } from '~/maps/mapConfig';

const props = defineProps<{
  currentCountryCode: string
  correctCountries: string[]
  revealedCountries: string[]
  usedCountries: string[]
  wrongCountry: string | null
  startElement?: GameElement
  highlightCountry?: string

  mapConfig: MapConfig
}>()

const emit = defineEmits<{selectCountry: [code: string]}>()

const svgContent = ref('')

const mapRef = ref<HTMLDivElement | null>(null)

const containerRef = ref<HTMLDivElement | null>(null)

const camera = useMapCamera(props.mapConfig)

const viewportWidth = ref(0)
const viewportHeight = ref(0)

const isDragging = ref(false)
const hasDragged = ref(false)

function updateViewport() {
  if (!containerRef.value) {
    return
  }

  viewportWidth.value =
    containerRef.value.clientWidth

  viewportHeight.value =
    containerRef.value.clientHeight
}

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
        ) &&
        !props.correctCountries.includes(
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

function handleWheel(
  event: WheelEvent
) {
  event.preventDefault()

  if (event.deltaY < 0) {
    camera.zoomIn(1.2)
  } else {
    camera.zoomOut(1.2)
  }
}

function startDrag() {
  isDragging.value = true
  hasDragged.value = false
}

function onDrag(
  event: MouseEvent
) {
  if (!isDragging.value) {
    return
  }

  if (
    Math.abs(event.movementX) > 2 ||
    Math.abs(event.movementY) > 2
  ) {
    hasDragged.value = true
  }

  camera.moveBy(
    event.movementX,
    event.movementY
  )
}

function stopDrag() {
  isDragging.value = false
}

onMounted(async () => {
  const response = await fetch(
    props.mapConfig.svgPath
  )

  svgContent.value =
    await response.text()

  await nextTick()

  updateViewport()

  applyCountryStyles()

  window.addEventListener(
    'mousemove',
    onDrag
  )

  window.addEventListener(
    'mouseup',
    stopDrag
  )

  window.addEventListener(
    'resize',
    updateViewport
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
        @click="camera.zoomIn(1.8)"
      >
        +
      </button>

      <button
        class="rounded-lg bg-zinc-800 px-4 py-2 text-white transition hover:bg-zinc-700"
        @click="camera.zoomOut(2)"
      >
        −
      </button>

    </div>

    <div
      ref="mapRef"
      class="world-map"
      :style="{
        transform:
          camera.getTransform(
            viewportWidth,
            viewportHeight
          )
      }"
      v-html="svgContent"
      @click="handleMapClick"
    />
  </div>
</template>

<style>
.world-map {
  overflow: visible;

  transition:
    transform 0.05s linear;

  transform-origin:
    top left;

  backface-visibility:
    hidden;
}

.world-map svg {
  width: 100%;
  height: auto;

  shape-rendering:
    geometricPrecision;

  vector-effect:
    non-scaling-stroke;
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