const buttonStyles = {
  openModalButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },

  saveButton: {
    backgroundColor: '#65558F',
    color: '#fff',
    borderRadius: 5,
    mt: 3,
    width: 1 / 4,
    padding: 1,
    fontSize: '1rem',
    fontWeight: 400,
    '&:hover': {
        backgroundColor: '#4e4574',
    },
    boxShadow: 3,
  },

  cancelButton: {
    backgroundColor: '#65558F',
    color: '#fff',
    borderRadius: 5,
    width: 1 / 6,
    padding: 1,
    mb: 2,
    fontSize: '1rem',
    fontWeight: 400,
    '&:hover': {
      backgroundColor: '#4e4574',
    },
    boxShadow: 3,
  },

  archiveButton: {
    backgroundColor: '#65558F',
    color: '#fff',
    borderRadius: 5,
    width: 1 / 10,
    padding: 1,
    ml: 3,
    mb: 2,
    fontSize: '1rem',
    fontWeight: 400,
    '&:hover': {
      backgroundColor: '#4e4574',
    },
    boxShadow: 3,
  }
}

export default buttonStyles