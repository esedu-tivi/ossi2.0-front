import { Button } from "@mui/material"
import BackIcon from "@mui/icons-material/ArrowBack"
import { useNavigate } from "react-router-dom"

const BackButton = () => {
  const navigate = useNavigate()
  return (
    <Button variant="contained" sx={{ marginBottom: '10px' }} startIcon={<BackIcon />} onClick={() => navigate(-1)}>Palaa</Button>
  )
}
export default BackButton