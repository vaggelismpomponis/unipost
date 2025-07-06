import React, { useState } from 'react'
import { Container, Typography, Box, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useProfile } from '../hooks/useProfile'
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'unipost-demo-key'

const ProfilePage: React.FC = () => {
  const { profile, loading, error, updateProfile } = useProfile()
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    sis_password: profile?.sis_password ? CryptoJS.AES.decrypt(profile.sis_password, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) : '',
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    setSubmitting(true)
    const encryptedPassword = formData.sis_password
      ? CryptoJS.AES.encrypt(formData.sis_password, ENCRYPTION_KEY).toString()
      : ''
    const result = await updateProfile({
      username: formData.username,
      sis_password: encryptedPassword,
    })
    setSubmitting(false)
    if (result?.error) {
      setFormError(result.error)
    } else {
      setSuccess('Τα στοιχεία αποθηκεύτηκαν!')
    }
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Προφίλ SIS</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="SIS Username"
          name="username"
          value={formData.username}
          onChange={handleChange('username')}
          helperText="Το username που χρησιμοποιείς στο sis-web.uth.gr"
        />
        <TextField
          margin="normal"
          fullWidth
          id="sis_password"
          label="SIS Password (προαιρετικό)"
          name="sis_password"
          type="password"
          value={formData.sis_password}
          onChange={handleChange('sis_password')}
          helperText="Αν θέλεις να αποθηκεύεται προσωρινά για αυτόματη λήψη βαθμών."
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={submitting}>
          Αποθήκευση
        </Button>
      </Box>
    </Container>
  )
}

export default ProfilePage 