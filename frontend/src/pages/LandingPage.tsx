import { useTranslation } from 'react-i18next'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent
} from '@mui/material'
import { Link } from 'react-router-dom'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ForumIcon from '@mui/icons-material/Forum'
import DarkModeIcon from '@mui/icons-material/DarkMode'

const LandingPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom>
            UniPost
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Η πλατφόρμα για φοιτητές
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Διαχείριση βαθμολογιών, αναρτήσεις και στατιστικά
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              to="/register"
              sx={{ mr: 2 }}
            >
              {t('auth.register')}
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              to="/login"
            >
              {t('auth.login')}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Διαχείριση Βαθμολογιών
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Καταχωρήστε και παρακολουθήστε τις βαθμολογίες σας με λεπτομερή στατιστικά
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ForumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Αναρτήσεις & Κοινότητα
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Μοιραστείτε εμπειρίες και ερωτήσεις με άλλους φοιτητές
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <DarkModeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Dark Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Προσαρμοστικό θέμα για καλύτερη εμπειρία χρήσης
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default LandingPage 