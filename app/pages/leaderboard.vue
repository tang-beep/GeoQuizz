<script setup lang="ts">
import { getCountryCountLabel } from '~/utils/countriesCount'

const supabase = useSupabase()

interface LeaderboardPlayer {
  user_id: string
  game_mode: string
  username: string | null
  best_score: number
  games_played: number
}

interface LeaderboardMode {
  mode_id: string
  continent: string | null
  countries_count: number
  start_element: string
  target_elements: string[]
}

const players =
  ref<LeaderboardPlayer[]>([])

const modes =
  ref<LeaderboardMode[]>([])

const loading =
  ref(true)

const selectedContinent =
  ref<string>('')

const selectedCountries =
  ref<number | null>(null)

const selectedStartElement =
  ref<string>('')

const selectedTargets =
  ref<string>('')

async function loadModes() {
  const {
    data,
    error
  } = await supabase
    .from(
      'leaderboard_modes_view'
    )
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  modes.value = data ?? []

  const first =
    modes.value[0]

  if (!first) {
    return
  }

  selectedContinent.value =
    first.continent ?? 'world'

  selectedCountries.value =
    first.countries_count

  selectedStartElement.value =
    first.start_element

  selectedTargets.value =
    first.target_elements.join(',')
}

const continentOptions =
  computed(() =>
    [
      ...new Set(
        modes.value.map(
          mode =>
            mode.continent ??
            'world'
        )
      )
    ]
  )

const countryOptions =
  computed(() =>
    [
      ...new Set(
        modes.value
          .filter(
            mode =>
              (mode.continent ??
                'world') ===
              selectedContinent.value
          )
          .map(
            mode =>
              mode.countries_count
          )
      )
    ].sort(
      (a, b) => a - b
    )
  )

const startElementOptions =
  computed(() =>
    [
      ...new Set(
        modes.value
          .filter(
            mode =>
              (mode.continent ??
                'world') ===
                selectedContinent.value &&
              mode.countries_count ===
                selectedCountries.value
          )
          .map(
            mode =>
              mode.start_element
          )
      )
    ]
  )

const targetOptions =
  computed(() =>
    [
      ...new Set(
        modes.value
          .filter(
            mode =>
              (mode.continent ??
                'world') ===
                selectedContinent.value &&
              mode.countries_count ===
                selectedCountries.value &&
              mode.start_element ===
                selectedStartElement.value
          )
          .map(mode =>
            mode.target_elements.join(
              ','
            )
          )
      )
    ]
  )

const selectedMode =
  computed(() =>
    modes.value.find(
      mode =>
        (mode.continent ??
          'world') ===
          selectedContinent.value &&
        mode.countries_count ===
          selectedCountries.value &&
        mode.start_element ===
          selectedStartElement.value &&
        mode.target_elements.join(
          ','
        ) ===
          selectedTargets.value
    )?.mode_id ?? ''
  )

async function loadLeaderboard() {
  if (!selectedMode.value) {
    players.value = []
    return
  }

  loading.value = true

  const {
    data,
    error
  } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq(
      'game_mode',
      selectedMode.value
    )
    .order(
      'best_score',
      {
        ascending: false
      }
    )

  if (error) {
    console.error(error)
  }

  else {
    players.value =
      data ?? []
  }

  loading.value = false
}

function formatContinent(
  continent: string
) {
  switch (continent) {
    case 'world':
      return 'Monde entier'

    case 'europe':
      return 'Europe'

    case 'asia':
      return 'Asie'

    case 'northAmerica':
      return 'Amérique du Nord'

    case 'southAmerica':
      return 'Amérique du Sud'

    case 'africa':
      return 'Afrique'

    case 'oceania':
      return 'Océanie'

    default:
      return continent
  }
}

function formatElement(
  element: string
) {
  switch (element) {
    case 'flag':
      return 'Drapeau'

    case 'country':
      return 'Nom du pays'

    case 'capital':
      return 'Capitale'

    case 'map':
      return 'Emplacement'

    default:
      return element
  }
}

function formatTargets(
  value: string
) {
  return value
    .split(',')
    .map(formatElement)
    .join(', ')
}

onMounted(async () => {
  await loadModes()
  await loadLeaderboard()
})

watch(
  [
    selectedContinent,
    selectedCountries,
    selectedStartElement,
    selectedTargets
  ],
  () => {
    loadLeaderboard()
  }
)
</script>

<template>
  <main
    class="mx-auto max-w-5xl p-6 text-white"
  >
    <h1
      class="mb-8 text-center text-4xl font-black"
    >
      Leaderboard
    </h1>

    <div
      class="mb-8 grid gap-4 md:grid-cols-2"
    >
      <div>
        <label
          class="mb-2 block text-sm text-zinc-400"
        >
          Continent
        </label>

        <select
          v-model="
            selectedContinent
          "
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
          <option
            v-for="continent in continentOptions"
            :key="continent"
            :value="continent"
          >
            {{
              formatContinent(
                continent
              )
            }}
          </option>
        </select>
      </div>

      <div>
        <label
          class="mb-2 block text-sm text-zinc-400"
        >
          Nombre de pays
        </label>

        <select
          v-model="
            selectedCountries
          "
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
          <option
            v-for="count in countryOptions"
            :key="count"
            :value="count"
          >
            {{
              getCountryCountLabel(
                count,
                selectedContinent
              )
            }}
          </option>
        </select>
      </div>

      <div>
        <label
          class="mb-2 block text-sm text-zinc-400"
        >
          Élément affiché
        </label>

        <select
          v-model="
            selectedStartElement
          "
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
          <option
            v-for="element in startElementOptions"
            :key="element"
            :value="element"
          >
            {{
              formatElement(
                element
              )
            }}
          </option>
        </select>
      </div>

      <div>
        <label
          class="mb-2 block text-sm text-zinc-400"
        >
          Éléments à trouver
        </label>

        <select
          v-model="
            selectedTargets
          "
          class="w-full rounded-xl bg-zinc-800 p-3"
        >
          <option
            v-for="targets in targetOptions"
            :key="targets"
            :value="targets"
          >
            {{
              formatTargets(
                targets
              )
            }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="text-center"
    >
      Chargement...
    </div>

    <div
      v-else-if="
        players.length === 0
      "
      class="rounded-2xl border border-zinc-800 p-8 text-center text-zinc-400"
    >
      Aucun score enregistré.
    </div>

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-zinc-800"
    >
      <table
        class="w-full"
      >
        <thead
          class="bg-zinc-900"
        >
          <tr>
            <th class="p-4 text-left">
              Rang
            </th>

            <th class="p-4 text-left">
              Joueur
            </th>

            <th class="p-4 text-right">
              Score
            </th>

            <th class="p-4 text-right">
              Parties
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(
              player,
              index
            ) in players"
            :key="`${player.game_mode}-${player.user_id}`"
            class="border-t border-zinc-800"
          >
            <td class="p-4">
              #{{ index + 1 }}
            </td>

            <td
              class="p-4 font-semibold"
            >
              {{
                player.username ??
                'Anonyme'
              }}
            </td>

            <td
              class="p-4 text-right font-bold"
            >
              {{ player.best_score }}
            </td>

            <td
              class="p-4 text-right text-zinc-400"
            >
              {{ player.games_played }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>