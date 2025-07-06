import { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './i18n/config.ts'

const getInitialMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('themeMode')
    if (saved === 'dark' || saved === 'light') return saved
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }
  return 'light'
}

const Root = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode())

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // UniPost blue
      },
      secondary: {
        main: '#ff9800', // Orange accent
      },
      background: {
        default: mode === 'dark' ? '#181a1b' : '#f7f8fa',
        paper: mode === 'dark' ? '#23272f' : '#fff',
      },
      error: {
        main: '#d32f2f',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
    },
  }), [mode])

  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', next)
      return next
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App toggleMode={toggleMode} mode={mode} />
      </BrowserRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />) 