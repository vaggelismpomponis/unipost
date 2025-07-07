import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Stack, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Snackbar, Alert } from '@mui/material'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './components/ProfileSetup'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import GradesFetchPage from './pages/GradesFetchPage'
import SchoolIcon from '@mui/icons-material/School'
import MenuIcon from '@mui/icons-material/Menu'
import GradesPage from './pages/GradesPage'
import CloseIcon from '@mui/icons-material/Close'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountSettingsPage from './pages/AccountSettingsPage'
import { useProfile } from './hooks/useProfile'
import React, { createContext, useContext } from 'react'

const navLinks = [
  { to: '/', label: 'Αρχική' },
  { to: '/login', label: 'Είσοδος' },
  { to: '/register', label: 'Εγγραφή' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile-setup', label: 'Ρύθμιση προφίλ' },
  { to: '/grades', label: 'Βαθμοί' },
]

// --- Snackbar Context ---
const SnackbarContext = createContext<{
  showMessage: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void
}>({ showMessage: () => {} })

export function useSnackbar() {
  return useContext(SnackbarContext)
}

function SnackbarProviderCustom({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info')

  const showMessage = (msg: string, sev: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

function App({ toggleMode, mode }: { toggleMode: () => void; mode: 'light' | 'dark' }) {
  const { checkUser, user, signOut } = useAuthStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isProfileComplete, profile, loading: profileLoading } = useProfile()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  // Links ανάλογα με το αν είναι logged in
  const filteredLinks = user
    ? navLinks.filter(link => {
        if (["/login", "/register"].includes(link.to)) return false;
        if (link.to === "/profile-setup") {
          if (profileLoading) return false;
          if (isProfileComplete && typeof isProfileComplete === "function" && isProfileComplete()) return false;
        }
        return true;
      })
    : navLinks.filter(link => !["/dashboard", "/profile-setup"].includes(link.to));

  const handleLogout = async () => {
    if (profile && profile.username) {
      localStorage.removeItem(`grades-auto-fetched-${profile.username}`)
    }
    await signOut()
    window.location.href = '/'
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box sx={{ width: 250, position: 'relative', height: '100%' }} role="presentation">
      <IconButton onClick={handleDrawerToggle} sx={{ position: 'absolute', top: 8, right: 8 }}>
        <CloseIcon />
      </IconButton>
      <List sx={{ mt: 5 }}>
        {filteredLinks.map(link => (
          <ListItem key={link.to} disablePadding>
            <ListItemButton component={Link} to={link.to} selected={location.pathname === link.to}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/account" selected={location.pathname === '/account'}>
                <AccountCircleIcon sx={{ mr: 2 }} />
                <ListItemText primary="Λογαριασμός" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 'bold' }}>
                <ListItemText primary="Αποσύνδεση" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleMode}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            <ListItemText primary="Dark mode" sx={{ ml: 2 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <SnackbarProviderCustom>
      <Box sx={{ minHeight: '100vh' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              UniPost
            </Typography>
            {/* Mobile menu icon */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Box>
            {/* Desktop links */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {filteredLinks.map(link => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  color={location.pathname === link.to ? 'primary' : 'inherit'}
                  variant={location.pathname === link.to ? 'contained' : 'text'}
                  sx={{ textTransform: 'none' }}
                >
                  {link.label}
                </Button>
              ))}
              {user && <>
                <IconButton
                  component={Link}
                  to="/account"
                  color={location.pathname === '/account' ? 'primary' : 'inherit'}
                  sx={{ ml: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Button
                  onClick={handleLogout}
                  sx={{ color: 'error.main', fontWeight: 'bold', textTransform: 'none' }}
                >
                  Αποσύνδεση
                </Button>
              </>}
              <Button sx={{ ml: 1, minWidth: 0 }} color="inherit" onClick={toggleMode}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawer}
        </Drawer>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile-setup" 
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            } 
          />
          <Route path="/grades-fetch" element={<GradesFetchPage onFetch={(grades, history) => {
            // Handle the fetch result here if needed
            console.log('Grades fetched:', grades, history)
          }} />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />
        </Routes>
      </Box>
    </SnackbarProviderCustom>
  )
}

export default App 