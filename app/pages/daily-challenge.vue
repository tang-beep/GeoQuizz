<script setup lang="ts">
const supabase = useSupabase()

const loading = ref(true)
const starting = ref(false)

const alreadyPlayed = ref(false)

async function loadStatus() {
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    navigateTo('/login')
    return
  }

  const today = new Date()
    .toISOString()
    .split('T')[0]

  const { data } = await supabase
    .from('daily_challenge_attempts')
    .select('user_id')
    .eq('challenge_date', today)
    .eq('user_id', user.data.user.id)
    .maybeSingle()

  alreadyPlayed.value = !!data

  loading.value = false
}

async function startChallenge() {
  starting.value = true

  const {
    data,
    error
  } = await supabase.rpc(
    'start_daily_challenge'
  )

  if (error) {
    console.error(error)

    alert(
      error.message
    )

    starting.value = false
    return
  }

  navigateTo({
    path: '/game',
    query: {
      daily: '1',
      countries:
        data.countries_count,
      continent:
        data.continent ?? '',
      start:
        data.start_element,
      targets:
        data.target_elements.join(',')
    }
  })
}

onMounted(loadStatus)
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-zinc-900 p-6 text-white"
  >
    <div
      class="w-full max-w-xl rounded-2xl bg-zinc-950 p-8"
    >
      <h1
        class="text-center text-4xl font-black"
      >
        Défi du jour
      </h1>

      <p
        class="mt-4 text-center text-zinc-400"
      >
        Un seul essai par jour.
      </p>

      <div
        v-if="loading"
        class="mt-10 text-center"
      >
        Chargement...
      </div>

      <div
        v-else-if="alreadyPlayed"
        class="mt-10 rounded-xl border border-zinc-800 p-6 text-center"
      >
        <div
          class="text-xl font-bold"
        >
          Défi déjà joué aujourd'hui
        </div>

        <p
          class="mt-2 text-zinc-400"
        >
          Revenez demain pour
          un nouveau défi.
        </p>
      </div>

      <div
        v-else
        class="mt-10"
      >
        <button
          :disabled="starting"
          class="w-full rounded-xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500 disabled:bg-zinc-700"
          @click="startChallenge"
        >
          {{
            starting
              ? 'Lancement...'
              : 'Commencer le défi'
          }}
        </button>
      </div>
      
      <NuxtLink
        to="/daily-leaderboard"
        class="mt-4 block text-center text-zinc-400 hover:text-white"
        >
        Voir le classement du jour
      </NuxtLink>
    </div>
  </main>
</template>