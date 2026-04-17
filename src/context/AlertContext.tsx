import { useCallback } from "react"
import { toast } from "sonner"
import { AlertContext, type AddAlert, type AlertContextType, type AlertId } from "./alert-context"

const AlertContextProvider = ({ children }: { children: React.ReactNode }) => {
  // alerts and removeAlert kept for backwards compatibility but are no-ops
  // since Sonner manages its own toast state
  const alerts: AlertContextType["alerts"] = []

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

export default AlertContextProvider
