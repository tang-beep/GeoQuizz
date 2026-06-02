import {
  computed,
  onMounted,
  reactive,
  ref
} from 'vue'

import { countries as allCountries } from '../data/countries'

import type { Country } from '../types/country'
import type {
  GameElement,
  GameSettings
} from '../types/game'

type TaskState =
  | 'pending'
  | 'success'
  | 'error'

export function useGame(
  settings: GameSettings
) {
  const startElement =
    settings.startElement

  const targetElements =
    settings.targetElements

  const revealedFlag =
    ref<Country | null>(null)

  function shuffle<T>(
    array: T[]
  ) {
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

  const flagChoices = ref<
    Country[]
  >([])

  const usedCountries = ref<
    string[]
  >([])

  const correctCountries = ref<
    string[]
  >([])

  const revealedCountries = ref<
    string[]
  >([])

  const wrongCountry = ref<
    string | null
  >(null)

  const gameFinished =
    ref(false)

  const tasks = reactive<
    Record<
      GameElement,
      TaskState
    >
  >({
    flag: 'pending',
    country: 'pending',
    capital: 'pending',
    map: 'pending'
  })

  function resetTasks() {
    Object.keys(tasks).forEach(
      key => {
        const task =
          key as GameElement

        tasks[task] =
          targetElements.includes(
            task
          )
            ? 'pending'
            : 'success'
      }
    )
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

  function generateFlagChoices() {
    if (
      !currentCountry.value
    ) {
      return
    }

    const wrongCountries =
      countries
        .filter(
          country =>
            country.code !==
            currentCountry.value!
              .code
        )
        .sort(
          () =>
            Math.random() - 0.5
        )
        .slice(0, 3)

    flagChoices.value = shuffle([
      currentCountry.value,
      ...wrongCountries
    ])
  }

  const currentCountry =
    ref<Country | null>(null)

  onMounted(() => {
    currentCountry.value =
      pickRandomCountry()
    if (
      targetElements.includes(
        'flag'
      )
    ) {
      generateFlagChoices()
    }
  })

  const roundFinished =
    computed(() => {
      return targetElements.every(
        task =>
          tasks[task] !==
          'pending'
      )
    })

  const placeholder =
    computed(() => {
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

      return 'Entrée → question suivante'
    })

  function validateCountry() {
    if (
      !currentCountry.value ||
      tasks.country !==
        'pending'
    ) {
      return
    }

    const success =
      normalizeString(
        answer.value
      ) ===
      normalizeString(
        currentCountry.value.name
      )

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

    const success =
      normalizeString(
        answer.value
      ) ===
      normalizeString(
        currentCountry.value.capital
      )

    tasks.capital = success
      ? 'success'
      : 'error'

    if (success) {
      score.value++
    }

    answer.value = ''

    checkRoundCompletion()
  }

  function selectFlag(
    code: string
  ) {
    if (
      !currentCountry.value ||
      tasks.flag !== 'pending'
    ) {
      return
    }

    const success =
      code ===
      currentCountry.value.code

    tasks.flag = success
      ? 'success'
      : 'error'

    revealedFlag.value =
      currentCountry.value

    if (success) {
      score.value++
    }

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

    correctCountries.value = []

    revealedCountries.value = []

    wrongCountry.value = null

    revealedFlag.value = null

    if (
      remainingCountries.length ===
      0
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

    if (
      targetElements.includes(
        'flag'
      )
    ) {
      generateFlagChoices()
    }
  }

  function restartGame() {
    score.value = 0

    usedCountries.value = []

    correctCountries.value = []

    revealedCountries.value = []

    wrongCountry.value = null

    revealedFlag.value = null

    gameFinished.value = false

    answer.value = ''

    resetTasks()

    currentCountry.value =
      pickRandomCountry()

    if (
      targetElements.includes(
        'flag'
      )
    ) {
      generateFlagChoices()
    }
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

  const maxScore = computed(
    () =>
      countries.length *
      targetElements.length
  )

  resetTasks()

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
    countries,

    startElement,
    targetElements, 

    flagChoices,
    selectFlag,
    revealedFlag, 
    maxScore
  }
}