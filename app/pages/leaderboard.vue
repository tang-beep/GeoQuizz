<script setup lang="ts">
const supabase = useSupabase()

interface LeaderboardPlayer {
  user_id: string
  username: string | null
  best_score: number
  games_played: number
}

const players =
  ref<LeaderboardPlayer[]>([])

const loading =
  ref(true)

onMounted(async () => {
  const {
    data,
    error
  } = await supabase
    .from('leaderboard')
    .select('*')
    .order(
      'best_score',
      { ascending: false }
    )

  if (error) {
    console.error(error)
  }

  else {
    players.value =
      data ?? []
  }

  loading.value = false
})
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
      v-if="loading"
      class="text-center"
    >
      Chargement...
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
              Meilleur score
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
            :key="player.user_id"
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