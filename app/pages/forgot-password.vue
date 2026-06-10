<script setup lang="ts">
const supabase =
  useSupabase()

const email = ref('')

const loading = ref(false)

const success = ref(false)

const error = ref('')

async function sendResetEmail() {
  loading.value = true
  error.value = ''

  const {
    error: resetError
  } = await supabase.auth.resetPasswordForEmail(
    email.value.trim(),
    {
      redirectTo:
        `${window.location.origin}/reset-password`
    }
  )

  if (resetError) {
    error.value =
      resetError.message

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
        class="text-center text-3xl font-black"
      >
        Mot de passe oublié
      </h1>

      <template v-if="!success">
        <form
          class="mt-8 space-y-4"
          @submit.prevent="sendResetEmail"
        >
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full rounded-xl bg-zinc-800 p-3"
          >

          <p
            v-if="error"
            class="text-red-400"
          >
            {{ error }}
          </p>

          <button
            class="w-full rounded-xl bg-blue-600 py-3 font-bold"
          >
            Envoyer le lien
          </button>
        </form>
      </template>

      <template v-else>
        <div
          class="mt-8 rounded-xl bg-green-600/20 p-4 text-center text-green-400"
        >
          Vérifie ta boîte mail.
        </div>
      </template>
    </div>
  </main>
</template>