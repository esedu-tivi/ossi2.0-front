import { Box, DialogActions, DialogContent, DialogTitle, IconButton, Dialog as MuiDialog } from "@mui/material"
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

interface ModalProps {
  title: string
  open: boolean
  onClose: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}

const modalStyle = {
  title: {
    display: 'flex',
    backgroundColor: '#65558F',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 'h5.fontSize',
    textAlign: 'center',
    py: 0
  },
  titleText: {
    m: 'auto',
    width: '100%',
  },
  button: {
    color: 'white'
  },
}

const Dialog = ({ title, open, onClose, children }: ModalProps) => (
  <MuiDialog
    open={open}
  >
    <DialogTitle sx={modalStyle.title}>
      <DialogActions>
        <IconButton
          onClick={() => onClose(false)}
          sx={modalStyle.button}
        ><ArrowBackIosSharpIcon sx={{ fontSize: 36 }} />
        </IconButton>
      </DialogActions>
      <Box sx={modalStyle.titleText}>
        {title}
      </Box>
    </DialogTitle>
    <DialogContent>
      {children}
    </DialogContent>
  </MuiDialog>
)

export default Dialog
