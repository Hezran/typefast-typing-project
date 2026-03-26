import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
    const { themeName, setThemeName, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="theme-selector" ref={dropdownRef}>
            <button
                className="theme-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Change theme"
            >
                🎨
            </button>
            {isOpen && (
                <div className="theme-dropdown">
                    {Object.entries(themes).map(([key, theme]) => (
                        <button
                            key={key}
                            className={`theme-option ${themeName === key ? 'active' : ''}`}
                            onClick={() => {
                                setThemeName(key);
                                setIsOpen(false);
                            }}
                        >
                            <span
                                className="theme-swatch"
                                style={{
                                    background: theme['--bg-primary'],
                                    borderColor: theme['--accent'],
                                }}
                            ></span>
                            {theme.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
