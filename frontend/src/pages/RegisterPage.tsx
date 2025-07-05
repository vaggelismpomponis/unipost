import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Link } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: '',
    semester: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement registration logic
    console.log('Registration attempt:', formData)
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
            {t('auth.register')}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="Όνομα"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Επώνυμο"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange('email')}
              helperText={t('auth.universityEmail')}
            />
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
              </Select>
            </FormControl>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange('password')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('auth.register')}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} to="/login" variant="body2">
                {t('auth.hasAccount')}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage 