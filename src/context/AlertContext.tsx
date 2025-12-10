import { createContext, useCallback, useContext, useState } from "react"

type AlertId = string
type AlertSeverity = "info" | "success" | "warning" | "error"
type AlertMessage = string

interface Alert {
  id: AlertId
  severity: AlertSeverity
  message: AlertMessage
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (message: AlertMessage, type: AlertSeverity) => void
  removeAlert: (id: AlertId) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

const AlertContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const removeAlert = useCallback((id: AlertId) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id))
  }, [])

  const addAlert = useCallback((message: AlertMessage, severity: AlertSeverity = "success") => {
    const id = Math.random().toString(36).slice(2, 9) + new Date().getTime().toString(36)
    setAlerts((prev) => [...prev, { id, message, severity }])

    setTimeout(() => removeAlert(id), 5000)
  }, [removeAlert])


  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

export const useAlerts = () => {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlerts must be used within a AlertProvider')
  return context
}

export default AlertContextProvider
