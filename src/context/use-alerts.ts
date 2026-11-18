import { useContext } from "react"
import { AlertContext } from "./alert-context"

export const useAlerts = () => {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlerts must be used within a AlertProvider')
  return context
}
