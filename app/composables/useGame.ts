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
import { distance } from 'fastest-levenshtein'

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
    allCountries.filter(
      country =>
        !settings.continent ||
        country.continent ===
          settings.continent
    )

  const countries = ref<Country[]>([])

  const score = ref(0)

  const answer = ref('')

  const flagChoices = ref<Country[]>([])

  const usedCountries = ref<string[]>([])

  const correctCountries = ref<string[]>([])

  const revealedCountries = ref<string[]>([])

  const revealedCountry = ref<string | null>(null)

  const wrongCountry = ref<string | null>(null)

  const matchedCountryName = ref<string | null>(null)

  const matchedCapital = ref<string | null>(null)

  const gameFinished = ref(false)

  const tasks = reactive<Record<GameElement,TaskState>>({
    flag: 'pending',
    country: 'pending',
    capital: 'pending',
    map: 'pending'
  })

  function generateCountries() {
    countries.value = shuffle(
      filteredCountries
    ).slice(
      0,
      settings.numberOfCountries
    )
  }

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
      .replace(
        /[-'’\s]/g,
        ''
      )
      .toLowerCase()
  }

  function getRemainingCountries() {
    return countries.value.filter(
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
      countries.value
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
    generateCountries()
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

    function findBestMatch(
      input: string,
      values: string[]
    ) {
      const normalizedInput =
        normalizeString(input)

      let bestMatch: string | null =
        null

      let bestDistance =
        Infinity

      for (const value of values) {
        const d = distance(
          normalizedInput,
          normalizeString(value)
        )

        if (d < bestDistance) {
          bestDistance = d
          bestMatch = value
        }
      }

      if (!bestMatch) {
        return null
      }

      const maxDistance =
        bestMatch.length <= 6
          ? 1
          : bestMatch.length <= 12
            ? 2
            : 3

      return bestDistance <=
        maxDistance
        ? bestMatch
        : null
    }

  function validateCountry() {
    if (
      !currentCountry.value ||
      tasks.country !==
        'pending'
    ) {
      return
    }

    const matched =
      findBestMatch(
        answer.value,
        currentCountry.value.names
      )

    const success = !!matched

    matchedCountryName.value =
      matched

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

    const matched =
      findBestMatch(
        answer.value,
        currentCountry.value.capitals
      )

    const success = !!matched

    matchedCapital.value =
      matched

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

      revealedCountry.value = currentCountry.value.code
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
    const remainingCountries = getRemainingCountries()

    if (
      revealedCountry.value &&
      !revealedCountries.value.includes(
        revealedCountry.value
      )
    ) {
      revealedCountries.value.push(
        revealedCountry.value
      )
    }

    revealedCountry.value = null
    wrongCountry.value = null
    revealedFlag.value = null
    matchedCountryName.value = null
    matchedCapital.value = null

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
    generateCountries()

    score.value = 0
    usedCountries.value = []
    correctCountries.value = []
    revealedCountry.value = null
    revealedCountries.value = []
    wrongCountry.value = null
    revealedFlag.value = null
    gameFinished.value = false
    answer.value = ''
    matchedCountryName.value = null
    matchedCapital.value = null

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
      countries.value.length *
      targetElements.length
  )

  resetTasks()

  return {
    score,
    answer,
    usedCountries,
    correctCountries,
    revealedCountry,
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
    matchedCountryName,
    matchedCapital,

    startElement,
    targetElements, 

    flagChoices,
    selectFlag,
    revealedFlag, 
    maxScore, 

    continent: settings.continent
  }
}