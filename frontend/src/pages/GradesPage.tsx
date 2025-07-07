import React, { useEffect, useState } from 'react'
import { Container, Typography, Box, Alert, Button, Stack, useMediaQuery, Skeleton, Paper } from '@mui/material'
import { GradeFetchForm } from './GradesFetchPage'
import { useProfile } from '../hooks/useProfile'
import CryptoJS from 'crypto-js'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import { API_BASE_URL } from '../utils/apiConfig'
import { useSnackbar } from '../App'
import AverageGradeCard from '../components/AverageGradeCard'
import { SemesterGradesTable } from './GradesFetchPage'

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
  const { profile, loading: profileLoading } = useProfile()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showMessage } = useSnackbar()
  const [showCacheWarning, setShowCacheWarning] = useState(false)

  const username = profile?.username || ''
  const defaultPassword = profile?.sis_password
    ? CryptoJS.AES.decrypt(profile.sis_password, 'unipost-demo-key').toString(CryptoJS.enc.Utf8)
    : ''

  const isMobile = useMediaQuery('(max-width:930px)');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Υπολογισμός σταθμισμένου μέσου όρου με ECTS (όπως στο Dashboard)
  const [average, setAverage] = useState<number | null>(null)
  useEffect(() => {
    if (!grades.length) { setAverage(null); return }
    const passed = grades.filter((g: any) => {
      const gradeNum = typeof g.grade === 'string' ? parseFloat(g.grade.replace(',', '.')) : g.grade
      return !isNaN(gradeNum) && gradeNum >= 5
    })
    const weighted = passed
      .map((g: any) => {
        const gradeNum = typeof g.grade === 'string' ? parseFloat(g.grade.replace(',', '.')) : g.grade
        const ectsNum = typeof g.ects === 'string' ? parseFloat(g.ects.replace(',', '.')) : g.ects
        return (!isNaN(gradeNum) && !isNaN(ectsNum)) ? { grade: gradeNum, ects: ectsNum } : null
      })
      .filter((g: any) => g && g.ects > 0)
    const weightedSum = weighted.reduce((sum: number, g: any) => sum + g.grade * g.ects, 0)
    const totalWeightedEcts = weighted.reduce((sum: number, g: any) => sum + g.ects, 0)
    setAverage(weighted.length && totalWeightedEcts > 0 ? Number((weightedSum / totalWeightedEcts).toFixed(2)) : null)
  }, [grades])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setShowCacheWarning(false)
      try {
        const resGrades = await fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
        const data = await resGrades.json()
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          setGrades(data.history[0].grades || [])
          localStorage.setItem('grades-cache', JSON.stringify({ grades: data.history[0].grades || [], history: data.history }))
          localStorage.setItem('grades-latest', JSON.stringify(data.history[0].grades || []))
        } else {
          setGrades([])
          localStorage.removeItem('grades-cache')
          localStorage.removeItem('grades-latest')
        }
      } catch (err: any) {
        const cache = localStorage.getItem('grades-cache')
        if (cache) {
          const parsed = JSON.parse(cache)
          setGrades(parsed.grades || [])
          setShowCacheWarning(true)
        } else {
          setError('Δεν ήταν δυνατή η φόρτωση των βαθμών.')
        }
      } finally {
        setLoading(false)
      }
    }
    if (username) fetchData()
  }, [username])

  return (
    <Container maxWidth="md" sx={{ mt: 8, bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Φόρμα λήψης βαθμολογιών */}
      <Box sx={{ mb: 6 }}>
        {profileLoading ? <Skeleton variant="rectangular" width="100%" height={40} /> : !username ? (
          <Alert severity="info">Συμπλήρωσε το SIS username στο <a href="/profile">προφίλ σου</a> για να χρησιμοποιήσεις τη λήψη βαθμών.</Alert>
        ) : (
          <GradeFetchForm
            onFetch={(grades) => {
              setGrades(grades)
              setError(null)
              if (!grades.length) {
                showMessage('Δεν έχεις νέους βαθμούς!', 'info')
              } else {
                const prevCodes = new Set(
                  grades
                    .filter((g: any) => typeof g.code === 'string' && typeof g.grade !== 'undefined')
                    .map((g: any) => g.code + g.grade)
                )
                const newOnes = grades.filter(
                  g => typeof g.code === 'string' && typeof g.grade !== 'undefined' && !prevCodes.has(g.code + g.grade)
                )
                if (newOnes.length === 0) {
                  showMessage('Δεν έχεις νέους βαθμούς!', 'info')
                } else if (newOnes.length === 1) {
                  showMessage('Έχεις 1 νέο βαθμό!', 'success')
                } else {
                  showMessage(`Έχεις ${newOnes.length} νέους βαθμούς!`, 'success')
                }
              }
            }}
            defaultUsername={username}
            defaultPassword={defaultPassword}
            autoFetch={!!(username && defaultPassword)}
            formId="auto-fetch-form"
          />
        )}
      </Box>
      <Box>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0, textAlign: isMobile ? 'left' : 'center' }}>Βαθμολογίες</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" aria-label="Ανανέωση" onClick={() => {
              if (username) {
                setLoading(true)
                setError(null)
                setShowCacheWarning(false)
                fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.success && Array.isArray(data.history) && data.history.length > 0) {
                      setGrades(data.history[0].grades || [])
                      localStorage.setItem('grades-cache', JSON.stringify({ grades: data.history[0].grades || [], history: data.history }))
                      localStorage.setItem('grades-latest', JSON.stringify(data.history[0].grades || []))
                    } else {
                      setGrades([])
                      localStorage.removeItem('grades-cache')
                      localStorage.removeItem('grades-latest')
                    }
                  })
                  .catch(() => {
                    const cache = localStorage.getItem('grades-cache')
                    if (cache) {
                      const parsed = JSON.parse(cache)
                      setGrades(parsed.grades || [])
                      setShowCacheWarning(true)
                    } else {
                      setError('Δεν ήταν δυνατή η φόρτωση των βαθμών.')
                    }
                  })
                  .finally(() => setLoading(false))
              }
            }}>
              <RefreshIcon />
            </Button>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFiltersOpen(true)}>
              Φίλτρα
            </Button>
          </Stack>
        </Stack>
        {showCacheWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Τα δεδομένα που βλέπεις είναι αποθηκευμένα από προηγούμενη επίσκεψη.
          </Alert>
        )}
        {!username ? (
          <Alert severity="info">Πρέπει να συνδεθείς για να δεις τις βαθμολογίες σου.</Alert>
        ) : loading ? <Skeleton variant="rectangular" width="100%" height={40} /> : error ? <Alert severity="error">{error}</Alert> : null}
        {/* Εμφάνιση του AverageGradeCard με doughnut chart */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <AverageGradeCard average={average} loading={loading} />
        </Box>
        {/* Εμφάνιση του πίνακα βαθμολογιών */}
        {!loading && !error && username && <SemesterGradesTable grades={grades} profile={profile} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} />}
        {loading && (
          <Box sx={{ mt: 2 }}>
            {/* Desktop skeleton table */}
            {!isMobile ? (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 1 }}>
                <Box sx={{ display: 'flex', px: 2, py: 1, bgcolor: 'grey.100' }}>
                  {["Κωδικός", "Μάθημα", "Βαθμός", "Εξ. περίοδος", "Ακ. Έτος", "ECTS", "Τύπος"].map((_, i) => (
                    <Skeleton key={i} variant="text" width={i === 1 ? 180 : 80} height={28} sx={{ mx: 1 }} />
                  ))}
                </Box>
                {[...Array(6)].map((_, idx) => (
                  <Box key={idx} sx={{ display: 'flex', px: 2, py: 1 }}>
                    {[...Array(7)].map((__, j) => (
                      <Skeleton key={j} variant="text" width={j === 1 ? 180 : 80} height={24} sx={{ mx: 1 }} />
                    ))}
                  </Box>
                ))}
              </Box>
            ) : (
              <Stack spacing={2}>
                {[...Array(4)].map((_, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ backgroundColor: 'background.paper', color: 'text.primary', boxShadow: 1, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 }, p: 2.5 }}>
                    <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default GradesPage 