import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Stack, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material'
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
import ProfilePage from './pages/ProfilePage'
import CloseIcon from '@mui/icons-material/Close'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

const navLinks = [
  { to: '/', label: 'Αρχική' },
  { to: '/login', label: 'Είσοδος' },
  { to: '/register', label: 'Εγγραφή' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile-setup', label: 'Ρύθμιση προφίλ' },
  { to: '/grades', label: 'Βαθμοί' },
  { to: '/profile', label: 'Προφίλ SIS' },
]

function App({ toggleMode, mode }: { toggleMode: () => void; mode: 'light' | 'dark' }) {
  const { checkUser, user, signOut } = useAuthStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [checkUser])

  // Links ανάλογα με το αν είναι logged in
  const filteredLinks = user
    ? navLinks.filter(link => !['/login', '/register'].includes(link.to))
    : navLinks.filter(link => !['/dashboard', '/profile-setup'].includes(link.to))

  const handleLogout = async () => {
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
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 'bold' }}>
              <ListItemText primary="Αποσύνδεση" />
            </ListItemButton>
          </ListItem>
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
            {user && (
              <Button
                onClick={handleLogout}
                sx={{ color: 'error.main', fontWeight: 'bold', textTransform: 'none' }}
              >
                Αποσύνδεση
              </Button>
            )}
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
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Box>
  )
}

export default App 