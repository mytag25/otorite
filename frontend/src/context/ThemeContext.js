import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8001`;
const API_BASE = `${BACKEND_URL}/api`;

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Mobil için hızlı açılış - LocalStorage'dan hemen oku
    const [isChristmasEnabled, setIsChristmasEnabled] = useState(() => {
        const cached = localStorage.getItem('christmas_enabled');
        return cached === 'true';
    });
    const [loading, setLoading] = useState(true);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_BASE}/settings`);
                setIsChristmasEnabled(response.data.christmas_enabled);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                // Try localStorage as fallback
                const cached = localStorage.getItem('christmas_enabled');
                if (cached !== null) {
                    setIsChristmasEnabled(cached === 'true');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Apply/remove christmas mode class to body
    useEffect(() => {
        if (isChristmasEnabled) {
            document.body.classList.add('christmas-mode');
        } else {
            document.body.classList.remove('christmas-mode');
        }
        // Cache in localStorage
        localStorage.setItem('christmas_enabled', isChristmasEnabled.toString());
    }, [isChristmasEnabled]);

    const toggleChristmas = async () => {
        try {
            const response = await axios.post(`${API_BASE}/settings/toggle-christmas`);
            setIsChristmasEnabled(response.data.christmas_enabled);
        } catch (error) {
            console.error('Failed to toggle Christmas theme:', error);
            // Toggle locally as fallback
            setIsChristmasEnabled(prev => !prev);
        }
    };

    const setChristmasEnabled = async (enabled) => {
        try {
            await axios.put(`${API_BASE}/settings`, { christmas_enabled: enabled });
            setIsChristmasEnabled(enabled);
        } catch (error) {
            console.error('Failed to update Christmas setting:', error);
            setIsChristmasEnabled(enabled);
        }
    };

    return (
        <ThemeContext.Provider value={{
            isChristmasEnabled,
            toggleChristmas,
            setChristmasEnabled,
            loading
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
