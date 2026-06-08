<script setup lang="ts">
import type { Continent } from '~/maps/worldViews'
import type { GameElement } from '../types/game'

const continent =
  ref<Continent | ''>('')

const countryOptions = computed(() => {
  switch (continent.value) {
    case 'europe':
      return [10, 20, 44]

    case 'asia':
      return [10, 20, 49]

    case 'northAmerica':
      return [10, 22]

    case 'southAmerica':
      return [13]

    case 'africa':
      return [10, 20, 55]

    case 'oceania':
      return [10, 17]

    default:
      return [10, 20, 50, 100, 200]
  }
})

const numberOfCountries =
  ref(countryOptions.value[1] ?? countryOptions.value[0])

watch(
  continent,
  () => {
    numberOfCountries.value =
      countryOptions.value[1] ??
      countryOptions.value[0]
  }
)

const startElement =
  ref<GameElement>('flag')

const targetElements =
  ref<GameElement[]>([
    'country',
    'capital',
    'map'
  ])

const previousTargets =
  ref<GameElement[]>([
    'country',
    'capital',
    'map'
  ])

const availableElements = [
  {
    value: 'flag',
    label: 'Drapeau'
  },
  {
    value: 'country',
    label: 'Nom du pays'
  },
  {
    value: 'capital',
    label: 'Capitale'
  },
  {
    value: 'map',
    label: 'Emplacement'
  }
]

const selectableTargets =
  computed(() =>
    availableElements.map(
      element => ({
        ...element,
        disabled:
          element.value ===
          startElement.value
      })
    )
  )

watch(
  startElement,
  newValue => {
    targetElements.value =
      targetElements.value.filter(
        target =>
          target !== newValue
      )

    if (
      targetElements.value.length ===
      0
    ) {
      const fallback =
        availableElements.find(
          element =>
            element.value !==
            newValue
        )

      if (fallback) {
        targetElements.value = [
          fallback.value as GameElement
        ]
      }
    }

    previousTargets.value = [
      ...targetElements.value
    ]
  },
  {
    immediate: true
  }
)

watch(
  targetElements,
  newTargets => {
    if (
      newTargets.length === 0
    ) {
      targetElements.value = [
        ...previousTargets.value
      ]
      return
    }

    previousTargets.value = [
      ...newTargets
    ]
  },
  {
    deep: true
  }
)

function getCountryCountLabel(
  value: number
) {
  const max =
    countryOptions.value[
      countryOptions.value.length - 1
    ]

  return value === max
    ? 'Tous'
    : value.toString()
}

function startGame() {
  if (
    targetElements.value.length === 0
  ) {
    return
  }

  navigateTo({
    path: '/game',
    query: {
      countries:
        numberOfCountries.value,
      continent:
        continent.value || '',
      start:
        startElement.value,
      targets:
        targetElements.value.join(',')
    }
  })
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-zinc-900 p-6 text-white"
  >
    <div
      class="w-full max-w-xl rounded-2xl bg-zinc-950 p-8"
    >
      <h1
        class="text-center text-5xl font-black"
      >
        GeoQuiz
      </h1>

      <div class="mt-10">
        <label
          class="mb-2 block text-sm text-zinc-400"
        >
          Continent
        </label>

        <select
          v-model="continent"
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
          <option value="">
            Monde entier
          </option>

          <option value="europe">
            Europe
          </option>

          <option value="asia">
            Asie
          </option>

          <option value="northAmerica">
            Amérique du Nord
          </option>

          <option value="southAmerica">
            Amérique du Sud
          </option>

          <option value="africa">
            Afrique
          </option>

          <option value="oceania">
            Océanie
          </option>
        </select>
      </div>

      <div class="mt-6">
        <label
          class="mb-3 block text-sm text-zinc-400"
        >
          Nombre de pays
        </label>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="count in countryOptions"
            :key="count"
            class="rounded-xl px-4 py-3 font-semibold transition"
            :class="
              numberOfCountries === count
                ? 'bg-blue-600'
                : 'bg-zinc-800 hover:bg-zinc-700'
            "
            @click="
              numberOfCountries = count
            "
          >
            {{
              getCountryCountLabel(
                count
              )
            }}
          </button>
        </div>
      </div>

      <div class="mt-8">
        <h2
          class="mb-3 text-lg font-bold"
        >
          Élément affiché au départ
        </h2>

        <div
          class="flex flex-col gap-2"
        >
          <label
            v-for="element in availableElements"
            :key="element.value"
            class="flex cursor-pointer items-center gap-3 rounded-xl bg-zinc-800 p-3"
          >
            <input
              v-model="startElement"
              :value="element.value"
              type="radio"
            >

            {{ element.label }}
          </label>
        </div>
      </div>

      <div class="mt-8">
        <h2
          class="mb-3 text-lg font-bold"
        >
          Éléments à trouver
        </h2>

        <div
          class="flex flex-col gap-2"
        >
          <label
            v-for="element in selectableTargets"
            :key="element.value"
            :class="[
              'flex items-center gap-3 rounded-xl p-3',
              element.disabled
                ? 'cursor-not-allowed bg-zinc-900 text-zinc-600'
                : 'cursor-pointer bg-zinc-800'
            ]"
          >
            <input
              v-model="targetElements"
              :value="element.value"
              :disabled="element.disabled"
              type="checkbox"
            >

            {{ element.label }}
          </label>
        </div>
      </div>

      <button
        :disabled="
          targetElements.length === 0
        "
        class="mt-10 w-full rounded-xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
        @click="startGame"
      >
        Commencer
      </button>
    </div>
  </main>
</template>