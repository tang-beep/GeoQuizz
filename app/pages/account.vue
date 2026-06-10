<script setup lang="ts">
const supabase =
  useSupabase()

const user =
  useAuth()

const profile =
  useProfile()

const username =
  ref('')

const email =
  computed(
    () =>
      user.value?.email ?? ''
  )

const loading =
  ref(true)

const saving =
  ref(false)

const error =
  ref('')

const success =
  ref('')

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

  username.value =
    profile.value?.username ?? ''

  const {
    data: games
  } = await supabase
    .from('game_results')
    .select(
      'score, accuracy'
    )
    .eq(
      'user_id',
      user.value.id
    )

  if (games?.length) {
    stats.value = {
      bestScore: Math.max(
        ...games.map(
          game => game.score
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
              sum +
              game.score,
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

  error.value = ''
  success.value = ''

  const pseudo =
    username.value.trim()

  if (
    pseudo.length < 3
  ) {
    error.value =
      'Le pseudo doit contenir au moins 3 caractères'

    return
  }

  if (
    pseudo.length > 15
  ) {
    error.value =
      'Le pseudo doit contenir au maximum 15 caractères'

    return
  }

  saving.value = true

  const {
    data: existingUser
  } = await supabase
    .from('profiles')
    .select('id')
    .eq(
      'username',
      pseudo
    )
    .neq(
      'id',
      user.value.id
    )
    .maybeSingle()

  if (existingUser) {
    error.value =
      'Ce pseudo est déjà utilisé'

    saving.value = false

    return
  }

  const {
    error: updateError
  } = await supabase
    .from('profiles')
    .update({
      username: pseudo
    })
    .eq(
      'id',
      user.value.id
    )

  if (updateError) {
    error.value =
      updateError.message
  }

  else {
    if (profile.value) {
      profile.value = {
        ...profile.value,
        username: pseudo
      }
    }

    success.value =
      'Profil sauvegardé'
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
              maxlength="15"
              class="w-full rounded-xl bg-zinc-800 p-3"
            />

            <p
              class="mt-1 text-xs text-zinc-500"
            >
              3 à 15 caractères
            </p>
          </div>

          <p
            v-if="error"
            class="text-sm text-red-400"
          >
            {{ error }}
          </p>

          <p
            v-if="success"
            class="text-sm text-green-400"
          >
            {{ success }}
          </p>

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