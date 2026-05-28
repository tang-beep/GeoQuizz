<script setup lang="ts">
const {
  score,
  answer,
  result,
  usedCountries,
  gameFinished,
  inputRef,
  tasks,
roundFinished,
  currentCountry,
  placeholder,
  handleEnter,
  restartGame,
  countries,
  correctCountries,
  revealedCountries,
  wrongCountry,
  selectCountry
} = useGame()
</script>

<template>
  <main class="h-screen bg-zinc-900 text-white">
    <div class="flex h-full">

      <div class="flex-1 p-4">
        <WorldMap
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
        class="flex w-[420px] flex-col border-l border-zinc-800 p-8"
      >

        <h1 class="text-4xl font-bold">
          GeoQuiz
        </h1>

        <p class="mt-4 text-zinc-400">
          Score : {{ score }}
        </p>

        <p class="mt-2 text-zinc-500">
          Pays joués :
          {{ usedCountries.length }}
          /
          {{ countries.length }}
        </p>

        <button
          class="mt-6 rounded-xl bg-zinc-700 px-6 py-3 hover:bg-zinc-600"
          @click="restartGame"
        >
          Recommencer
        </button>

        <template v-if="!gameFinished">

          <FlagCard
            :country="currentCountry"
          />

          <GameInput
            v-model="answer"
            :placeholder="
              placeholder
            "
            :input-ref="inputRef"
            @enter="handleEnter"
          />

          <p
            class="mt-8 whitespace-pre-line text-center text-xl"
          >
            {{ result }}
          </p>

          <p
            v-if="!tasks.map"
            class="mt-6 text-center text-zinc-400"
          >
            Cliquez sur le pays
          </p>

          <p
            v-if="roundFinished"
            class="mt-6 text-center text-zinc-400"
          >
            Appuyez sur Entrée pour continuer
          </p>

        </template>

        <template v-else>

          <h2
            class="mt-12 text-4xl font-bold"
          >
            Partie terminée 🎉
          </h2>

          <p class="mt-6 text-2xl">
            Score final :
            {{ score }}
            /
            {{ countries.length * 3 }}
          </p>

          <button
            class="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            @click="restartGame"
          >
            Rejouer
          </button>

        </template>

      </div>

    </div>
  </main>
</template>