import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth, db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserSettings {
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  currencySymbol: string;
  dateFormat: string;
  notifications: boolean;
}

const defaultSettings: UserSettings = {
  darkMode: false,
  fontSize: 16,
  fontFamily: 'Roboto',
  currencySymbol: '$',
  dateFormat: 'MM/DD/YYYY',
  notifications: true,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (key: keyof UserSettings, value: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'userSettings', auth.currentUser.uid));
        if (userDoc.exists()) {
          setSettings(userDoc.data() as UserSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (key: keyof UserSettings, value: any) => {
    if (!auth.currentUser) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const theme = createTheme({
    palette: {
      mode: settings.darkMode ? 'dark' : 'light',
    },
    typography: {
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
    },
  });

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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