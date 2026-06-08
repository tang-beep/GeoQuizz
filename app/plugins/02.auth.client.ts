import { defineNuxtPlugin } from 'nuxt/app'

import type {
  Session,
  AuthChangeEvent
} from '@supabase/supabase-js'

import { useSupabase } from '../composables/useSupabase'
import { useAuth } from '../composables/useAuth'

export default defineNuxtPlugin(
  async () => {
    const supabase =
      useSupabase()

    const user =
      useAuth()

    const {
      data: { session }
    } =
      await supabase.auth.getSession()

    user.value =
      session?.user ?? null

    supabase.auth.onAuthStateChange(
      (
        _event: AuthChangeEvent,
        session: Session | null
      ) => {
        user.value =
          session?.user ?? null
      }
    )
  }
)