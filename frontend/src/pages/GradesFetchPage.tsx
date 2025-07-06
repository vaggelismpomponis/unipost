import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import { Visibility, VisibilityOff, School, Star } from '@mui/icons-material'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const API_BASE_URL = 'http://localhost:3001/api'

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

interface GradeFetchFormProps {
  onFetch: (grades: Grade[], history: any[]) => void
  defaultUsername?: string
  defaultPassword?: string
}

const GradeFetchForm: React.FC<GradeFetchFormProps> = ({ onFetch, defaultUsername = '', defaultPassword = '' }) => {
  const [username, setUsername] = useState(defaultUsername)
  const [password, setPassword] = useState(defaultPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gradesUrl, setGradesUrl] = useState('https://sis-web.uth.gr/student/grades/list_diploma?p=')
  const [success, setSuccess] = useState<string | null>(null)

  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleFetchGrades = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sis/playwright-grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, gradesUrl }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Σφάλμα κατά τη λήψη βαθμών')
      }
      if (data.success && data.grades) {
        setSuccess('Η λήψη βαθμών ολοκληρώθηκε!')
        setError(null)
        // fetch history
        const historyRes = await fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
        const historyData = await historyRes.json()
        onFetch(data.grades, historyData.history || [])
      } else {
        throw new Error(data.error || 'Δεν βρέθηκαν βαθμοί')
      }
    } catch (err: any) {
      setError(err.message || 'Σφάλμα κατά τη λήψη βαθμών')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
      <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
        Λήψη Βαθμολογιών
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Server-side Automation:</strong> Οι βαθμοί ανακτώνται αυτόματα μέσω Playwright backend flow.
        </Typography>
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleFetchGrades}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Όνομα χρήστη"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              required
              autoComplete="username"
              disabled={!!defaultUsername}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Κωδικός πρόσβασης"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Εναλλαγή ορατότητας κωδικού"
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
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Grades URL"
              value={gradesUrl}
              onChange={e => setGradesUrl(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={<School />}
            >
              {loading ? <CircularProgress size={24} /> : 'Λήψη Βαθμών'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export const GradesTable: React.FC<{ grades: Grade[] }> = ({ grades }) => (
  <TableContainer component={MuiPaper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Κωδικός</TableCell>
          <TableCell>Μάθημα</TableCell>
          <TableCell>Βαθμός</TableCell>
          <TableCell>Εξ. περίοδος</TableCell>
          <TableCell>Ακ. Έτος</TableCell>
          <TableCell>ECTS</TableCell>
          <TableCell>Τύπος</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {grades.map((g, i) => (
          <TableRow key={i}>
            <TableCell>{g.code}</TableCell>
            <TableCell>{g.name || g.course}</TableCell>
            <TableCell>{g.grade}</TableCell>
            <TableCell>{g.period || g.date}</TableCell>
            <TableCell>{g.year || g.semester}</TableCell>
            <TableCell>{g.ects}</TableCell>
            <TableCell>{g.type}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export const GradesAverageChart: React.FC<{ averageHistory: { date: string, average: number }[] }> = ({ averageHistory }) => (
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={averageHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" fontSize={12} angle={-20} height={60} interval={0} tick={{ dx: -10, dy: 10 }} />
      <YAxis domain={[0, 10]} />
      <Tooltip formatter={(value) => value + ' / 10'} />
      <Line type="monotone" dataKey="average" stroke="#1976d2" strokeWidth={2} dot />
    </LineChart>
  </ResponsiveContainer>
)

function getSemesterFromCode(code?: string) {
  if (!code || code.length < 2) return null
  const match = code.match(/^[ΥΕ](\d)/)
  return match ? parseInt(match[1]) : null
}

function groupGradesBySemester(grades: Grade[]) {
  const grouped: { [semester: string]: Grade[] } = {}
  grades.forEach(g => {
    const sem = getSemesterFromCode(g.code)
    if (sem) {
      if (!grouped[sem]) grouped[sem] = []
      grouped[sem].push(g)
    }
  })
  return grouped
}

function calcAverage(grades: Grade[]) {
  const valid = grades
    .map(g => typeof g.grade === 'string' ? parseFloat((g.grade as string).replace(',', '.')) : g.grade)
    .filter(g => !isNaN(g as number)) as number[]
  if (!valid.length) return null
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)
}

export const SemesterGradesTable: React.FC<{ grades: Grade[] }> = ({ grades }) => {
  const grouped = groupGradesBySemester(grades)
  const semesterOrder = Object.keys(grouped).sort((a, b) => {
    if (a === 'Λοιπά') return 1
    if (b === 'Λοιπά') return -1
    return parseInt(a) - parseInt(b)
  })

  // Υπολογισμός συνολικού μέσου όρου
  const allGrades = Object.values(grouped).flat()
  const overallAverage = calcAverage(allGrades)

  return (
    <Box>
      <Card sx={{ mb: 4, maxWidth: 400, mx: 'auto', background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', color: 'white', boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          <Star sx={{ fontSize: 48, mb: 1, color: 'gold' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {overallAverage ?? '-'}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Συνολικός μέσος όρος
          </Typography>
        </CardContent>
      </Card>
      {semesterOrder.map(sem => (
        <Card key={sem} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>{['1','2','3','4','5','6','7','8'].includes(sem) ? `${sem}ο εξάμηνο` : 'Χ/Ε (Χωρίς Εξάμηνο)'}</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Κωδικός</TableCell>
                    <TableCell>Μάθημα</TableCell>
                    <TableCell>Βαθμός</TableCell>
                    <TableCell>Εξ. περίοδος</TableCell>
                    <TableCell>Ακ. Έτος</TableCell>
                    <TableCell>ECTS</TableCell>
                    <TableCell>Τύπος</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grouped[sem].map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>{g.code}</TableCell>
                      <TableCell>{g.name || g.course}</TableCell>
                      <TableCell>{g.grade}</TableCell>
                      <TableCell>{g.period || g.date}</TableCell>
                      <TableCell>{g.year || g.semester}</TableCell>
                      <TableCell>{g.ects}</TableCell>
                      <TableCell>{g.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary">
              Μέσος όρος εξαμήνου: {calcAverage(grouped[sem]) ?? '-'}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default GradeFetchForm 