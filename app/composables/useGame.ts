import {
  computed,
  nextTick,
  reactive,
  ref
} from 'vue'

import { countries } from '../data/countries'

import type { Country } from '../types/country'

export function useGame() {
  const score = ref(0)

  const answer = ref('')

  const result = ref('')

  const usedCountries = ref<string[]>([])

  const correctCountries = ref<string[]>([])

  const revealedCountries = ref<string[]>([])

  const wrongCountry = ref<string | null>(
    null
  )

  const gameFinished = ref(false)

  const inputRef =
    ref<HTMLInputElement | null>(null)

  const tasks = reactive({
    country: false,
    capital: false,
    map: false
  })

  function resetTasks() {
    tasks.country = false
    tasks.capital = false
    tasks.map = false
  }

  function normalizeString(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
  }

  function getRemainingCountries() {
    return countries.filter(
      country =>
        !usedCountries.value.includes(
          country.code
        )
    )
  }

  function pickRandomCountry(): Country {
    const remainingCountries =
      getRemainingCountries()

    return remainingCountries[
      Math.floor(
        Math.random() *
          remainingCountries.length
      )
    ]!
  }

  const currentCountry = ref<Country>(
    pickRandomCountry()
  )

  const roundFinished = computed(() => {
    return (
      tasks.country &&
      tasks.capital &&
      tasks.map
    )
  })

  const placeholder = computed(() => {
    if (!tasks.country) {
      return 'Nom du pays'
    }

    if (!tasks.capital) {
      return 'Capitale'
    }

    return 'Appuyez sur Entrée'
  })

  function focusInput() {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  function validateCountry() {
    if (tasks.country) {
      return
    }

    const normalizedAnswer =
      normalizeString(answer.value)

    const normalizedCountry =
      normalizeString(
        currentCountry.value.name
      )

    if (
      normalizedAnswer ===
      normalizedCountry
    ) {
      result.value +=
        '\n✅ Bon pays !'

      score.value++
    } else {
      result.value +=
        `\n❌ Mauvais pays — c'était ${currentCountry.value.name}`
    }

    tasks.country = true

    answer.value = ''

    checkRoundCompletion()
  }

  function validateCapital() {
    if (tasks.capital) {
      return
    }

    const normalizedAnswer =
      normalizeString(answer.value)

    const normalizedCapital =
      normalizeString(
        currentCountry.value.capital
      )

    if (
      normalizedAnswer ===
      normalizedCapital
    ) {
      result.value +=
        '\n✅ Bonne capitale !'

      score.value++
    } else {
      result.value +=
        `\n❌ Mauvaise capitale — c'était ${currentCountry.value.capital}`
    }

    tasks.capital = true

    answer.value = ''

    checkRoundCompletion()
  }

  function selectCountry(code: string) {
    if (
      gameFinished.value ||
      tasks.map
    ) {
      return
    }

    if (
      code === currentCountry.value.code
    ) {
      result.value +=
        '\n✅ Bon emplacement !'

      score.value++

      if (
        !correctCountries.value.includes(
          code
        )
      ) {
        correctCountries.value.push(code)
      }

      wrongCountry.value = null
    } else {
      result.value +=
        '\n❌ Mauvais emplacement'

      wrongCountry.value = code

      if (
        !revealedCountries.value.includes(
          currentCountry.value.code
        )
      ) {
        revealedCountries.value.push(
          currentCountry.value.code
        )
      }
    }

    tasks.map = true

    checkRoundCompletion()
  }

  function checkRoundCompletion() {
    if (!roundFinished.value) {
      return
    }

    if (
      !usedCountries.value.includes(
        currentCountry.value.code
      )
    ) {
      usedCountries.value.push(
        currentCountry.value.code
      )
    }
  }

  function nextQuestion() {
    const remainingCountries =
      getRemainingCountries()

    wrongCountry.value = null

    if (remainingCountries.length === 0) {
      gameFinished.value = true

      return
    }

    currentCountry.value =
      remainingCountries[
        Math.floor(
          Math.random() *
            remainingCountries.length
        )
      ]!

    result.value = ''

    answer.value = ''

    resetTasks()

    focusInput()
  }

  function restartGame() {
    score.value = 0

    usedCountries.value = []

    correctCountries.value = []

    revealedCountries.value = []

    wrongCountry.value = null

    gameFinished.value = false

    result.value = ''

    answer.value = ''

    resetTasks()

    currentCountry.value =
      pickRandomCountry()

    focusInput()
  }

  function handleEnter() {
    if (gameFinished.value) {
      return
    }

    if (roundFinished.value) {
      nextQuestion()

      return
    }

    if (!tasks.country) {
      validateCountry()

      return
    }

    if (!tasks.capital) {
      validateCapital()

      return
    }
  }

  return {
    score,
    answer,
    result,
    usedCountries,
    correctCountries,
    revealedCountries,
    wrongCountry,
    gameFinished,
    inputRef,
    currentCountry,
    placeholder,
    roundFinished,
    tasks,
    handleEnter,
    restartGame,
    selectCountry,
    countries,
    validateCountry,
    validateCapital
  }
}