import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabaseClient'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  checkUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      set({ user: data.user })
    }

    return { error: null }
  },

  signUp: async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  checkUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, loading: false })
    } catch (error) {
      set({ user: null, loading: false })
    }
  },
}))

// Initialize auth state
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ user: session?.user ?? null })
}) 