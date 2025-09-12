/**
 * Theme context and provider for managing light/dark/system themes across the app.
 * Provides current theme, effective theme, and a setter function.
 *
 * @module ThemeContext
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Theme options supported by the application.
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * The shape of the ThemeContext value.
 * @property {Theme} theme - The user's selected theme ('light', 'dark', or 'system').
 * @property {'light' | 'dark'} effectiveTheme - The theme currently applied to the UI.
 * @property {(theme: Theme) => void} setTheme - Function to update the theme.
 */
interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

/**
 * React context for theme management. Use via ThemeProvider and useTheme hook.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook to access the theme context.
 * Throws if used outside a ThemeProvider.
 * @returns {ThemeContextType} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Props for ThemeProvider component.
 * @property {ReactNode} children - Child components to receive theme context.
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component to wrap the app and provide theme context.
 * Handles theme persistence, system theme detection, and DOM updates.
 * @param {ThemeProviderProps} props
 * @returns {JSX.Element}
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
      } else {
        setEffectiveTheme(theme);
      }
    };

    updateEffectiveTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateEffectiveTheme);
      return () => mediaQuery.removeEventListener('change', updateEffectiveTheme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  /**
   * Update the theme and persist to localStorage.
   * @param {Theme} newTheme - The new theme to set.
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};