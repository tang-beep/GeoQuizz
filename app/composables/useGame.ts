import {
  computed,
  onMounted,
  onUnmounted,
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
  const questionStartTime = ref(0)
  const roundCorrectAnswers = ref(0)
  const elapsedTime = ref(0)
  const finalRoundTime = ref(0)
  const roundLocked = ref(false)
  const totalCorrectAnswers = ref(0)
  const gameStartTime = ref(Date.now())
  let totalTimeSeconds: number
  let timer: number

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
    currentCountry.value = pickRandomCountry()
    questionStartTime.value = Date.now()
    gameStartTime.value = Date.now()

    timer = window.setInterval(
      () => {
        if (roundLocked.value) {
          return
        }

        elapsedTime.value =
          Math.floor(
            (Date.now() -
              questionStartTime.value) /
              1000
          )
      },
      100
    )

    if (
      targetElements.includes(
        'flag'
      )
    ) {
      generateFlagChoices()
    }
  })

  onUnmounted(() => {
    clearInterval(timer)
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
      roundCorrectAnswers.value++
      totalCorrectAnswers.value++
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
      roundCorrectAnswers.value++
      totalCorrectAnswers.value++
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
      roundCorrectAnswers.value++
      totalCorrectAnswers.value++
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
      roundCorrectAnswers.value++
      totalCorrectAnswers.value++

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

  function getMultiplier(
    correctAnswers: number
  ) {
    switch (correctAnswers) {
      case 1:
        return 1

      case 2:
        return 2

      case 3:
        return 4

      case 4:
        return 8

      default:
        return 0
    }
  }

  function computeRoundScore() {
    const elapsedSeconds = finalRoundTime.value
    let speedBonus = 20

    if (elapsedSeconds < 5) {
      speedBonus = 100
    }
    else if (elapsedSeconds < 10) {
      speedBonus = 80
    }
    else if (elapsedSeconds < 20) {
      speedBonus = 60
    }
    else if (elapsedSeconds < 30) {
      speedBonus = 40
    }

    return Math.round(
      speedBonus *
      getMultiplier(
        roundCorrectAnswers.value
      )
    )
  }

  function checkRoundCompletion() {
    if (
      !currentCountry.value ||
      !roundFinished.value
    ) {
      return
    }

    finalRoundTime.value =
      (Date.now() -
        questionStartTime.value) /
      1000

    roundLocked.value = true

    if (
      !usedCountries.value.includes(
        currentCountry.value.code
      )
    ) {
      score.value += computeRoundScore()

      usedCountries.value.push(
        currentCountry.value.code
      )
    }
  }

  function buildModeId() {
    const continent =
      settings.continent ?? 'world'

    const targets =
      [...targetElements]
        .sort()
        .join('-')

    return [
      continent,
      countries.value.length,
      startElement,
      targets
    ].join('|')
  }

  async function saveGameResult() {
    const supabase =
      useSupabase()

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    if (!user) {
      return
    }

    const totalAnswers =
      countries.value.length *
      targetElements.length

    const { error } = await supabase
      .from('game_results')
      .insert({
        user_id: user.id,
        score: score.value,
        duration_seconds: totalTimeSeconds,
        correct_answers: totalCorrectAnswers.value,
        total_answers: totalAnswers,
        countries_count: countries.value.length,
        continent: settings.continent ?? 'world',
        start_element: settings.startElement,
        target_elements: targetElements,
        accuracy: 
          Math.round(
          (totalCorrectAnswers.value / totalAnswers) * 10000) / 100,
        mode_id: buildModeId(),
      })
    if (error) {
      console.error(
        'Erreur sauvegarde partie',
        error
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
      totalTimeSeconds = Math.round((Date.now() - gameStartTime.value) / 1000)
      saveGameResult()
      return
    }

    roundCorrectAnswers.value = 0
    questionStartTime.value = Date.now()
    elapsedTime.value = 0
    finalRoundTime.value = 0
    roundLocked.value = false

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
    roundCorrectAnswers.value = 0
    totalCorrectAnswers.value = 0
    elapsedTime.value = 0
    finalRoundTime.value = 0
    roundLocked.value = false
    gameStartTime.value = Date.now()
    questionStartTime.value = Date.now()

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

    continent: settings.continent,

    elapsedTime
  }
}