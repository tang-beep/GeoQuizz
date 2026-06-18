<script setup lang="ts">
import type { GameElement } from '../../shared/types/game'

import {
  nextTick,
  onMounted,
  ref,
  watch
} from 'vue'

import { useMapCamera } from '../composables/useMapCamera'
import type { MapConfig } from '~/maps/mapConfig';
import { countries } from '../../shared/countries';
import { continentViews, type Continent } from '~/maps/worldViews';

const props = defineProps<{
  currentCountryCode: string
  correctCountries: string[]
  revealedCountry: string | null
  revealedCountries: string[]
  usedCountries: string[]
  wrongCountry: string | null
  startElement?: GameElement
  highlightCountry?: string

  mapConfig: MapConfig
  continent?: Continent | null
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

const countryContinentMap =
  new Map<string, Continent>(
    countries.map(country => [
      country.code,
      country.continent
    ])
  )

function updateViewport() {
  if (!containerRef.value) {
    return
  }

  viewportWidth.value = containerRef.value.clientWidth
  viewportHeight.value = containerRef.value.clientHeight
}

function applyCountryStyles() {
  nextTick(() => {if (!mapRef.value) {return}

    const elements =
      mapRef.value.querySelectorAll(
        'path[id], circle[id]:not(.hint-marker), ellipse[id]:not(.hint-marker)'
      )

    mapRef.value
      .querySelectorAll('.hint-marker')
      .forEach(marker =>
        marker.classList.remove('active')
      )

    elements.forEach(element => {
      element.classList.remove(
        'correct',
        'wrong',
        'revealed',
        'highlighted',
        'disabled'
      )

      const code = element.id

      const isInSelectedContinent =
        !props.continent ||
        countryContinentMap.get(code) === props.continent

      const marker = document.getElementById(`${code}-marker`)

      if (!isInSelectedContinent) {
        element.classList.add('disabled')
        return
      }

      if (props.wrongCountry === code) {
        element.classList.add('wrong')
        return
      }

      if (props.revealedCountry === code) {
        element.classList.add('highlighted')
        marker?.classList.add('active')
        return
      }

      if (props.correctCountries.includes(code)) {
        element.classList.add('correct')
        return
      }

      if (props.revealedCountries.includes(code) ||
        (props.usedCountries.includes(code) &&
          !props.correctCountries.includes(code))) {
        element.classList.add('revealed')
        return
      }

      if (props.startElement === 'map' &&
        props.highlightCountry === code) {
        element.classList.add('highlighted')
        marker?.classList.add('active')
      }
    })
  })
}

function handleMapClick(event: MouseEvent) {
  if (hasDragged.value) {
    return
  }

  const target = event.target as SVGPathElement

  if (!target || !['path', 'circle', 'ellipse'].includes(target.tagName)) {
    return
  }

  const code = target.id

  if (!code) {
    return
  }

  if (props.continent && countryContinentMap.get(code) !== props.continent) {
    return
  }

  emit('selectCountry', code)
}

function handleWheel(event: WheelEvent) {
  event.preventDefault()

  if (event.deltaY < 0) {
    camera.zoomIn(1.2)
  } 
  else {
    camera.zoomOut(1.2)
  }
}

function handleMouseOver(event: MouseEvent) {
  const target = event.target as SVGPathElement

  if (!target || !['path', 'circle', 'ellipse'].includes(target.tagName)) {
    return
  }

  const code = target.id

  mapRef.value?.querySelectorAll(`[id="${code}"]`)
    .forEach(path => path.classList.add('hovered'))
}

function handleMouseOut(event: MouseEvent) {
  const target = event.target as SVGPathElement

  if (!target || !['path', 'circle', 'ellipse'].includes(target.tagName)) {
    return
  }

  const code = target.id

  mapRef.value?.querySelectorAll(`[id="${code}"]`)
    .forEach(path => path.classList.remove('hovered'))
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

  if (props.continent) {
    camera.applyView(
      continentViews[props.continent]
    )
  }

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
  () => props.continent,
  continent => {
    if (!continent) {
      camera.applyView(
        props.mapConfig.defaultView
      )
      return
    }

    camera.applyView(
      continentViews[continent]
    )
  },
  {
    immediate: true
  }
)

watch(
  () => [
    props.correctCountries,
    props.revealedCountry,
    props.revealedCountries,
    props.usedCountries,
    props.wrongCountry,
    props.highlightCountry,
    props.startElement, 
    props.continent
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
        transform: camera.getTransform(
          viewportWidth,
          viewportHeight
        )
      }"
      v-html="svgContent"
      @click="handleMapClick"
      @mouseover="handleMouseOver"
      @mouseout="handleMouseOut"
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

.world-map path,
.world-map circle {
  fill: #505058;

  stroke: #18181b;

  transition:
    fill 0.15s,
    opacity 0.15s;
}

.world-map ellipse {
  fill: transparent;

  stroke: #505058;
  stroke-width: 1.5;

  transition:
    fill 0.15s,
    stroke 0.15s;
}

.world-map path.hovered,
.world-map circle.hovered {
  fill: #6c6c75;
}

.world-map ellipse.hovered {
  fill: #505057;
  stroke: #6c6c75;
}

.world-map path:hover,
.world-map circle:hover,
.world-map ellipse:hover {
  cursor: pointer;
}

.world-map path.correct,
.world-map circle.correct {
  fill: #22c55e;
}

.world-map path.wrong,
.world-map circle.wrong {
  fill: #ef4444;
}

.world-map path.revealed,
.world-map circle.revealed {
  fill: #c2c2ca;
}

.world-map path.highlighted,
.world-map circle.highlighted {
  fill: #eab308;
}

.world-map path.disabled,
.world-map circle.disabled {
  fill: #424242;
  opacity: 0.35;
  pointer-events: none;
}

.world-map ellipse.correct {
  fill: #22c55e55;
  stroke: #22c55e;
}

.world-map ellipse.wrong {
  fill: #ef444455;
  stroke: #ef4444;
}

.world-map ellipse.revealed {
  fill: #c2c2ca55;
  stroke: #c2c2ca;
}

.world-map ellipse.highlighted {
  fill: #eab30855;
  stroke: #eab308;
}

.world-map ellipse.disabled {
  fill: #292929;
  stroke: #424242;
  opacity: 0.35;
  pointer-events: none;
}

.world-map circle.hint-marker,
.world-map ellipse.hint-marker {
  opacity: 0;
  pointer-events: none;

  fill: transparent;
  stroke: #ef4444;
  stroke-width: 1;

  transition: opacity 0.2s;
}

.world-map circle.hint-marker.active,
.world-map ellipse.hint-marker.active {
  opacity: 1;
}
</style>