import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Slider,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { auth } from '../firebase-config';
import { updateProfile } from 'firebase/auth';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  const { settings, updateSettings, isLoading, error, availableThemes } = useSettings();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (auth.currentUser?.displayName) {
      setDisplayName(auth.currentUser.displayName);
    }
  }, []);

  if (!auth.currentUser) {
    navigate('/login');
    return null;
  }

  const handleFontSizeChange = async (_event: Event, newValue: number | number[]) => {
    try {
      await updateSettings('fontSize', newValue as number);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleSelectChange = async (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    try {
      await updateSettings(name as keyof typeof settings, value);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    try {
      await updateSettings(name as keyof typeof settings, checked);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      // Show success message or handle success
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Theme
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={handleSwitchChange}
                        name="darkMode"
                      />
                    }
                    label="Dark Mode"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Color Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      label="Color Theme"
                      name="theme"
                      onChange={handleSelectChange}
                    >
                      {availableThemes.map((theme) => (
                        <MenuItem key={theme} value={theme}>
                          {capitalizeFirstLetter(theme)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Typography
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Font Family</InputLabel>
                    <Select
                      value={settings.fontFamily}
                      label="Font Family"
                      name="fontFamily"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="Roboto">Roboto</MenuItem>
                      <MenuItem value="Arial">Arial</MenuItem>
                      <MenuItem value="Helvetica">Helvetica</MenuItem>
                      <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>Font Size: {settings.fontSize}px</Typography>
                  <Slider
                    value={settings.fontSize}
                    onChange={handleFontSizeChange}
                    min={12}
                    max={24}
                    step={1}
                    marks
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Formatting
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency Symbol</InputLabel>
                    <Select
                      value={settings.currencySymbol}
                      label="Currency Symbol"
                      name="currencySymbol"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="$">$ (USD)</MenuItem>
                      <MenuItem value="€">€ (EUR)</MenuItem>
                      <MenuItem value="£">£ (GBP)</MenuItem>
                      <MenuItem value="¥">¥ (JPY)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      name="dateFormat"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Update Profile
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSuccess(false)} severity="success">
            Settings saved successfully
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Settings; 