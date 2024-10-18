import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - 240px)`, ml: `240px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Opettajanäkymä
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
