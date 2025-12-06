'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface HeaderConfig {
  title: string
  customContent?: ReactNode
}

interface HeaderContextType {
  config: HeaderConfig
  setHeader: (config: HeaderConfig) => void
  setTitle: (title: string) => void
  setCustomContent: (content: ReactNode) => void
}

const HeaderContext = createContext<HeaderContextType | null>(null)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({ title: 'NFL Stats' })

  const setHeader = useCallback((newConfig: HeaderConfig) => {
    setConfig(newConfig)
  }, [])

  const setTitle = useCallback((title: string) => {
    setConfig(prev => ({ ...prev, title }))
  }, [])

  const setCustomContent = useCallback((customContent: ReactNode) => {
    setConfig(prev => ({ ...prev, customContent }))
  }, [])

  return (
    <HeaderContext.Provider value={{ config, setHeader, setTitle, setCustomContent }}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider')
  }
  return context
}
