<script setup lang="ts">
definePageMeta({
  layout: false
})

const supabase = useSupabase()

const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function updatePassword() {
  error.value = ''

  if (
    password.value.length < 6
  ) {
    error.value =
      'Le mot de passe doit contenir au moins 6 caractères'

    return
  }

  if (
    password.value !==
    confirmPassword.value
  ) {
    error.value =
      'Les mots de passe ne correspondent pas'

    return
  }

  loading.value = true

  const {
    error: updateError
  } = await supabase.auth.updateUser({
    password:
      password.value
  })

  if (updateError) {
    error.value =
      updateError.message

    loading.value = false

    return
  }

  success.value = true

  loading.value = false
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
        Nouveau mot de passe
      </h1>

      <template
        v-if="!success"
      >
        <p
          class="mt-3 text-center text-zinc-400"
        >
          Choisis un nouveau mot de passe.
        </p>

        <form
          class="mt-8 space-y-4"
          @submit.prevent="
            updatePassword
          "
        >
          <input
            v-model="password"
            type="password"
            placeholder="Nouveau mot de passe"
            class="w-full rounded-xl bg-zinc-800 p-3"
          >

          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
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
                ? 'Mise à jour...'
                : 'Changer le mot de passe'
            }}
          </button>
        </form>
      </template>

      <template
        v-else
      >
        <div
          class="mt-8 rounded-xl bg-green-600/20 p-4 text-center text-green-400"
        >
          Mot de passe modifié avec succès
        </div>

        <button
          class="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold"
          @click="
            navigateTo('/login')
          "
        >
          Se connecter
        </button>
      </template>
    </div>
  </main>
</template>