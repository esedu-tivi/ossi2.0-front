const baseButtonStyles = {
  backgroundColor: '#65558F',
  color: '#fff',
  borderRadius: 5,
  fontSize: '1rem',
  fontWeight: 400,
  '&:hover': {
    backgroundColor: '#4e4574',
  },
  boxShadow: 3,
  textWrap: 'nowrap',
}

const buttonStyles = {
  openModalButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },

  archiveButton: {
    ...baseButtonStyles,
    width: 1 / 10,
    padding: 1,
    ml: 3,
    mb: 2,
  },

  saveButton: {
    ...baseButtonStyles,
    mt: 3,
    px: 2,
    width: 'auto',
    fontWeight: 500,
  },

  cancelButton: {
    ...baseButtonStyles,
    width: 1 / 6,
    padding: 1,
    mb: 2,
    textTransform: 'none',
  },

  educationButton: {
    ...baseButtonStyles,
    visibility: 'hidden',
    width: 'auto',
    paddingX: 1.5,
    fontWeight: 200,
    textTransform: 'none',
  },

  showButton: {
    ...baseButtonStyles,
    textTransform: 'default',
  },
}

export default buttonStyles