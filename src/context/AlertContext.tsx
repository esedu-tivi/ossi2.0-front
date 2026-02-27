import { createContext, useCallback, useContext } from "react"
import { toast } from "sonner"

export type AlertId = string
type AlertSeverity = "info" | "success" | "warning" | "error"
type AlertMessage = string

interface AddAlert {
  (message: AlertMessage, severity?: AlertSeverity, permanent?: boolean): void
}

interface Alert {
  id: AlertId
  severity?: AlertSeverity
  message: AlertMessage
  permanent?: boolean
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: AddAlert
  removeAlert: (id: AlertId) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

const AlertContextProvider = ({ children }: { children: React.ReactNode }) => {
  // alerts and removeAlert kept for backwards compatibility but are no-ops
  // since Sonner manages its own toast state
  const alerts: Alert[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeAlert = useCallback((_id: AlertId) => {
    // No-op: Sonner manages its own dismissal
  }, [])

  const addAlert: AddAlert = useCallback((message, severity = "success", permanent = false) => {
    const options = permanent ? { duration: Infinity } : {}

    switch (severity) {
      case "success":
        toast.success(message, options)
        break
      case "error":
        toast.error(message, options)
        break
      case "warning":
        toast.warning(message, options)
        break
      case "info":
        toast.info(message, options)
        break
    }
  }, [])

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
