<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const supabase = useSupabase()

const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')


async function login() {
  error.value = ''
  loading.value = true

  try {
    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })

    if (authError) {
      throw authError
    }

    await navigateTo('/')
  }

  catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Connexion impossible'
  }

  finally {
    loading.value = false
  }
}

async function loginWithGoogle() {
  error.value = ''

  const {
    error: authError
  } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:
        window.location.origin
    }
  })

  if (authError) {
    error.value =
      authError.message
  }
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-zinc-900 p-6 text-white"
  >
    <div
      class="w-full max-w-md rounded-2xl bg-zinc-950 p-8"
    >
      <h1
        class="text-center text-4xl font-black"
      >
        Connexion
      </h1>

      <p
        class="mt-3 text-center text-zinc-400"
      >
        Connecte-toi pour accéder aux classements,
        défis quotidiens et au multijoueur.
      </p>

      <form
        class="mt-8 space-y-4"
        @submit.prevent="login"
      >
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full rounded-xl bg-zinc-800 p-3"
        >

        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          class="w-full rounded-xl bg-zinc-800 p-3"
        >

        <div class="text-right">
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            Mot de passe oublié ?
          </NuxtLink>
        </div>

        <p
          v-if="error"
          class="text-sm text-red-400"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-blue-600 py-3 font-bold transition hover:bg-blue-500 disabled:bg-zinc-700"
        >
          {{
            loading
              ? 'Connexion...'
              : 'Se connecter'
          }}
        </button>

        <button
          type="button"
          class="w-full rounded-xl bg-zinc-700 py-3"
          @click="navigateTo('/')"
        >
        Continuer comme invité
        </button>
      </form>

      <div
        class="my-6 flex items-center gap-4"
      >
        <div class="h-px flex-1 bg-zinc-800" />

        <span
          class="text-sm text-zinc-500"
        >
          ou
        </span>

        <div class="h-px flex-1 bg-zinc-800" />
      </div>

      <button
        class="w-full rounded-xl bg-zinc-800 py-3 font-semibold transition hover:bg-zinc-700"
        @click="loginWithGoogle"
      >
        Continuer avec Google
      </button>

      <p
        class="mt-6 text-center text-zinc-400"
      >
        Pas encore de compte ?

        <NuxtLink
          to="/register"
          class="text-blue-400"
        >
          S'inscrire
        </NuxtLink>
      </p>

      <button
        class="mt-8 w-full rounded-xl border border-zinc-700 py-3"
        @click="navigateTo('/')"
      >
        Retour au menu
      </button>
    </div>
  </main>
</template>