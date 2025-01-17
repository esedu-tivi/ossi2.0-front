export const messagingStyles = {
    container: {
        display: 'flex',
        height: 'calc(100vh - 100px)',
        backgroundColor: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1,
    },
    sidebar: {
        width: 300,
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
    },
    searchBox: {
        p: 2,
        borderBottom: '1px solid #e0e0e0',
    },
    conversationList: {
        flex: 1,
        overflowY: 'auto',
    },
    conversationItem: {
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
        '&.selected': {
            backgroundColor: '#e3f2fd',
        },
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    messageList: {
        flex: 1,
        overflowY: 'auto',
        p: 2,
    },
    messageInput: {
        p: 2,
        borderTop: '1px solid #e0e0e0',
    },
    message: {
        maxWidth: '70%',
        mb: 1,
        p: 1,
        borderRadius: 1,
    },
    sentMessage: {
        backgroundColor: '#e3f2fd',
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
    },
};
