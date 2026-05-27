<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { countries } from '../data/countries'
import type { Country } from '../types/country'

const score = ref(0)

const answer = ref('')
const result = ref('')

const usedCountries = ref<string[]>([])

const gameFinished = ref(false)

const inputRef = ref<HTMLInputElement | null>(null)

const gameStep = ref<'country' | 'capital' | 'next'>(
  'country'
)

function normalizeString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function getRemainingCountries(): Country[] {
  return countries.filter(
    country => !usedCountries.value.includes(country.code)
  )
}

function getRandomCountry(): Country {
  const remainingCountries = getRemainingCountries()

  if (remainingCountries.length === 0) {
    gameFinished.value = true

    return countries[0]!
  }

  return remainingCountries[
    Math.floor(Math.random() * remainingCountries.length)
  ]!
}

const currentCountry = ref<Country>(getRandomCountry())

const placeholder = computed(() => {
  if (gameStep.value === 'country') {
    return 'Nom du pays'
  }

  if (gameStep.value === 'capital') {
    return 'Capitale'
  }

  return ''
})

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function submitCountryAnswer() {
  const normalizedAnswer = normalizeString(
    answer.value
  )

  const normalizedCountry = normalizeString(
    currentCountry.value.name
  )

  if (normalizedAnswer === normalizedCountry) {
    result.value = '✅ Bon pays !'
    score.value++
  } else {
    result.value =
      `❌ Mauvaise réponse — c'était ${currentCountry.value.name}`
  }

  answer.value = ''

  gameStep.value = 'capital'

  focusInput()
}

function submitCapitalAnswer() {
  const normalizedAnswer = normalizeString(
    answer.value
  )

  const normalizedCapital = normalizeString(
    currentCountry.value.capital
  )

  if (normalizedAnswer === normalizedCapital) {
    result.value += '\n✅ Bonne capitale !'
    score.value++
  } else {
    result.value +=
      `\n❌ Mauvaise capitale — c'était ${currentCountry.value.capital}`
  }

  usedCountries.value.push(currentCountry.value.code)

  answer.value = ''

  gameStep.value = 'next'

  focusInput()
}

function nextQuestion() {
  currentCountry.value = getRandomCountry()

  result.value = ''

  answer.value = ''

  gameStep.value = 'country'

  focusInput()
}

function restartGame() {
  score.value = 0

  usedCountries.value = []

  gameFinished.value = false

  answer.value = ''

  result.value = ''

  gameStep.value = 'country'

  currentCountry.value = getRandomCountry()

  focusInput()
}

function handleEnter() {
  if (gameFinished.value) {
    return
  }

  if (gameStep.value === 'country') {
    submitCountryAnswer()
    return
  }

  if (gameStep.value === 'capital') {
    submitCapitalAnswer()
    return
  }

  nextQuestion()
}
</script>

<template>
  <main class="min-h-screen bg-zinc-900 text-white">
    <div class="mx-auto flex max-w-3xl flex-col items-center p-8">

      <h1 class="text-5xl font-bold">
        GeoQuiz
      </h1>

      <p class="mt-4 text-zinc-400">
        Score : {{ score }}
      </p>

      <p class="mt-2 text-zinc-500">
        Pays joués :
        {{ usedCountries.length }} / {{ countries.length }}
      </p>

      <button
        class="mt-6 rounded-xl bg-zinc-700 px-6 py-3 hover:bg-zinc-600"
        @click="restartGame"
      >
        Recommencer une partie
      </button>

      <template v-if="!gameFinished">

        <img
          :key="currentCountry.code"
          :src="currentCountry.flag"
          :alt="currentCountry.name"
          class="mt-12 h-48 rounded-xl shadow-2xl"
        >

        <input
          ref="inputRef"
          v-model="answer"
          type="text"
          :placeholder="placeholder"
          class="mt-10 w-full max-w-md rounded-xl bg-zinc-800 p-4 text-center text-xl text-white outline-none"
          @keyup.enter="handleEnter"
        >

        <p
          class="mt-8 whitespace-pre-line text-center text-xl"
        >
          {{ result }}
        </p>

        <p
          v-if="gameStep === 'next'"
          class="mt-6 text-zinc-400"
        >
          Appuyez sur Entrée pour continuer
        </p>

      </template>

      <template v-else>

        <h2 class="mt-12 text-4xl font-bold">
          Partie terminée 🎉
        </h2>

        <p class="mt-6 text-2xl">
          Score final :
          {{ score }} / {{ countries.length * 2 }}
        </p>

        <button
          class="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          @click="restartGame"
        >
          Rejouer
        </button>

      </template>

    </div>
  </main>
</template>