<script setup lang="ts">
const supabase = useSupabase()

const loading = ref(true)

const activeTab =
  ref<'daily' | 'global'>(
    'daily'
  )

const user = useAuth()

const currentUser =
  computed(
    () => user.value
  )

const myDailyRank =
  ref<any>(null)

const myGlobalRank =
  ref<any>(null)

const dailyPlayers =
  ref<any[]>([])

const globalPlayers =
  ref<any[]>([])

async function loadDailyLeaderboard() {
  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const {
    data: allPlayers,
      error
    } = await supabase
    .from(
      'daily_leaderboard_view'
    )
    .select('*')
    .eq(
      'challenge_date',
      today
    )
    .order(
      'score',
      {
        ascending: false
      }
    )
    .order(
      'duration_seconds',
      {
        ascending: true
      }
    )

  if (error) {
    console.error(error)
    return
  }

  if (currentUser.value) {
    const currentUserId =
      currentUser.value.id

    const rank =
      allPlayers?.findIndex(
        p =>
          p.user_id ===
          currentUserId
      )

    if (
      rank !== undefined &&
      rank >= 0
    ) {
      myDailyRank.value = {
        ...allPlayers?.[rank],
        rank: rank + 1
      }
    }
  }

  dailyPlayers.value =
    allPlayers?.slice(
      0,
      100
    ) ?? []
}

async function loadGlobalLeaderboard() {
  const {
    data: allPlayers,
    error
  } = await supabase
    .from(
      'daily_challenge_points'
    )
    .select(`
      user_id,
      total_points,
      current_streak,
      best_streak,
      profiles (
        username
      )
    `)
    .order(
      'total_points',
      {
        ascending: false
      }
    )

  if (error) {
    console.error(error)
    return
  }

  if (currentUser.value) {
    const currentUserId =
      currentUser.value.id

    const rank =
      allPlayers?.findIndex(
        p =>
          p.user_id ===
          currentUserId
      )

    if (
      rank !== undefined &&
      rank >= 0
    ) {
      myGlobalRank.value = {
        ...allPlayers?.[rank],
        rank: rank + 1
      }
    }
  }

  globalPlayers.value =
    allPlayers?.slice(
      0,
      100
    ) ?? []
}

async function loadData() {
  loading.value = true

  await Promise.all([
    loadDailyLeaderboard(),
    loadGlobalLeaderboard()
  ])

  loading.value = false
}

onMounted(loadData)
</script>

<template>
  <main
    class="mx-auto max-w-5xl p-6 text-white"
  >
    <h1
      class="mb-8 text-center text-4xl font-black"
    >
      Daily Leaderboard
    </h1>

<div
  class="mb-8 flex rounded-xl bg-zinc-800 p-1"
>
  <button
    class="flex-1 rounded-lg py-3 font-semibold transition"
    :class="{
      'bg-blue-600':
        activeTab ===
        'daily'
    }"
    @click="
      activeTab = 'daily'
    "
  >
    Classement du jour
  </button>

  <button
    class="flex-1 rounded-lg py-3 font-semibold transition"
    :class="{
      'bg-blue-600':
        activeTab ===
        'global'
    }"
    @click="
      activeTab = 'global'
    "
  >
    Classement global
  </button>
</div>

<div
  v-if="loading"
  class="text-center"
>
  Chargement...
</div>

<div
  v-else-if="
    activeTab === 'daily'
  "
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
          Temps
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="(
          player,
          index
        ) in dailyPlayers"
        :key="
          player.user_id
        "
        :class="[
          'border-t border-zinc-800',
          player.user_id === currentUser?.id
            ? 'bg-yellow-500/10'
            : ''
        ]"
      >
        <td class="p-4">
          #{{ index + 1 }}
        </td>

        <td
          class="p-4 font-semibold"
        >
          {{
            player.username
          }}
        </td>

        <td
          class="p-4 text-right font-bold"
        >
          {{
            player.score
          }}
        </td>

        <td
          class="p-4 text-right text-zinc-400"
        >
          {{
            player.duration_seconds
          }}s
        </td>
      </tr>
    </tbody>
  </table>
  <div
    v-if="
      myDailyRank &&
      myDailyRank.rank > 100
    "
    class="border-t border-zinc-800 bg-yellow-500/10 p-4"
  >
    <div
      class="font-bold text-yellow-400"
    >
      Votre classement
    </div>

    <div class="mt-2">
      #{{ myDailyRank.rank }}
      —
      {{ myDailyRank.username }}
    </div>

    <div>
      Score :
      {{ myDailyRank.score }}
    </div>

    <div>
      Temps :
      {{ myDailyRank.duration_seconds }}s
    </div>
  </div>
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
          Points
        </th>

        <th class="p-4 text-right">
          Série
        </th>

        <th class="p-4 text-right">
          Record
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="(
          player,
          index
        ) in globalPlayers"
        :key="
          player.user_id
        "
        :class="[
          'border-t border-zinc-800',
          player.user_id === currentUser?.id
            ? 'bg-yellow-500/10'
            : ''
        ]"
      >
        <td class="p-4">
          #{{ index + 1 }}
        </td>

        <td
          class="p-4 font-semibold"
        >
          {{
            player.profiles
              ?.username ??
            'Anonyme'
          }}
        </td>

        <td
          class="p-4 text-right font-bold"
        >
          {{
            player.total_points
          }}
        </td>

        <td
          class="p-4 text-right"
        >
          {{
            player.current_streak
          }}
        </td>

        <td
          class="p-4 text-right text-zinc-400"
        >
          {{
            player.best_streak
          }}
        </td>
      </tr>
    </tbody>
  </table>

  <div
    v-if="
      myGlobalRank &&
      myGlobalRank.rank > 100
    "
    class="border-t border-zinc-800 bg-yellow-500/10 p-4"
  >
    <div
      class="font-bold text-yellow-400"
    >
      Votre classement
    </div>

    <div class="mt-2">
      #{{ myGlobalRank.rank }}
      —
      {{
        myGlobalRank.profiles
          ?.username ??
        'Anonyme'
      }}
    </div>

    <div>
      Points :
      {{ myGlobalRank.total_points }}
    </div>

    <div>
      Série :
      {{ myGlobalRank.current_streak }}
    </div>
  </div>
</div>

  </main>
</template>
