'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface SettingsContextType {
    debugMode: boolean
    enableThemeSwitch: boolean
}

const SettingsContext = createContext<SettingsContextType>({
    debugMode: false,
    enableThemeSwitch: true,
})

export const useSettings = () => useContext(SettingsContext)

interface SettingsProviderProps {
    children: React.ReactNode
    initialSettings: {
        debugMode?: boolean
        enableThemeSwitch?: boolean
    } | null
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
    const [settings] = useState({
        debugMode: initialSettings?.debugMode ?? false,
        enableThemeSwitch: initialSettings?.enableThemeSwitch ?? true,
    })

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    )
}
