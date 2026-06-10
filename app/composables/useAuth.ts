import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  return useState<User | null>(
    'auth-user',
    () => null
  )
}