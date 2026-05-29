<script setup lang="ts">
import type { GameSettings } from '../types/game'

const route = useRoute()

const settings: GameSettings = {
  numberOfCountries: Number(
    route.query.countries || 20
  ),

  continent:
    route.query.continent
      ?.toString()
      .trim() || null
}

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
  revealedCountries,
  wrongCountry,
  selectCountry,
  tasks
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
  <main
    class="h-dvh overflow-hidden bg-zinc-900 text-white"
  >
    <div class="flex h-full">

      <div class="relative flex-1">

        <WorldMap
          v-if="currentCountry"
          :current-country-code="
            currentCountry.code
          "
          :correct-countries="
            correctCountries
          "
          :revealed-countries="
            revealedCountries
          "
          :wrong-country="
            wrongCountry
          "
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
          Score :
          {{ score }}
        </p>

        <p
          class="mt-2 text-zinc-500"
        >
          Pays joués :
          {{
            usedCountries.length
          }}
          /
          {{ countries.length }}
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

          <FlagCard
            :country="
              currentCountry
            "
          />

          <GameInput
            v-model="answer"
            :placeholder="
              placeholder
            "
            @enter="handleEnter"
          />

          <div
            class="mt-6 flex flex-col gap-2"
          >

            <div
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
                  : currentCountry.name
              }}
            </div>

            <div
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
                  : currentCountry.capital
              }}
            </div>

            <div
              class="rounded-xl px-4 py-2 text-center text-sm font-semibold transition"
              :class="{
                'bg-zinc-700':
                  tasks.map ===
                  'pending',

                'bg-green-600':
                  tasks.map ===
                  'success',

                'bg-red-600':
                  tasks.map ===
                  'error'
              }"
            >
              Carte
            </div>

          </div>

        </template>

        <template v-else-if="gameFinished">

          <h2
            class="mt-12 text-4xl font-bold"
          >
            Partie terminée 🎉
          </h2>

          <p class="mt-6 text-2xl">
            Score final :
            {{ score }}
            /
            {{
              countries.length * 3
            }}
          </p>

          <button
            class="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            @click="restartGame"
          >
            Rejouer
          </button>

        </template>

      </div>

    </div>
  </main>
</template>