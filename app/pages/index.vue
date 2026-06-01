<script setup lang="ts">
import type {
  GameElement
} from '../types/game'

const numberOfCountries =
  ref(20)

const continent =
  ref('')

const startElement =
  ref<GameElement>('flag')

const targetElements =
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
      const firstAvailable =
        availableElements.find(
          element =>
            element.value !== newValue
        )

      if (firstAvailable) {
        targetElements.value = [
          firstAvailable.value as GameElement
        ]
      }
    }
  },
  {
    immediate: true
  }
)

function toggleTarget(
  value: GameElement
) {
  const index =
    targetElements.value.indexOf(
      value
    )

  if (index >= 0) {
    if (
      targetElements.value.length ===
      1
    ) {
      return
    }

    targetElements.value.splice(
      index,
      1
    )

    return
  }

  targetElements.value.push(value)
}

function startGame() {
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
          Nombre de pays
        </label>

        <input
          v-model.number="
            numberOfCountries
          "
          type="number"
          min="1"
          max="250"
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
      </div>

      <div class="mt-6">

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

          <option value="Europe">
            Europe
          </option>

          <option value="Asie">
            Asie
          </option>

          <option
            value="Amérique du Nord"
          >
            Amérique du Nord
          </option>

          <option
            value="Amérique du Sud"
          >
            Amérique du Sud
          </option>

          <option value="Afrique">
            Afrique
          </option>

          <option value="Océanie">
            Océanie
          </option>
        </select>

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
              :checked="
                targetElements.includes(
                  element.value as GameElement
                )
              "
              :disabled="element.disabled"
              type="checkbox"
              @change="
                toggleTarget(
                  element.value as GameElement
                )
              "
            >

            {{ element.label }}
          </label>
        </div>

      </div>

      <button
        class="mt-10 w-full rounded-xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500"
        @click="startGame"
      >
        Commencer
      </button>

    </div>
  </main>
</template>