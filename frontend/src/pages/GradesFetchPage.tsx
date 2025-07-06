import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { Visibility, VisibilityOff, Download, Upload, School } from '@mui/icons-material'

const API_BASE_URL = 'http://localhost:3001/api'

interface Grade {
  code?: string
  course: string
  grade: number
  period?: string
  year?: string
  extractedAt?: string
}

const GradesFetchPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/sis/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Σφάλμα κατά τη σύνδεση')
      }

      if (data.success) {
        setSessionId(data.sessionId)
        setIsLoggedIn(true)
        setError(null)
      } else {
        throw new Error(data.error || 'Αποτυχία σύνδεσης')
      }
    } catch (err: any) {
      setError(err.message || 'Σφάλμα κατά τη σύνδεση')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchGrades = async () => {
    if (!sessionId) {
      setError('Πρέπει πρώτα να συνδεθείτε')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/sis/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Σφάλμα κατά την ανάκτηση βαθμών')
      }

      if (data.success && data.grades) {
        setGrades(data.grades)
        setError(null)
      } else {
        throw new Error(data.error || 'Δεν βρέθηκαν βαθμοί')
      }
    } catch (err: any) {
      setError(err.message || 'Σφάλμα κατά την ανάκτηση βαθμών')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setSessionId(null)
    setIsLoggedIn(false)
    setGrades([])
    setError(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const uploadedGrades = JSON.parse(content)
        
        if (Array.isArray(uploadedGrades)) {
          setGrades(uploadedGrades)
          setError(null)
        } else {
          setError('Μη έγκυρο αρχείο JSON')
        }
      } catch (error) {
        setError('Σφάλμα κατά την ανάγνωση του αρχείου')
      }
    }
    reader.readAsText(file)
  }

  const handleExportGrades = () => {
    if (grades.length === 0) {
      setError('Δεν υπάρχουν βαθμοί για εξαγωγή')
      return
    }

    const dataStr = JSON.stringify(grades, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = 'uth-grades.json'
    link.click()
  }

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0)
    return (sum / grades.length).toFixed(2)
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', mb: 4 }}>
          <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
            Λήψη Βαθμολογιών
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Server-side Proxy:</strong> Οι βαθμοί ανάγονται μέσω του server, 
              αποφεύγοντας τα CORS περιορισμούς του browser.
            </Typography>
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Σύνδεση στο SIS
              </Typography>
              
              {!isLoggedIn ? (
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Όνομα χρήστη φοιτητολογίου"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Κωδικός φοιτητολογίου"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                    {loading ? <CircularProgress size={24} /> : 'Σύνδεση'}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Συνδεδεμένος ως: {username}
                  </Alert>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleFetchGrades}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Λήψη Βαθμών'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    Αποσύνδεση
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Εισαγωγή από Αρχείο
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                sx={{ mb: 2 }}
              >
                Επιλογή JSON Αρχείου
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                Εναλλακτικά, μπορείτε να ανεβάσετε αρχείο JSON με βαθμούς 
                που έχετε εξάγει από το browser extension.
              </Typography>
            </Grid>
          </Grid>

          {grades.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Βρέθηκαν {grades.length} βαθμοί
                </Typography>
                <Box>
                  <Chip 
                    icon={<School />} 
                    label={`Μέσος όρος: ${calculateAverage()}`}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExportGrades}
                  >
                    Εξαγωγή JSON
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Μάθημα</TableCell>
                      <TableCell align="center">Βαθμός</TableCell>
                      <TableCell>Εξάμηνο</TableCell>
                      <TableCell>Έτος</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell>{grade.course}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={grade.grade} 
                            color={grade.grade >= 5 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{grade.period || '-'}</TableCell>
                        <TableCell>{grade.year || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

export default GradesFetchPage 