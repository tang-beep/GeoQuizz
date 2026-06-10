import type { Profile } from "~/types/profile"

export const useProfile = () => {
  return useState<Profile | null>(
    'profile',
    () => null
  )
}