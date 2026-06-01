<script setup lang="ts">
const numberOfCountries = ref(20)

const selectedContinent = ref<
  string | null
>(null)

const continents = [
  'Europe',
  'Asie',
  'Afrique',
  'Amérique du Nord',
  'Amérique du Sud',
  'Océanie'
]

function startGame() {
  navigateTo({
    path: '/game',
    query: {
      countries:
        numberOfCountries.value,
      continent:
        selectedContinent.value ||
        ''
    }
  })
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-zinc-900 px-6 text-white"
  >
    <div
      class="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl"
    >
      <h1
        class="text-center text-5xl font-black"
      >
        GeoQuiz
      </h1>

      <p
        class="mt-4 text-center text-zinc-400"
      >
        Configurez votre partie
      </p>

      <div class="mt-12">

        <label
          class="text-lg font-semibold"
        >
          Nombre de pays
        </label>

        <input
          v-model="
            numberOfCountries
          "
          type="range"
          min="5"
          max="100"
          class="mt-4 w-full"
        >

        <div
          class="mt-2 text-center text-zinc-400"
        >
          {{
            numberOfCountries
          }}
          pays
        </div>

      </div>

      <div class="mt-6">

        <label
          class="text-lg font-semibold"
        >
          Continent
        </label>

        <div
          class="mt-4 grid grid-cols-2 gap-3"
        >

          <button
            class="rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-800"
            :class="{
              'bg-blue-600 border-blue-500':
                selectedContinent ===
                null
            }"
            @click="
              selectedContinent =
                null
            "
          >
            Monde entier
          </button>

          <button
            v-for="
              continent in continents
            "
            :key="continent"
            class="rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-800"
            :class="{
              'bg-blue-600 border-blue-500':
                selectedContinent ===
                continent
            }"
            @click="
              selectedContinent =
                continent
            "
          >
            {{ continent }}
          </button>

        </div>

      </div>

      <button
        class="mt-12 w-full rounded-2xl bg-blue-600 py-4 text-xl font-bold transition hover:bg-blue-500"
        @click="startGame"
      >
        Jouer
      </button>

    </div>
  </main>
</template>