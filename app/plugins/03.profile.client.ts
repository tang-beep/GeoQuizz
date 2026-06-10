export default defineNuxtPlugin(
  async () => {
    const supabase = useSupabase()
    const user = useAuth()
    const profile = useProfile()

    watch(
      user,
      async newUser => {
        if (!newUser) {
          profile.value = null
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newUser.id)
          .single()

        profile.value = data
      },
      {
        immediate: true
      }
    )
  }
)