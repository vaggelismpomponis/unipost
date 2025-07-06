import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import { useProfile } from '../hooks/useProfile'
import { useNavigate } from 'react-router-dom'

const steps = ['Προσωπικά Στοιχεία', 'Ακαδημαϊκά Στοιχεία', 'Επιβεβαίωση']

const ProfileSetup: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, updateProfile, loading } = useProfile()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    university: profile?.university || '',
    department: profile?.department || '',
    semester: profile?.semester || 1,
    username: profile?.username || '',
    sis_password: profile?.sis_password || '',
  })

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    const result = await updateProfile(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Το προφίλ σας ενημερώθηκε επιτυχώς!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Στοιχεία ταυτοποίησης
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label="Όνομα"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange('first_name')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="Επώνυμο"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange('last_name')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="SIS Username"
              name="username"
              value={formData.username}
              onChange={handleChange('username')}
              helperText="Το username που χρησιμοποιείς στο sis-web.uth.gr"
            />
            <TextField
              margin="normal"
              fullWidth
              id="sis_password"
              label="SIS Password (προαιρετικό)"
              name="sis_password"
              type="password"
              value={formData.sis_password}
              onChange={handleChange('sis_password')}
              helperText="Αν θέλεις να αποθηκεύεται προσωρινά για αυτόματη λήψη βαθμών."
            />
          </Box>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ακαδημαϊκά στοιχεία
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="university-label">Πανεπιστήμιο</InputLabel>
              <Select
                labelId="university-label"
                id="university"
                value={formData.university}
                label="Πανεπιστήμιο"
                onChange={handleSelectChange('university')}
              >
                <MenuItem value="auth">Αριστοτέλειο Πανεπιστήμιο Θεσσαλονίκης</MenuItem>
                <MenuItem value="uoa">Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών</MenuItem>
                <MenuItem value="upatras">Πανεπιστήμιο Πατρών</MenuItem>
                <MenuItem value="uoc">Πανεπιστήμιο Κρήτης</MenuItem>
                <MenuItem value="uth">Πανεπιστήμιο Θεσσαλίας</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="department"
              label="Τμήμα"
              name="department"
              value={formData.department}
              onChange={handleChange('department')}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="semester-label">Εξάμηνο</InputLabel>
              <Select
                labelId="semester-label"
                id="semester"
                value={formData.semester}
                label="Εξάμηνο"
                onChange={handleSelectChange('semester')}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sem => (
                  <MenuItem key={sem} value={sem}>{sem}ο</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Επιβεβαίωση στοιχείων
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Όνομα:</strong> {formData.first_name}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Επώνυμο:</strong> {formData.last_name}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Πανεπιστήμιο:</strong> {formData.university}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Τμήμα:</strong> {formData.department || 'Δεν έχει συμπληρωθεί'}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Εξάμηνο:</strong> {formData.semester}ο
            </Typography>
          </Box>
        )
      default:
        return 'Unknown step'
    }
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" textAlign="center" gutterBottom>
            Συμπλήρωση Προφίλ
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Παρακαλώ συμπληρώστε τα στοιχεία σας για να συνεχίσετε
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Πίσω
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Αποθήκευση...' : 'Ολοκλήρωση'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && (!formData.first_name || !formData.last_name)) ||
                    (activeStep === 1 && (!formData.university || !formData.semester))
                  }
                >
                  Επόμενο
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default ProfileSetup 