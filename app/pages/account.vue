<script setup lang="ts">
const supabase = useSupabase()

const user = useAuth()

const username = ref('')
const email = computed(
  () => user.value?.email ?? ''
)

const loading = ref(true)
const saving = ref(false)

const stats = ref({
  bestScore: 0,
  gamesPlayed: 0,
  averageScore: 0,
  averageAccuracy: 0
})

onMounted(async () => {
  if (!user.value) {
    await navigateTo('/login')
    return
  }

  const [
    profileResult,
    statsResult
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.value.id)
      .single(),

    supabase
      .from('game_results')
      .select(
        'score, accuracy'
      )
      .eq(
        'user_id',
        user.value.id
      )
  ])

  if (
    profileResult.data
  ) {
    username.value =
      profileResult.data.username ?? ''
  }

  if (
    statsResult.data?.length
  ) {
    const games =
      statsResult.data

    stats.value = {
      bestScore: Math.max(
        ...games.map(
          g => g.score
        )
      ),

      gamesPlayed:
        games.length,

      averageScore:
        Math.round(
          games.reduce(
            (
              sum,
              game
            ) =>
              sum + game.score,
            0
          ) / games.length
        ),

      averageAccuracy:
        Math.round(
          games.reduce(
            (
              sum,
              game
            ) =>
              sum +
              Number(
                game.accuracy ?? 0
              ),
            0
          ) / games.length
        )
    }
  }

  loading.value = false
})

async function saveProfile() {
  if (!user.value) {
    return
  }

  saving.value = true

  const { error } =
    await supabase
      .from('profiles')
      .update({
        username:
          username.value.trim()
      })
      .eq(
        'id',
        user.value.id
      )

  if (error) {
    alert(error.message)
  }

  else {
    alert('Profil sauvegardé')
  }

  saving.value = false
}
</script>

<template>
  <main
    class="mx-auto max-w-4xl p-6 text-white"
  >
    <h1
      class="mb-8 text-4xl font-black"
    >
      Mon compte
    </h1>

    <div
      v-if="loading"
      class="text-center"
    >
      Chargement...
    </div>

    <div
      v-else
      class="space-y-8"
    >
      <section
        class="rounded-2xl border border-zinc-800 p-6"
      >
        <h2
          class="mb-4 text-2xl font-bold"
        >
          Profil
        </h2>

        <div
          class="space-y-4"
        >
          <div>
            <label
              class="mb-2 block text-sm text-zinc-400"
            >
              Email
            </label>

            <input
              :value="email"
              disabled
              class="w-full rounded-xl bg-zinc-800 p-3 opacity-70"
            >
          </div>

          <div>
            <label
              class="mb-2 block text-sm text-zinc-400"
            >
              Pseudo
            </label>

            <input
              v-model="username"
              class="w-full rounded-xl bg-zinc-800 p-3"
            >
          </div>

          <button
            class="rounded-xl bg-blue-600 px-5 py-3 font-bold"
            :disabled="saving"
            @click="saveProfile"
          >
            Sauvegarder
          </button>
        </div>
      </section>

      <section
        class="rounded-2xl border border-zinc-800 p-6"
      >
        <h2
          class="mb-4 text-2xl font-bold"
        >
          Statistiques
        </h2>

        <div
          class="grid gap-4 md:grid-cols-2"
        >
          <div>
            Meilleur score :
            <strong>
              {{ stats.bestScore }}
            </strong>
          </div>

          <div>
            Parties jouées :
            <strong>
              {{ stats.gamesPlayed }}
            </strong>
          </div>

          <div>
            Score moyen :
            <strong>
              {{ stats.averageScore }}
            </strong>
          </div>

          <div>
            Précision moyenne :
            <strong>
              {{ stats.averageAccuracy }}%
            </strong>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>