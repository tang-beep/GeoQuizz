<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const supabase = useSupabase()

const username = ref('')
const email = ref('')
const password = ref('')

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function register() {
  error.value = ''
  loading.value = true

  try {
    const pseudo =
      username.value.trim()

    if (pseudo.length < 3) {
      throw new Error(
        'Le pseudo doit contenir au moins 3 caractères'
      )
    }

    const {
      data: existingUser
    } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', pseudo)
      .maybeSingle()

    if (existingUser) {
      throw new Error(
        'Ce pseudo est déjà utilisé'
      )
    }

    const {
      error: authError
    } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: {
          username: pseudo
        }
      }
    })

    if (authError) {
      throw authError
    }

    success.value = true
  }

  catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Inscription impossible'
  }

  finally {
    loading.value = false
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
        Inscription
      </h1>

      <p
        class="mt-3 text-center text-zinc-400"
      >
        Crée ton compte GeoQuiz
      </p>

      <template v-if="!success">

        <form
          class="mt-8 space-y-4"
          @submit.prevent="register"
        >
          <input
            v-model="username"
            type="text"
            placeholder="Pseudo"
            class="w-full rounded-xl bg-zinc-800 p-3"
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
                ? 'Inscription...'
                : 'Créer mon compte'
            }}
          </button>
        </form>

        <p
          class="mt-6 text-center text-zinc-400"
        >
          Déjà inscrit ?

          <NuxtLink
            to="/login"
            class="text-blue-400"
          >
            Se connecter
          </NuxtLink>
        </p>

      </template>

      <template v-else>

        <div
          class="mt-8 rounded-xl bg-green-600/20 p-4 text-center text-green-400"
        >
          Compte créé avec succès 🎉
          <br>
          Vérifie ton email pour confirmer ton inscription.
        </div>

        <button
          class="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold"
          @click="navigateTo('/login')"
        >
          Aller à la connexion
        </button>

      </template>

    </div>
  </main>
</template>