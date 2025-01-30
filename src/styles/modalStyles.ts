const modalStyles = {
  outerBox: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: "#65558F",
    color: "#fff",
    padding: "16px",
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: '2rem',
    color: 'white',
  },
  content: {
    padding: 3,
    fontSize: "1.3rem",
  },
  listItem: {
    fontSize: "1.3rem",
    padding: "4px 0",
    listStyleType: "disc",
    marginLeft: "20px",
  },
};

export default modalStyles;
