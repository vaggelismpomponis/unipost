import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ForumIcon from '@mui/icons-material/Forum'
import BarChartIcon from '@mui/icons-material/BarChart'
import AddIcon from '@mui/icons-material/Add'
import { useAuthStore } from '../store/authStore'
import { useProfile } from '../hooks/useProfile'
import { GradesTable, GradesAverageChart } from './GradesFetchPage'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { profile, isProfileComplete, loading: profileLoading } = useProfile()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to profile setup if profile is not complete
  if (!isProfileComplete()) {
    navigate('/profile-setup')
    return null
  }

  // Προσωρινά mock δεδομένα για επίδειξη
  const mockGrades = [
    { code: '123', name: 'Μαθηματικά', grade: 8.5, period: 'Ιούνιος', year: '2023', ects: 6, type: 'Υποχρεωτικό' },
    { code: '456', name: 'Φυσική', grade: 7.0, period: 'Ιανουάριος', year: '2023', ects: 5, type: 'Επιλογής' },
  ]
  const mockAverageHistory = [
    { date: '01/01/2023', average: 7.5 },
    { date: '01/06/2023', average: 8.0 },
    { date: '01/01/2024', average: 8.2 },
  ]

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.welcome')}, {profile?.first_name || 'φοιτητή'}!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('dashboard.today')}: 5 {t('dashboard.newPosts')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.averageGrade')}
                </Typography>
                <Typography variant="h3" color="primary">
                  8.4
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Εξάμηνο
                </Typography>
                <Typography variant="h3" color="primary">
                  5ο
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Μαθήματα
                </Typography>
                <Typography variant="h3" color="primary">
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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

        {/* Προβολή βαθμολογιών */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>Βαθμολογίες</Typography>
          <GradesTable grades={mockGrades} />
        </Box>

        {/* Προβολή στατιστικών */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>Εξέλιξη μέσου όρου</Typography>
          <GradesAverageChart averageHistory={mockAverageHistory} />
        </Box>
      </Container>
    </Box>
  )
}

export default Dashboard 