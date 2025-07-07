import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  ListItemText,
  Skeleton,
  Container
} from '@mui/material'
import { Visibility, VisibilityOff, School } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { API_BASE_URL } from '../utils/apiConfig'
import { useProfile } from '../hooks/useProfile'
import CryptoJS from 'crypto-js'
import { useSnackbar } from '../App'

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
  formId?: string
  autoFetch?: boolean
}

export const GradeFetchForm: React.FC<GradeFetchFormProps> = ({ onFetch, defaultUsername = '', defaultPassword = '', formId, autoFetch }) => {
  const [username, setUsername] = useState(defaultUsername)
  const [password, setPassword] = useState(defaultPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showMessage } = useSnackbar()

  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleFetchGrades = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sis/playwright-grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Σφάλμα κατά τη λήψη βαθμών')
      }
      if (data.success && data.grades) {
        // fetch history
        const historyRes = await fetch(`${API_BASE_URL}/sis/grades-history?username=${encodeURIComponent(username)}`)
        const historyData = await historyRes.json()
        onFetch(data.grades, historyData.history || [])
      } else {
        throw new Error(data.error || 'Δεν βρέθηκαν βαθμοί')
      }
    } catch (err: any) {
      const msg = err.message || ''
      if (
        msg.includes('ERR_CONNECTION_TIMED_OUT') ||
        msg.toLowerCase().includes('timed out') ||
        msg.toLowerCase().includes('econnrefused') ||
        msg.toLowerCase().includes('network')
      ) {
        showMessage('Δεν ήταν δυνατή η σύνδεση με το σύστημα βαθμολογίας. Βεβαιώσου ότι είσαι συνδεδεμένος στο VPN του πανεπιστημίου.', 'error')
      } else {
        showMessage(msg || 'Σφάλμα κατά τη λήψη βαθμών', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const localKey = `grades-auto-fetched-${username}`;
    const alreadyFetched = localStorage.getItem(localKey) === '1';
    if (autoFetch && username && password && !alreadyFetched) {
      const fetchGrades = async () => {
        const form = document.getElementById(formId || 'auto-fetch-form') as HTMLFormElement | null
        if (form) {
          form.requestSubmit();
          localStorage.setItem(localKey, '1');
        }
      }
      fetchGrades();
    }
  }, [autoFetch, username, password, formId]);

  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
        Λήψη Βαθμολογιών
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Server-side Automation:</strong> Οι βαθμοί ανακτώνται αυτόματα μέσω Playwright backend flow.
        </Typography>
      </Alert>
      <form onSubmit={handleFetchGrades} id={formId || 'auto-fetch-form'}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={<School />}
            >
              {loading ? <Skeleton variant="circular" width={24} height={24} /> : 'Λήψη Βαθμών'}
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
  return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

export const SemesterGradesTable: React.FC<{
  grades: Grade[],
  profile: any,
  filtersOpen?: boolean,
  setFiltersOpen?: (open: boolean) => void
}> = ({ grades, profile, filtersOpen, setFiltersOpen }) => {
  const grouped = groupGradesBySemester(grades)
  const semesterOrder = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b))
  const allGrades = Object.values(grouped).flat()
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
      if (profile?.username && g.code) {
        const prefs = getGradePrefs(profile.username, g.code);
        if (prefs.hideFromGrades) return false;
      }
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

  // Νέος υπολογισμός μέσου όρου/ECTS/προόδου με βάση τα prefs
  function getIncludedGrades(grades: Grade[]) {
    if (!profile?.username) return grades;
    return grades.filter(g => {
      if (!g.code) return true;
      const prefs = getGradePrefs(profile.username, g.code);
      return !prefs.excludeFromAverage && !prefs.hideFromGrades;
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
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="semester-label" sx={{ color: 'text.primary' }}>Εξάμηνο</InputLabel>
            <Select
              labelId="semester-label"
              label="Εξάμηνο"
              multiple
              value={filterSemester}
              onChange={e => setFilterSemester(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              renderValue={selected => selected.map(s => ['1','2','3','4','5','6','7','8'].includes(s) ? `${s}ο` : 'Χ/Ε').join(', ')}
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
            >
              {allSemesters.map(sem => (
                <MenuItem key={sem} value={sem}>
                  <Checkbox checked={filterSemester.indexOf(sem) > -1} />
                  <ListItemText primary={['1','2','3','4','5','6','7','8'].includes(sem) ? `${sem}ο εξάμηνο` : 'Χ/Ε'} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="status-label" sx={{ color: 'text.primary' }}>Κατάσταση</InputLabel>
            <Select
              labelId="status-label"
              label="Κατάσταση"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
            >
              <MenuItem value="all">Όλα</MenuItem>
              <MenuItem value="passed">Περασμένα</MenuItem>
              <MenuItem value="failed">Κομμένα</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="type-label" sx={{ color: 'text.primary' }}>Τύπος</InputLabel>
            <Select
              labelId="type-label"
              label="Τύπος"
              multiple
              value={filterType}
              onChange={e => setFilterType(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              renderValue={selected => selected.join(', ')}
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
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
      {semesterOrder.map(sem => (
        <Paper key={sem} sx={{ mb: 4, position: 'relative', p: 3, pt: 3.5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{['1','2','3','4','5','6','7','8'].includes(sem) ? `${sem}ο εξάμηνο` : 'Χ/Ε (Χωρίς Εξάμηνο)'}</Typography>
          {/* Μέσος όρος πάνω δεξιά */}
          <Typography variant="subtitle2" sx={{ position: 'absolute', top: 16, right: 24, color: 'grey.500', fontWeight: 500 }}>
            Μ.Ο.: {calcAverage(getIncludedGrades(filterGrades(grouped[sem]))) ?? '-'}
          </Typography>
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
                  <Paper key={i} variant="outlined" sx={{ backgroundColor: 'background.paper', color: 'text.primary', boxShadow: 1, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 }, p: 2.5 }}>
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
                  </Paper>
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
                      <TableRow key={i} sx={{ backgroundColor: 'background.paper', color: 'text.primary', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
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
        </Paper>
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

// Νέο page-level component
const ENCRYPTION_KEY = 'unipost-demo-key'

const GradesFetchPage: React.FC<{ onFetch: (grades: Grade[], history: any[]) => void }> = ({ onFetch }) => {
  const { profile, loading, error } = useProfile()
  const isMobile = useMediaQuery('(max-width:930px)');

  // Decrypt credentials
  const username = profile?.username || ''
  const sis_password = profile?.sis_password
    ? CryptoJS.AES.decrypt(profile.sis_password, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
    : ''

  // Auto-fetch μόλις φορτώσει το προφίλ και υπάρχουν credentials
  useEffect(() => {
    if (username && sis_password) {
      const fetchGrades = async () => {
        // Δημιουργούμε ένα fake event για το handleFetchGrades
        const form = document.getElementById('auto-fetch-form') as HTMLFormElement | null
        if (form) {
          form.requestSubmit()
        }
      }
      fetchGrades()
    }
  }, [username, sis_password])

  if (loading) return (
    <Container maxWidth="sm" sx={{ mt: 6, bgcolor: 'background.default', color: 'text.primary' }}>
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3, borderRadius: 2 }} />
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
      {isMobile ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, idx) => (
            <Box key={idx} sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', px: 2, py: 1, bgcolor: 'grey.100' }}>
            {["Κωδικός", "Μάθημα", "Βαθμός", "Εξ. περίοδος", "Ακ. Έτος", "ECTS", "Τύπος"].map((_, i) => (
              <Skeleton key={i} variant="text" width={i === 1 ? 180 : 80} height={28} sx={{ mx: 1 }} />
            ))}
          </Box>
          {[...Array(4)].map((_, idx) => (
            <Box key={idx} sx={{ display: 'flex', px: 2, py: 1 }}>
              {[...Array(7)].map((__, j) => (
                <Skeleton key={j} variant="text" width={j === 1 ? 180 : 80} height={24} sx={{ mx: 1 }} />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
  if (error) return <Alert severity="error">{error}</Alert>
  if (!username || !sis_password) return <Alert severity="warning">Δεν υπάρχουν αποθηκευμένα SIS credentials στο προφίλ.</Alert>

  return (
    <Box>
      <GradeFetchForm
        onFetch={onFetch}
        defaultUsername={username}
        defaultPassword={sis_password}
        formId="auto-fetch-form"
        autoFetch
      />
      <SemesterGradesTable
        grades={[]}
        profile={profile}
        filtersOpen={false}
        setFiltersOpen={() => {}}
      />
    </Box>
  )
}

// Helpers για localStorage
function getGradePrefs(username: string, code: string) {
  const key = `gradePrefs_${username}_${code}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return {};
}

export default GradesFetchPage 