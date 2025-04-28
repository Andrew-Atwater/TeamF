import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, PaletteOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth, db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface UserSettings {
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  currencySymbol: string;
  dateFormat: string;
  theme: string;
}

// Define theme palettes
const themePalettes: Record<string, PaletteOptions> = {
  default: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  modern: {
    primary: {
      main: '#2C3E50',
      light: '#34495E',
      dark: '#1A252F',
    },
    secondary: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2874A6',
    },
    error: {
      main: '#E74C3C',
      light: '#EC7063',
      dark: '#CB4335',
    },
    warning: {
      main: '#F39C12',
      light: '#F5B041',
      dark: '#D68910',
    },
    success: {
      main: '#27AE60',
      light: '#2ECC71',
      dark: '#229954',
    },
    info: {
      main: '#3498DB',
      light: '#5DADE2',
      dark: '#2874A6',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    divider: '#ECF0F1',
  },
  ocean: {
    primary: {
      main: '#006064',
      light: '#0097a7',
      dark: '#00363a',
    },
    secondary: {
      main: '#00acc1',
      light: '#26c6da',
      dark: '#007c91',
    },
    background: {
      default: '#e0f7fa',
      paper: '#ffffff',
    },
  },
  forest: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#ff6f00',
      light: '#ffa726',
      dark: '#e65100',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
  },
  sunset: {
    primary: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
    },
    secondary: {
      main: '#7b1fa2',
      light: '#9c27b0',
      dark: '#4a148c',
    },
    background: {
      default: '#fff3e0',
      paper: '#ffffff',
    },
  },
  royal: {
    primary: {
      main: '#512da8',
      light: '#673ab7',
      dark: '#311b92',
    },
    secondary: {
      main: '#c2185b',
      light: '#e91e63',
      dark: '#880e4f',
    },
    background: {
      default: '#ede7f6',
      paper: '#ffffff',
    },
  },
};

const defaultSettings: UserSettings = {
  darkMode: false,
  fontSize: 16,
  fontFamily: 'Roboto',
  currencySymbol: '$',
  dateFormat: 'MM/DD/YYYY',
  theme: 'default',
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (key: keyof UserSettings, value: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  availableThemes: string[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setIsLoading(true);
          setError(null);
          
          const userDoc = await getDoc(doc(db, 'userSettings', user.uid));
          
          if (userDoc.exists()) {
            setSettings({ ...defaultSettings, ...userDoc.data() as UserSettings });
          } else {
            await setDoc(doc(db, 'userSettings', user.uid), defaultSettings);
            setSettings(defaultSettings);
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
          setError('Failed to load settings. Please try again later.');
          setSettings(defaultSettings);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSettings(defaultSettings);
        setIsLoading(false);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (key: keyof UserSettings, value: any) => {
    if (!auth.currentUser) {
      setError('You must be logged in to update settings');
      return;
    }

    try {
      setError(null);
      const newSettings = { ...settings, [key]: value };
      
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), newSettings);
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
      setSettings(settings);
    }
  };

  const theme = createTheme({
    palette: {
      mode: settings.darkMode ? 'dark' : 'light',
      ...(themePalettes[settings.theme] || themePalettes.default),
      ...(settings.darkMode && {
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        }
      })
    },
    typography: {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
    },
  });

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      isLoading, 
      error,
      availableThemes: Object.keys(themePalettes),
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 