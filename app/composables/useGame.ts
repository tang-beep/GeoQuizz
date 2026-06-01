import {
  computed,
  onMounted,
  reactive,
  ref
} from 'vue'

import { countries as allCountries } from '../data/countries'

import type { Country } from '../types/country'
import type { GameSettings } from '../types/game'

type TaskState =
  | 'pending'
  | 'success'
  | 'error'

export function useGame(
  settings: GameSettings
) {
  function shuffle<T>(array: T[]) {
    return [...array].sort(
      () => Math.random() - 0.5
    )
  }

  const filteredCountries =
    allCountries.filter(country => {
      if (
        settings.continent &&
        country.continent !==
          settings.continent
      ) {
        return false
      }

      return true
    })

  const countries = shuffle(
    filteredCountries
  ).slice(
    0,
    settings.numberOfCountries
  )

  const score = ref(0)

  const answer = ref('')

  const usedCountries = ref<string[]>([])

  const correctCountries = ref<string[]>(
    []
  )

  const revealedCountries = ref<
    string[]
  >([])

  const wrongCountry = ref<
    string | null
  >(null)

  const gameFinished = ref(false)

  const tasks = reactive<{
    country: TaskState
    capital: TaskState
    map: TaskState
  }>({
    country: 'pending',
    capital: 'pending',
    map: 'pending'
  })

  function resetTasks() {
    tasks.country = 'pending'
    tasks.capital = 'pending'
    tasks.map = 'pending'
  }

  function normalizeString(
    value: string
  ) {
    return value
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
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

  const currentCountry =
    ref<Country | null>(null)

  onMounted(() => {
    currentCountry.value =
      pickRandomCountry()
  })

  const roundFinished = computed(
    () => {
      return (
        tasks.country !==
          'pending' &&
        tasks.capital !==
          'pending' &&
        tasks.map !== 'pending'
      )
    }
  )

  const placeholder = computed(() => {
    if (
      tasks.country ===
      'pending'
    ) {
      return 'Nom du pays'
    }

    if (
      tasks.capital ===
      'pending'
    ) {
      return 'Capitale'
    }

    return 'Appuyez sur Entrée'
  })

  function validateCountry() {
    if (
      !currentCountry.value ||
      tasks.country !==
        'pending'
    ) {
      return
    }

    const normalizedAnswer =
      normalizeString(answer.value)

    const normalizedCountry =
      normalizeString(
        currentCountry.value.name
      )

    const success =
      normalizedAnswer ===
      normalizedCountry

    tasks.country = success
      ? 'success'
      : 'error'

    if (success) {
      score.value++
    }

    answer.value = ''

    checkRoundCompletion()
  }

  function validateCapital() {
    if (
      !currentCountry.value ||
      tasks.capital !==
        'pending'
    ) {
      return
    }

    const normalizedAnswer =
      normalizeString(answer.value)

    const normalizedCapital =
      normalizeString(
        currentCountry.value.capital
      )

    const success =
      normalizedAnswer ===
      normalizedCapital

    tasks.capital = success
      ? 'success'
      : 'error'

    if (success) {
      score.value++
    }

    answer.value = ''

    checkRoundCompletion()
  }

  function selectCountry(
    code: string
  ) {
    if (
      !currentCountry.value ||
      gameFinished.value ||
      tasks.map !== 'pending'
    ) {
      return
    }

    if (
      code ===
      currentCountry.value.code
    ) {
      score.value++

      tasks.map = 'success'

      if (
        !correctCountries.value.includes(
          code
        )
      ) {
        correctCountries.value.push(
          code
        )
      }

      wrongCountry.value = null
    } else {
      tasks.map = 'error'

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

    checkRoundCompletion()
  }

  function checkRoundCompletion() {
    if (
      !currentCountry.value ||
      !roundFinished.value
    ) {
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

    if (
      remainingCountries.length === 0
    ) {
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

    answer.value = ''

    resetTasks()
  }

  function restartGame() {
    score.value = 0

    usedCountries.value = []

    correctCountries.value = []

    revealedCountries.value = []

    wrongCountry.value = null

    gameFinished.value = false

    answer.value = ''

    resetTasks()

    currentCountry.value =
      pickRandomCountry()
  }

  function handleEnter() {
    if (gameFinished.value) {
      return
    }

    if (roundFinished.value) {
      nextQuestion()

      return
    }

    if (
      tasks.country ===
      'pending'
    ) {
      validateCountry()

      return
    }

    if (
      tasks.capital ===
      'pending'
    ) {
      validateCapital()

      return
    }
  }

  return {
    score,
    answer,
    usedCountries,
    correctCountries,
    revealedCountries,
    wrongCountry,
    gameFinished,
    currentCountry,
    placeholder,
    roundFinished,
    tasks,
    handleEnter,
    restartGame,
    selectCountry,
    countries
  }
}