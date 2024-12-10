const formStyles = {
  formOuterBox: {
    maxWidth: 1600,
    margin: 'auto',
    padding: 3,
    borderRadius: 2,
    boxShadow: 3,
    backgroundColor: 'white',
    position: 'relative',
  },

  formBannerBox: {
    backgroundColor: '#65558F',
    borderRadius: '8px 8px 0 0',
    padding: 2,
    width: 'calc(100% + 17px)',
    marginLeft: '-24px',
    marginTop: '-24px',
  },

  formColumnBox: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    mt: 2,
  },

  formModalInputBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    position: 'relative',
    border: '1px solid #ccc',
    borderRadius: 1,
    padding: 1,
    minHeight: 32,
  },

  formActivityBox: {
    maxWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    my: 1,
    border: '1px solid #ccc',
    borderRadius: 1,
    padding: 2,
  },

  formNotificationBox: {
    maxWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    my: 3,
    border: '1px solid #ccc',
    borderRadius: 1,
    padding: 2,
  },

  formEditOuterBox: {
    maxWidth: 1600,
    margin: 'auto',
    padding: 3,
    position: 'relative',
  }
}

export default formStyles