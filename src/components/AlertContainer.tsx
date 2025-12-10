import { Alert, Box } from "@mui/material"
import { useAlerts } from "../context/AlertContext"

const style = {
  container: {
    position: "fixed",
    top: 2,
    right: 2,
    width: '280px'
  }
}

const AlertContainer = () => {
  const { alerts } = useAlerts()
  return (
    <Box sx={style.container}>
      {alerts.map(alert =>
        <Box>
          <Alert sx={{ mb: 2 }} variant="filled" severity={alert.severity} key={alert.id}>{alert.message}</Alert>
        </Box>

      )}

    </Box>
  )
}

export default AlertContainer
