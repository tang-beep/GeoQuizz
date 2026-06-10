export async function useCurrentUser() {
  const supabase = useSupabase()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}