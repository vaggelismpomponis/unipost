import { Container, Typography, Paper, Box, Divider, Button, TextField, Switch, FormControlLabel, Alert, Skeleton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import CryptoJS from 'crypto-js';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ENCRYPTION_KEY = 'unipost-demo-key';

const AccountSettingsPage: React.FC = () => {
  const { profile, loading, error, updateProfile, fetchProfile } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Dark mode placeholder (δεν αποθηκεύεται στο profile προς το παρόν)
  const [darkMode, setDarkMode] = useState(false);
  // SIS credentials
  const [sisUsername, setSisUsername] = useState('');
  const [sisPassword, setSisPassword] = useState('');
  const [showSisPassword, setShowSisPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setSisUsername(profile.username || '');
      setSisPassword(profile.sis_password ? CryptoJS.AES.decrypt(profile.sis_password, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) : '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccess(null);
    // Encrypt password
    const encryptedPassword = sisPassword ? CryptoJS.AES.encrypt(sisPassword, ENCRYPTION_KEY).toString() : '';
    const result = await updateProfile({
      first_name: firstName, last_name: lastName,
      username: sisUsername,
      sis_password: encryptedPassword,
    });
    setSaving(false);
    if (!result?.error) {
      setSuccess('Τα στοιχεία αποθηκεύτηκαν!');
      fetchProfile();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Ρυθμίσεις προφίλ</Typography>
        <Divider sx={{ my: 2 }} />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {loading ? <Skeleton variant="rectangular" width="100%" height={40} /> : <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Στοιχεία προφίλ</Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1"><strong>Όνομα:</strong> {profile?.first_name || '-'}</Typography>
            <Typography variant="body1"><strong>Επώνυμο:</strong> {profile?.last_name || '-'}</Typography>
            <Typography variant="body1"><strong>Πανεπιστήμιο:</strong> {profile?.university || '-'}</Typography>
            <Typography variant="body1"><strong>Τμήμα:</strong> {profile?.department || '-'}</Typography>
            <Typography variant="body1"><strong>Εξάμηνο:</strong> {profile?.semester ? `${profile.semester}ο` : '-'}</Typography>
            <Typography variant="body1"><strong>SIS Username:</strong> {profile?.username || '-'}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Προσωπικά στοιχεία</Typography>
          <TextField label="Όνομα" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Επώνυμο" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth sx={{ mb: 2 }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Στοιχεία SIS</Typography>
          <TextField label="SIS Username" value={sisUsername} onChange={e => setSisUsername(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField
            label="SIS Password (προαιρετικό)"
            value={sisPassword}
            onChange={e => setSisPassword(e.target.value)}
            type={showSisPassword ? 'text' : 'password'}
            fullWidth
            sx={{ mb: 2 }}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Εναλλαγή ορατότητας κωδικού"
                    onClick={() => setShowSisPassword((show) => !show)}
                    edge="end"
                  >
                    {showSisPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Button variant="contained" color="primary" onClick={handleSaveProfile} disabled={saving}>Αποθήκευση</Button>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6" gutterBottom>Εμφάνιση</Typography>
          <FormControlLabel control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />} label="Dark mode" />
        </Box>
        </>}
      </Paper>
    </Container>
  );
};

export default AccountSettingsPage; 