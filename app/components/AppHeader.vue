<script setup lang="ts">
const supabase =
  useSupabase()

const user = useAuth()

const currentUser =
  computed(
    () => user.value
  )

const ready =
  ref(false)

onMounted(() => {
  ready.value = true
})

async function logout() {
  await supabase.auth.signOut()

  await navigateTo('/login')
}
</script>

<template>
  <header
    class="border-b border-zinc-800 bg-zinc-950"
  >
    <div
      v-if="ready"
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
    >
      <div
        class="flex items-center gap-8"
      >
        <NuxtLink
          to="/"
          class="text-xl font-black"
        >
          GeoQuiz
        </NuxtLink>

        <nav
          class="flex items-center gap-4"
        >
          <NuxtLink
            to="/leaderboard"
            class="text-zinc-300 hover:text-white"
          >
            Leaderboard
          </NuxtLink>

          <NuxtLink
            v-if="currentUser"
            to="/account"
            class="text-zinc-300 hover:text-white"
          >
            Mon compte
          </NuxtLink>
        </nav>
      </div>

      <div
        v-if="currentUser"
        class="flex items-center gap-4"
      >
        <span
          class="text-zinc-300"
        >
          {{
            currentUser.user_metadata
              ?.username ??
            currentUser.email
          }}
        </span>

        <button
          class="rounded-lg bg-red-600 px-3 py-2"
          @click="logout"
        >
          Déconnexion
        </button>
      </div>

      <div
        v-else
        class="flex gap-3"
      >
        <NuxtLink
          to="/login"
        >
          Connexion
        </NuxtLink>

        <NuxtLink
          to="/register"
        >
          Inscription
        </NuxtLink>
      </div>
    </div>
  </header>
</template>