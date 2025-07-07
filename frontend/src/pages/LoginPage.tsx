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
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    setLoading(false)
    
    if (signInError) {
      setError(signInError.message)
    } else if (data.user) {
      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        setError('Παρακαλώ επιβεβαιώστε το email σας πριν συνδεθείτε.')
        return
      }
      
      // Redirect to dashboard
      navigate('/grades')
    }
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
            {t('auth.login')}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Σύνδεση...' : t('auth.login')}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} to="/register" variant="body2">
                {t('auth.noAccount')}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage 