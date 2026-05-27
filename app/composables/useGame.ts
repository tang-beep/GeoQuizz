import { computed, nextTick, ref } from 'vue'

import { countries } from '../data/countries'

import type { Country } from '../types/country'

export function useGame() {
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
      country =>
        !usedCountries.value.includes(country.code)
    )
  }

  function pickRandomCountry(): Country {
    const remainingCountries =
      getRemainingCountries()

    return remainingCountries[
      Math.floor(
        Math.random() * remainingCountries.length
      )
    ]!
  }

  const currentCountry = ref<Country>(
    pickRandomCountry()
  )

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

    if (
      normalizedAnswer === normalizedCountry
    ) {
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

    if (
      normalizedAnswer === normalizedCapital
    ) {
      result.value +=
        '\n✅ Bonne capitale !'

      score.value++
    } else {
      result.value +=
        `\n❌ Mauvaise capitale — c'était ${currentCountry.value.capital}`
    }

    usedCountries.value.push(
      currentCountry.value.code
    )

    answer.value = ''

    gameStep.value = 'next'

    focusInput()
  }

  function nextQuestion() {
    const remainingCountries =
      getRemainingCountries()

    if (remainingCountries.length === 0) {
      gameFinished.value = true

      return
    }

    currentCountry.value =
      pickRandomCountry()

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

    currentCountry.value =
      pickRandomCountry()

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

  return {
    score,
    answer,
    result,
    usedCountries,
    gameFinished,
    inputRef,
    gameStep,
    currentCountry,
    placeholder,
    handleEnter,
    restartGame,
    countries
  }
}