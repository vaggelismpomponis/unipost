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
  Chip
} from '@mui/material'
import { Visibility, VisibilityOff, Download, Upload } from '@mui/icons-material'

const SIS_URL = 'https://sis-web.uth.gr/'

interface Grade {
  course: string
  grade: number
  semester: string
  extractedAt?: string
}

const GradesFetchPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gradesHtml, setGradesHtml] = useState<string | null>(null)
  const [importedGrades, setImportedGrades] = useState<Grade[]>([])
  const [showExtensionInfo, setShowExtensionInfo] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleFetchGrades = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setGradesHtml(null)
    setLoading(true)

    try {
      // 1. Κάνε login στο φοιτητολόγιο (POST)
      const loginResponse = await fetch(SIS_URL + 'login.aspx', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      })

      if (!loginResponse.ok) {
        throw new Error('Αποτυχία login στο φοιτητολόγιο')
      }

      // 2. Fetch τη σελίδα βαθμολογιών (GET)
      const gradesResponse = await fetch(SIS_URL + 'student/grades.aspx', {
        credentials: 'include',
      })

      if (!gradesResponse.ok) {
        throw new Error('Αποτυχία λήψης βαθμολογιών')
      }

      const html = await gradesResponse.text()
      setGradesHtml(html)
    } catch (err: any) {
      setError(err.message || 'Σφάλμα κατά το fetch')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const grades: Grade[] = JSON.parse(content)
        
        if (Array.isArray(grades) && grades.length > 0) {
          setImportedGrades(grades)
          setError(null)
        } else {
          setError('Μη έγκυρο αρχείο JSON')
        }
      } catch (err) {
        setError('Σφάλμα κατά την ανάγνωση του αρχείου')
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const template = [
      {
        course: "Παράδειγμα Μαθήματος",
        grade: 8.5,
        semester: "1ο Εξάμηνο",
        extractedAt: new Date().toISOString()
      }
    ]
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grades-template.json'
    a.click()
    URL.revokeObjectURL(url)
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
              <strong>Εναλλακτική λύση:</strong> Χρησιμοποιήστε το browser extension για καλύτερη εξαγωγή βαθμών.
              <Button 
                size="small" 
                onClick={() => setShowExtensionInfo(!showExtensionInfo)}
                sx={{ ml: 1 }}
              >
                {showExtensionInfo ? 'Απόκρυψη' : 'Περισσότερα'}
              </Button>
            </Typography>
          </Alert>

          {showExtensionInfo && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Browser Extension:</strong>
                <br />
                1. Εγκαταστήστε το extension από το φάκελο <code>uth-sis-extension</code>
                <br />
                2. Ανοίξτε τη σελίδα του SIS και συνδεθείτε
                <br />
                3. Πλοηγηθείτε στη σελίδα των βαθμών
                <br />
                4. Κάντε κλικ στο extension και εξάγετε τους βαθμούς
                <br />
                5. Κατεβάστε το JSON αρχείο και ανεβάστε το εδώ
              </Typography>
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Απευθείας σύνδεση (CORS περιορισμοί)
              </Typography>
              <Box component="form" onSubmit={handleFetchGrades}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Όνομα χρήστη φοιτητολογίου"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
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
                  {loading ? <CircularProgress size={24} /> : 'Σύνδεση & Λήψη Βαθμών'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Εισαγωγή από extension
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  component="label"
                  fullWidth
                >
                  Επιλογή JSON αρχείου
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownloadTemplate}
                  fullWidth
                >
                  Κατέβασμα template
                </Button>
              </Box>
            </Grid>
          </Grid>

          {gradesHtml && (
            <Box mt={4}>
              <Typography variant="h6">Αποτελέσματα (HTML):</Typography>
              <pre style={{ maxHeight: 300, overflow: 'auto', background: '#eee', padding: 8 }}>
                {gradesHtml}
              </pre>
            </Box>
          )}
        </Paper>

        {importedGrades.length > 0 && (
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Εισηγμένοι βαθμοί ({importedGrades.length})
            </Typography>
            <Grid container spacing={2}>
              {importedGrades.map((grade, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {grade.course}
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {grade.grade}
                      </Typography>
                      <Chip 
                        label={grade.semester} 
                        size="small" 
                        color="secondary" 
                      />
                      {grade.extractedAt && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Εξήχθη: {new Date(grade.extractedAt).toLocaleDateString('el-GR')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default GradesFetchPage 