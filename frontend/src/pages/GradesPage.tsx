import React, { useEffect, useState } from 'react'
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material'
import { SemesterGradesTable, GradesAverageChart } from './GradesFetchPage'
import { useAuthStore } from '../store/authStore'
import GradeFetchForm from './GradesFetchPage'
import { useProfile } from '../hooks/useProfile'
import CryptoJS from 'crypto-js'

const API_BASE_URL = 'http://localhost:3001/api'

interface Grade {
  code?: string
  course?: string
  name?: string
  grade: number | string
  ects?: number | string
  date?: string
  semester?: string
  year?: string
  period?: string
  type?: string
  status?: 'passed' | 'failed'
  extractedAt?: string
}

const GradesPage: React.FC = () => {
  const { user } = useAuthStore()
  const { profile, loading: profileLoading } = useProfile()
  const [grades, setGrades] = useState<Grade[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const username = profile?.username || ''
  const defaultPassword = profile?.sis_password
    ? CryptoJS.AES.decrypt(profile.sis_password, 'unipost-demo-key').toString(CryptoJS.enc.Utf8)
    : ''

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const resGrades = await fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
        const data = await resGrades.json()
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          setGrades(data.history[0].grades || [])
          setHistory(data.history)
        } else {
          setGrades([])
          setHistory([])
        }
      } catch (err: any) {
        setError('Σφάλμα κατά τη λήψη βαθμολογιών')
      } finally {
        setLoading(false)
      }
    }
    if (username) fetchData()
  }, [username])

  // Υπολογισμός μέσου όρου για κάθε snapshot
  const averageHistory = history.map(snap => {
    const gradesArr = snap.grades || [];
    const validGrades = gradesArr
      .map((g: any) => typeof g.grade === 'string' ? parseFloat(g.grade.replace(',', '.')) : g.grade)
      .filter((g: number) => !isNaN(g));
    const avg = validGrades.length > 0 ? validGrades.reduce((a: number, b: number) => a + b, 0) / validGrades.length : 0;
    return {
      date: new Date(snap.fetched_at).toLocaleString('el-GR'),
      average: Number(avg.toFixed(2)),
    };
  });

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      {/* Φόρμα λήψης βαθμολογιών */}
      <Box sx={{ mb: 6 }}>
        {profileLoading ? <CircularProgress /> : !username ? (
          <Alert severity="info">Συμπλήρωσε το SIS username στο <a href="/profile">προφίλ σου</a> για να χρησιμοποιήσεις τη λήψη βαθμών.</Alert>
        ) : (
          <GradeFetchForm
            onFetch={(grades, history) => {
              setGrades(grades)
              setHistory(history)
              setError(null)
            }}
            defaultUsername={username}
            defaultPassword={defaultPassword}
          />
        )}
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => {
          if (username) {
            setLoading(true)
            setError(null)
            fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && Array.isArray(data.history) && data.history.length > 0) {
                  setGrades(data.history[0].grades || [])
                  setHistory(data.history)
                } else {
                  setGrades([])
                  setHistory([])
                }
              })
              .catch(() => setError('Σφάλμα κατά τη λήψη βαθμολογιών'))
              .finally(() => setLoading(false))
          }
        }}>Ανανέωση</Button>
      </Box>
      <Box>
        <Typography variant="h4" gutterBottom>Βαθμολογίες</Typography>
        {!user ? (
          <Alert severity="info">Πρέπει να συνδεθείς για να δεις τις βαθμολογίες σου.</Alert>
        ) : loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : <SemesterGradesTable grades={grades} />}
      </Box>
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>Εξέλιξη μέσου όρου</Typography>
        {!user ? (
          <Alert severity="info">Πρέπει να συνδεθείς για να δεις τα στατιστικά σου.</Alert>
        ) : loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : <GradesAverageChart averageHistory={averageHistory} />}
      </Box>
    </Container>
  )
}

export default GradesPage 