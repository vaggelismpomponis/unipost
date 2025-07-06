import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuthStore } from '../store/authStore'

interface Profile {
  id: string
  first_name: string
  last_name: string
  university: string
  department: string
  semester: number
  created_at: string
  updated_at: string
  username?: string // SIS username
  sis_password?: string // SIS password (προαιρετικά, αν θέλουμε να το αποθηκεύουμε)
}

export const useProfile = () => {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα φόρτωσης προφίλ')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα ενημέρωσης προφίλ'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const isProfileComplete = () => {
    return profile && 
           profile.first_name && 
           profile.last_name && 
           profile.university && 
           profile.semester
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  return {
    profile,
    loading,
    error,
    updateProfile,
    isProfileComplete,
    fetchProfile
  }
} 