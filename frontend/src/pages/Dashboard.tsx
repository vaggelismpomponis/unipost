import { useTranslation } from 'react-i18next'
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Skeleton
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ForumIcon from '@mui/icons-material/Forum'
import BarChartIcon from '@mui/icons-material/BarChart'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/apiConfig'

import { useProfile } from '../hooks/useProfile'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { profile, isProfileComplete, loading: profileLoading } = useProfile()

  const [loadingGrades, setLoadingGrades] = useState(true)
  const [average, setAverage] = useState<number | null>(null)
  const [ects, setEcts] = useState<number>(0)
  const [passedCount, setPassedCount] = useState(0)
  const [localFirstName, setLocalFirstName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profile_first_name') || '';
    }
    return '';
  });

  useEffect(() => {
    const fetchGrades = async () => {
      if (!profile?.username) return
      setLoadingGrades(true)
      try {
        const res = await fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(profile.username)}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          const gradesArr = data.history[0].grades || []
          // Υπολογισμός περασμένων μαθημάτων και ECTS μόνο για αυτά
          const passed = gradesArr.filter((g: any) => {
            const gradeNum = typeof g.grade === 'string' ? parseFloat(g.grade.replace(',', '.')) : g.grade
            return !isNaN(gradeNum) && gradeNum >= 5
          })
          setPassedCount(passed.length)
          const ectsSum = passed
            .map((g: any) => typeof g.ects === 'string' ? parseFloat(g.ects.replace(',', '.')) : g.ects)
            .filter((e: number) => !isNaN(e))
            .reduce((a: number, b: number) => a + b, 0)
          setEcts(ectsSum)
          // Υπολογισμός σταθμισμένου μέσου όρου με ECTS
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
        } else {
          setAverage(null)
          setEcts(0)
        }
      } catch {
        setAverage(null)
        setEcts(0)
      } finally {
        setLoadingGrades(false)
      }
    }
    fetchGrades()
  }, [profile?.username])

  useEffect(() => {
    if (profile?.first_name) {
      localStorage.setItem('profile_first_name', profile.first_name);
      setLocalFirstName(profile.first_name);
    }
  }, [profile?.first_name]);

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Box>
    )
  }

  // Redirect to profile setup if profile is not complete
  if (!isProfileComplete()) {
    navigate('/profile-setup')
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, bgcolor: 'background.default', minHeight: '100vh', borderRadius: 3, boxShadow: 0, color: 'text.primary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {loadingGrades ? (
            <Skeleton variant="circular" width={36} height={36} sx={{ mr: 2, animation: 'fadeIn 0.7s' }} />
          ) : null}
          <Typography variant="h4" gutterBottom sx={{ flex: 1 }}>
            {t('dashboard.welcome')}, {localFirstName || 'φοιτητή'}!
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('dashboard.today')}: 5 {t('dashboard.newPosts')}
        </Typography>
        
        {/* Skeleton loading για τις κάρτες */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loadingGrades ? (
            [...Array(3)].map((_, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderRadius: 3, animation: 'fadeIn 0.7s' }} />
                </Box>
              </Grid>
            ))
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', width: 80, height: 80, mb: 1 }}>
                      <Doughnut
                        data={{
                          labels: ['Μέσος όρος', 'Υπόλοιπο'],
                          datasets: [
                            {
                              data: [average || 0, Math.max(0, 10 - (average || 0))],
                              backgroundColor: ['#1976d2', '#bbdefb'],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: false,
                          cutout: '70%',
                          interaction: { mode: 'nearest', intersect: true },
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                          },
                        }}
                        width={80}
                        height={80}
                      />
                      <Typography variant="h5" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600 }}>
                        {loadingGrades ? <Skeleton variant="rectangular" width={60} height={24} /> : (average !== null ? average : '-')}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {t('dashboard.averageGrade')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                      Μέσος όρος από 0 έως 10
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Απομένει: {average !== null ? (10 - average).toFixed(2) : '-'} μονάδες για το 10
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', width: 80, height: 80, mb: 1 }}>
                      <Doughnut
                        data={{
                          labels: ['ECTS', 'Υπόλοιπο'],
                          datasets: [
                            {
                              data: [ects, Math.max(0, 240 - ects)],
                              backgroundColor: ['#1976d2', '#bbdefb'],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: false,
                          cutout: '70%',
                          interaction: { mode: 'nearest', intersect: true },
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                          },
                        }}
                        width={80}
                        height={80}
                      />
                      <Typography variant="h5" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600 }}>
                        {loadingGrades ? <Skeleton variant="rectangular" width={60} height={24} /> : ects}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Σύνολο ECTS
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                      ECTS που έχεις από 240
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Απομένουν: {240 - ects} ECTS
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ position: 'relative', width: 80, height: 80, mb: 1 }}>
                      <Doughnut
                        data={{
                          labels: ['Περασμένα', 'Υπόλοιπο'],
                          datasets: [
                            {
                              data: [passedCount, Math.max(0, 42 - passedCount)],
                              backgroundColor: ['#1976d2', '#bbdefb'],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: false,
                          cutout: '70%',
                          interaction: { mode: 'nearest', intersect: true },
                          plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                          },
                        }}
                        width={80}
                        height={80}
                      />
                      <Typography variant="h5" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 600 }}>
                        {loadingGrades ? <Skeleton variant="rectangular" width={60} height={24} /> : passedCount}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Περασμένα μαθήματα
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                      Περασμένα μαθήματα από 42
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Απομένουν: {42 - passedCount} μαθήματα
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Progress Bar πτυχίου -> αντικαθίσταται με doughnut charts */}
        <Grid container spacing={3}>
          {loadingGrades ? (
            [...Array(2)].map((_, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={100} height={100} sx={{ animation: 'fadeIn 0.7s' }} />
                  <Skeleton variant="text" width={120} height={28} sx={{ mt: 2, animation: 'fadeIn 0.7s' }} />
                  <Skeleton variant="text" width={80} height={20} sx={{ animation: 'fadeIn 0.7s' }} />
                </Box>
              </Grid>
            ))
          ) : (
            <>
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut
                    data={{
                      labels: ['ECTS που έχεις', 'Απομένουν'],
                      datasets: [
                        {
                          data: [ects, Math.max(0, 240 - ects)],
                          backgroundColor: ['#1976d2', '#bbdefb'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: false,
                      cutout: '70%',
                      interaction: { mode: 'nearest', intersect: true },
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                      },
                    }}
                    width={120}
                    height={120}
                  />
                </Box>
                <Typography align="center" sx={{ mt: 1 }}>
                  ECTS: {ects} / 240
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Doughnut
                    data={{
                      labels: ['Περασμένα μαθήματα', 'Απομένουν'],
                      datasets: [
                        {
                          data: [passedCount, Math.max(0, 42 - passedCount)],
                          backgroundColor: ['#1976d2', '#bbdefb'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: false,
                      cutout: '70%',
                      interaction: { mode: 'nearest', intersect: true },
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                      },
                    }}
                    width={120}
                    height={120}
                  />
                </Box>
                <Typography align="center" sx={{ mt: 1 }}>
                  Περασμένα μαθήματα: {passedCount} / 42
                </Typography>
              </Grid>
            </>
          )}
        </Grid>

        <Typography variant="h5" gutterBottom>
          {t('dashboard.quickActions')}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ForumIcon />}
              component={Link}
              to="/posts/new"
              sx={{ py: 2 }}
            >
              {t('dashboard.newPost')}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<BarChartIcon />}
              component={Link}
              to="/statistics"
              sx={{ py: 2 }}
            >
              {t('dashboard.viewStats')}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AssessmentIcon />}
              component={Link}
              to="/grades"
              sx={{ py: 2 }}
            >
              {t('nav.grades')}
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>
          {t('dashboard.recentActivity')}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  • Προσθήκη βαθμολογίας: Αλγόριθμοι (9.0)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Νέα ανάρτηση: "Ποιος ξέρει καλό βιβλίο για τα algorithms?"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Σχόλιο σε: "Ερωτήσεις για το τελικό"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Dashboard 