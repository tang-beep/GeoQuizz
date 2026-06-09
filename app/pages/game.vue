<script setup lang="ts">
import { worldMap } from '~/maps/world'
import type {
  GameElement,
  GameSettings
} from '../types/game'
import { continents, type Continent } from '~/maps/worldViews'

const route = useRoute()

function isContinent(
  value: string
): value is Continent {
  return continents.includes(
    value as Continent
  )
}

const continentQuery =
  route.query.continent
    ?.toString()
    .trim()

const settings: GameSettings = {
  numberOfCountries: Number(
    route.query.countries || 20
  ),

  continent:
    continentQuery &&
      isContinent(continentQuery)
        ? continentQuery
        : null, 

  startElement:
    (
      route.query.start ||
      'flag'
    ) as GameElement,

  targetElements:
    route.query.targets
      ?.toString()
      .split(',')
      .filter(Boolean) as GameElement[],

  dailyChallenge:
    route.query.daily === '1'
}

function onKeyDown(
  event: KeyboardEvent
) {
  if (
    event.key !== 'Enter'
  ) {
    return
  }

  const target =
    event.target as HTMLElement

  if (
    target.tagName ===
      'BUTTON'
  ) {
    return
  }

  handleEnter()
}

function goToLeaderboard() {
  if (settings.dailyChallenge) {
    navigateTo('/daily-leaderboard')
    return
  }

  navigateTo('/leaderboard')
}

const supabase = useSupabase()

onMounted(() => {
  window.addEventListener(
    'keydown',
    onKeyDown
  )
})

onMounted(async () => {
  if (!settings.dailyChallenge) {
    return
  }

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    navigateTo('/login')
    return
  }

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const { data } = await supabase
    .from(
      'daily_challenge_attempts'
    )
    .select(
      'completed_at'
    )
    .eq(
      'challenge_date',
      today
    )
    .eq(
      'user_id',
      user.id
    )
    .maybeSingle()

  if (data?.completed_at) {
    navigateTo(
      '/daily-challenge'
    )
  }
})

onUnmounted(() => {
  window.removeEventListener(
    'keydown',
    onKeyDown
  )
})

const {
  score,
  answer,
  usedCountries,
  gameFinished,
  currentCountry,
  placeholder,
  handleEnter,
  restartGame,
  countries,
  correctCountries,
  revealedCountry,
  revealedCountries,
  wrongCountry,
  selectCountry,
  matchedCountryName,
  matchedCapital, 
  tasks,

  startElement,
  targetElements,

  flagChoices,
  revealedFlag,
  selectFlag,

  continent,

  elapsedTime
} = useGame(settings)

function goBackToMenu() {
  const confirmed = confirm(
    'Quitter la partie en cours ?'
  )

  if (!confirmed) {
    return
  }

  navigateTo('/')
}
</script>

<template>
  <main class="h-dvh overflow-hidden bg-zinc-900 text-white">
    <div class="flex h-full">

      <div
        v-if="
          targetElements.includes(
            'map'
          ) ||
          startElement === 'map'
        "
        class="relative flex-1"
      >
        <WorldMap
          v-if="currentCountry"
          :start-element="
            startElement
          "
          :used-countries="
            usedCountries
          "
          :highlight-country="
            currentCountry.code
          "
          :current-country-code="
            currentCountry.code
          "
          :correct-countries="
            correctCountries
          "
          :revealed-country="
            revealedCountry
          "
          :revealed-countries="
            revealedCountries
          "
          :wrong-country="
            wrongCountry
          "
          :map-config="
            worldMap
          "
          :continent="continent"
          @select-country="
            selectCountry
          "
        />
      </div>

      <div
        class="flex w-[380px] flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6"
      >

        <h1
          class="text-4xl font-black"
        >
          GeoQuiz
        </h1>

        <p
          class="mt-4 text-zinc-400"
        >
          {{usedCountries.length}} / {{ countries.length }}

          | Score :
          {{ score }}
        </p>

        <p class="text-zinc-400">
          Temps :
          {{ elapsedTime }}s
        </p>

        <button
          class="mt-4 rounded-xl bg-red-600 px-6 py-3 transition hover:bg-red-500"
          @click="goBackToMenu"
        >
          Retour au menu
        </button>

        <template
          v-if="
            !gameFinished &&
            currentCountry
          "
        >

          <StartElement
            v-if="
              startElement !==
              'map'
            "
            :country="
              currentCountry
            "
            :start-element="
              startElement
            "
          />

          <GameInput
            v-if="
              tasks.country ===
                'pending' ||
              tasks.capital ===
                'pending'
            "
            v-model="answer"
            :placeholder="placeholder"
          />

          <FlagChoices
            v-if="
              tasks.flag === 'pending'
            "
            :countries="flagChoices"
            @select="selectFlag"
          />

          <FlagChoices
            v-else-if="revealedFlag"
            :countries="[revealedFlag]"
            :disabled="true"
            :success="
              tasks.flag === 'success'
            "
            :error="
              tasks.flag === 'error'
            "
          />

          <div
            class="mt-6 flex flex-col gap-2"
          >

            <div
              v-if="
                targetElements.includes(
                  'country'
                )
              "
              class="rounded-xl px-4 py-2 text-center text-sm font-semibold transition"
              :class="{
                'bg-zinc-700':
                  tasks.country ===
                  'pending',

                'bg-green-600':
                  tasks.country ===
                  'success',

                'bg-red-600':
                  tasks.country ===
                  'error'
              }"
            >
              {{
                tasks.country ===
                'pending'
                  ? 'Pays'
                  : matchedCountryName ??
                    currentCountry.names[0]
              }}
            </div>

            <div
              v-if="
                targetElements.includes(
                  'capital'
                )
              "
              class="rounded-xl px-4 py-2 text-center text-sm font-semibold transition"
              :class="{
                'bg-zinc-700':
                  tasks.capital ===
                  'pending',

                'bg-green-600':
                  tasks.capital ===
                  'success',

                'bg-red-600':
                  tasks.capital ===
                  'error'
              }"
            >
              {{
                tasks.capital ===
                'pending'
                  ? 'Capitale'
                  : matchedCapital ??
                    currentCountry.capitals[0]
              }}
            </div>

          </div>

        </template>

        <template
          v-else-if="
            gameFinished
          "
        >

          <h2
            class="mt-12 text-4xl font-bold"
          >
            Partie terminée !
          </h2>

          <p class="mt-6 text-2xl">
            Score final :
            {{ score }}
            points
          </p>

          <div class="mt-8 flex flex-col gap-3">

          <button
            class="rounded-xl bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-500"
            @click="goToLeaderboard"
          >
            {{
              settings.dailyChallenge
                ? 'Voir le classement du défi'
                : 'Voir le leaderboard'
            }}
          </button>

          <button
            v-if="!settings.dailyChallenge"
            class="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            @click="restartGame"
          >
            Rejouer
          </button>

        </div>

        </template>

      </div>

    </div>
  </main>
</template>