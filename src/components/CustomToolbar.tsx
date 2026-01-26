import { IconButton, Toolbar, Typography } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';

interface CustomToolbarProps {
  handleDrawerToggle: () => void;
  title: string
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ handleDrawerToggle, title }) => {
  return (
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div">
        {title}
      </Typography>
    </Toolbar>
  )
}

export default CustomToolbar
