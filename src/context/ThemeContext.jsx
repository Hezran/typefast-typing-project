import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    dark: {
        name: 'Dark',
        '--bg-primary': '#0f172a',
        '--bg-secondary': '#1e293b',
        '--bg-tertiary': '#334155',
        '--text-primary': '#f8fafc',
        '--text-secondary': '#cbd5e1',
        '--text-muted': '#94a3b8',
        '--text-dim': '#64748b',
        '--text-dimmer': '#475569',
        '--accent': '#38bdf8',
        '--accent-bg': 'rgba(56, 189, 248, 0.1)',
        '--caret': '#e2b714',
        '--correct': '#cbd5e1',
        '--incorrect': '#ef4444',
        '--correct-accent': '#4ade80',
        '--border': '#334155',
        '--chart-line': '#38bdf8',
        '--chart-grid': '#334155',
    },
    midnight: {
        name: 'Midnight',
        '--bg-primary': '#0a0a1a',
        '--bg-secondary': '#12122a',
        '--bg-tertiary': '#1e1e3a',
        '--text-primary': '#e8e8f0',
        '--text-secondary': '#b0b0d0',
        '--text-muted': '#7070a0',
        '--text-dim': '#505080',
        '--text-dimmer': '#3a3a60',
        '--accent': '#8b5cf6',
        '--accent-bg': 'rgba(139, 92, 246, 0.1)',
        '--caret': '#c084fc',
        '--correct': '#b0b0d0',
        '--incorrect': '#f87171',
        '--correct-accent': '#a78bfa',
        '--border': '#2a2a4a',
        '--chart-line': '#8b5cf6',
        '--chart-grid': '#2a2a4a',
    },
    ocean: {
        name: 'Ocean',
        '--bg-primary': '#0c1929',
        '--bg-secondary': '#132f4c',
        '--bg-tertiary': '#1a3d5c',
        '--text-primary': '#f0f8ff',
        '--text-secondary': '#b8d4e8',
        '--text-muted': '#6b9cc0',
        '--text-dim': '#4a7a9c',
        '--text-dimmer': '#3a6080',
        '--accent': '#00d4aa',
        '--accent-bg': 'rgba(0, 212, 170, 0.1)',
        '--caret': '#00d4aa',
        '--correct': '#b8d4e8',
        '--incorrect': '#ff6b6b',
        '--correct-accent': '#00d4aa',
        '--border': '#1e4a6e',
        '--chart-line': '#00d4aa',
        '--chart-grid': '#1e4a6e',
    },
    rose: {
        name: 'Rosé',
        '--bg-primary': '#1a0a14',
        '--bg-secondary': '#2d1525',
        '--bg-tertiary': '#3d2035',
        '--text-primary': '#fce4ec',
        '--text-secondary': '#d4a0b0',
        '--text-muted': '#a06080',
        '--text-dim': '#804060',
        '--text-dimmer': '#603048',
        '--accent': '#f472b6',
        '--accent-bg': 'rgba(244, 114, 182, 0.1)',
        '--caret': '#fb923c',
        '--correct': '#d4a0b0',
        '--incorrect': '#ef4444',
        '--correct-accent': '#f472b6',
        '--border': '#4a2838',
        '--chart-line': '#f472b6',
        '--chart-grid': '#4a2838',
    },
    light: {
        name: 'Light',
        '--bg-primary': '#f1f5f9',
        '--bg-secondary': '#ffffff',
        '--bg-tertiary': '#e2e8f0',
        '--text-primary': '#0f172a',
        '--text-secondary': '#334155',
        '--text-muted': '#64748b',
        '--text-dim': '#94a3b8',
        '--text-dimmer': '#cbd5e1',
        '--accent': '#2563eb',
        '--accent-bg': 'rgba(37, 99, 235, 0.1)',
        '--caret': '#d97706',
        '--correct': '#334155',
        '--incorrect': '#dc2626',
        '--correct-accent': '#16a34a',
        '--border': '#e2e8f0',
        '--chart-line': '#2563eb',
        '--chart-grid': '#e2e8f0',
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState(() => {
        return localStorage.getItem('typefast-theme') || 'dark';
    });

    useEffect(() => {
        const theme = themes[themeName] || themes.dark;
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            if (key.startsWith('--')) {
                root.style.setProperty(key, value);
            }
        });
        localStorage.setItem('typefast-theme', themeName);
    }, [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
