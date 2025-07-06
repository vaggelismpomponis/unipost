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
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Chip,
  Stack,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material'
import { Visibility, VisibilityOff, School, Star } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { API_BASE_URL } from '../utils/apiConfig'

export interface Grade {
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

export interface GradeFetchFormProps {
  onFetch: (grades: Grade[], history: any[]) => void
  defaultUsername?: string
  defaultPassword?: string
}

export const GradeFetchForm: React.FC<GradeFetchFormProps> = ({ onFetch, defaultUsername = '', defaultPassword = '' }) => {
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

export const SemesterGradesTable: React.FC<{
  grades: Grade[],
  filtersOpen?: boolean,
  setFiltersOpen?: (open: boolean) => void
}> = ({ grades, filtersOpen, setFiltersOpen }) => {
  const grouped = groupGradesBySemester(grades)
  const semesterOrder = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b))
  const allGrades = Object.values(grouped).flat()
  const overallAverage = calcAverage(allGrades)
  const isMobile = useMediaQuery('(max-width:930px)');

  // Φίλτρα
  const drawerOpen = typeof filtersOpen === 'boolean' ? filtersOpen : useState(false)[0];
  const setDrawerOpen = typeof setFiltersOpen === 'function' ? setFiltersOpen : useState(false)[1];
  const [filterSemester, setFilterSemester] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [filterType, setFilterType] = useState<string[]>([]);
  const allSemesters = semesterOrder;
  const allTypes = Array.from(new Set(allGrades.map(g => g.type).filter(Boolean)));
  function filterGrades(grades: Grade[]) {
    return grades.filter(g => {
      if (filterSemester.length > 0) {
        const sem = getSemesterFromCode(g.code)?.toString() || 'Χ/Ε';
        if (!filterSemester.includes(sem)) return false;
      }
      let gradeNum = typeof g.grade === 'string' ? parseFloat((g.grade as string).replace(',', '.')) : g.grade;
      if (filterStatus === 'passed' && !(gradeNum >= 5)) return false;
      if (filterStatus === 'failed' && !(gradeNum < 5)) return false;
      if (filterType.length > 0 && (!g.type || !filterType.includes(g.type))) return false;
      return true;
    });
  }

  return (
    <Box>
      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: 3, minHeight: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }} role="presentation">
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Φίλτρα</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Εξάμηνο</InputLabel>
            <Select
              multiple
              value={filterSemester}
              onChange={e => setFilterSemester(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              renderValue={selected => selected.map(s => ['1','2','3','4','5','6','7','8'].includes(s) ? `${s}ο` : 'Χ/Ε').join(', ')}
            >
              {allSemesters.map(sem => (
                <MenuItem key={sem} value={sem}>
                  <Checkbox checked={filterSemester.indexOf(sem) > -1} />
                  <ListItemText primary={['1','2','3','4','5','6','7','8'].includes(sem) ? `${sem}ο εξάμηνο` : 'Χ/Ε'} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Κατάσταση</InputLabel>
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <MenuItem value="all">Όλα</MenuItem>
              <MenuItem value="passed">Περασμένα</MenuItem>
              <MenuItem value="failed">Κομμένα</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Τύπος</InputLabel>
            <Select
              multiple
              value={filterType}
              onChange={e => setFilterType(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              renderValue={selected => selected.join(', ')}
            >
              {allTypes.map(type => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={filterType.indexOf(type || '') > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setDrawerOpen(false)}>Εφαρμογή</Button>
        </Box>
      </Drawer>
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
            {isMobile ? (
              <Stack spacing={2}>
                {filterGrades(grouped[sem]).map((g, i) => {
                  let gradeNum = typeof g.grade === 'string' ? parseFloat((g.grade as string).replace(',', '.')) : g.grade;
                  let color: string = '';
                  if (g.grade === '-' || g.grade === undefined || g.grade === null || g.grade === '') {
                    color = 'grey.600';
                  } else if (!isNaN(gradeNum)) {
                    if (gradeNum >= 5) color = 'success.dark';
                    else if (gradeNum < 5) color = 'error.main';
                  }
                  return (
                    <Card key={i} variant="outlined" sx={{ backgroundColor: 'grey.100', boxShadow: 1 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>{g.code}</Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>{g.name || g.course}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body1" sx={{ color, fontWeight: 'bold', fontSize: 20 }}>{typeof g.grade === 'string' ? g.grade.replace(',', '.') : g.grade}</Typography>
                            <Chip label="Βαθμός" size="small" sx={{ bgcolor: color, color: 'white', fontWeight: 'bold' }} />
                          </Stack>
                        </Stack>
                        <Typography variant="body2">Εξ. περίοδος: {g.period || g.date}</Typography>
                        <Typography variant="body2">Ακ. Έτος: {g.year || g.semester}</Typography>
                        <Typography variant="body2">ECTS: {g.ects}</Typography>
                        <Typography variant="body2">Τύπος: {g.type}</Typography>
                      </CardContent>
                    </Card>
                  )
                })}
              </Stack>
            ) : (
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
                    {filterGrades(grouped[sem]).map((g, i) => {
                      let gradeNum = typeof g.grade === 'string' ? parseFloat((g.grade as string).replace(',', '.')) : g.grade;
                      let color: string = '';
                      if (g.grade === '-' || g.grade === undefined || g.grade === null || g.grade === '') {
                        color = 'grey.600';
                      } else if (!isNaN(gradeNum)) {
                        if (gradeNum >= 5) color = 'success.dark';
                        else if (gradeNum < 5) color = 'error.main';
                      }
                      return (
                        <TableRow key={i} sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell>{g.code}</TableCell>
                          <TableCell sx={{ color }}>{g.name || g.course}</TableCell>
                          <TableCell sx={{ color, fontWeight: 'bold' }}>{typeof g.grade === 'string' ? g.grade.replace(',', '.') : g.grade}</TableCell>
                          <TableCell>{g.period || g.date}</TableCell>
                          <TableCell>{g.year || g.semester}</TableCell>
                          <TableCell>{g.ects}</TableCell>
                          <TableCell>{g.type}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="primary">
              Μέσος όρος εξαμήνου: {calcAverage(filterGrades(grouped[sem])) ?? '-'}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

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

export default GradeFetchForm 