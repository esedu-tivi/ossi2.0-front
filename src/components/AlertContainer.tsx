import { Alert, Box } from "@mui/material"
import { AlertId, useAlerts } from "../context/AlertContext"

const style = {
  container: {
    position: "fixed",
    top: 2,
    right: 2,
    width: '280px',
    zIndex: 10000
  }
}

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlerts()

  const handleClose = (id: AlertId) => {
    removeAlert(id)
  }

  return (
    <Box sx={style.container}>
      {alerts.map(alert =>
        <Box key={alert.id}>
          {alert.permanent
            ? <Alert sx={{ mb: 2 }} variant="filled" onClose={() => handleClose(alert.id)} severity={alert.severity}>{alert.message}</Alert>
            : <Alert sx={{ mb: 2 }} variant="filled" severity={alert.severity}>{alert.message}</Alert>
          }
        </Box>
      )}
    </Box>
  )
}

export default AlertContainer
