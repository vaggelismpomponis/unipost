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
  MenuItem,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const UNIVERSITY_EMAIL_REGEX = /@(?:auth|uoa|upatras|uoc|uth)\.gr$/i

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    university: '',
    semester: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!UNIVERSITY_EMAIL_REGEX.test(formData.email)) {
      setError('Χρησιμοποίησε πανεπιστημιακό email (π.χ. @auth.gr, @uoa.gr, @upatras.gr, @uoc.gr, @uth.gr)')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν')
      return
    }
    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          university: formData.university,
          semester: formData.semester,
        }
      }
    })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess('Επιτυχής εγγραφή! Έλεγξε το email σου για επιβεβαίωση.')
      setTimeout(() => navigate('/login'), 3000)
    }
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
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
                <MenuItem value="uth">Πανεπιστήμιο Θεσσαλίας</MenuItem>
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
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Παρακαλώ περιμένετε...' : t('auth.register')}
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