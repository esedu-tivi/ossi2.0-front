import { createContext } from "react"

export type AlertId = string
export type AlertSeverity = "info" | "success" | "warning" | "error"
export type AlertMessage = string

export interface AddAlert {
  (message: AlertMessage, severity?: AlertSeverity, permanent?: boolean): void
}

interface Alert {
  id: AlertId
  severity?: AlertSeverity
  message: AlertMessage
  permanent?: boolean
}

export interface AlertContextType {
  alerts: Alert[]
  addAlert: AddAlert
  removeAlert: (id: AlertId) => void
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined)
