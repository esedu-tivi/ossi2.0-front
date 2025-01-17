import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { Box, List, ListItem, TextField, Typography, IconButton } from '@mui/material';
import { GET_CONVERSATIONS, GET_MESSAGES, SEARCH_USERS } from '../../graphql/messaging';
import { SEND_MESSAGE, CREATE_CONVERSATION } from '../../graphql/messagingMutations';
import { MESSAGE_RECEIVED, CONVERSATION_UPDATED } from '../../graphql/messagingSubscriptions';
import { useAuth } from '../../utils/auth-context';
import SendIcon from '@mui/icons-material/Send';

const MessagingView: React.FC = () => {
  const { userEmail } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add scrollToBottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Query for conversations with refetch capability
  const { 
    data: conversationsData, 
    loading: conversationsLoading,
    refetch: refetchConversations 
  } = useQuery(GET_CONVERSATIONS, {
    fetchPolicy: 'network-only' // Important: Don't use cache for conversations
  });

  // Query for messages with refetch capability
  const { 
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages
  } = useQuery(GET_MESSAGES, {
    variables: { conversationId: selectedConversation },
    skip: !selectedConversation,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.messages) {
        setMessages(data.messages);
        scrollToBottom();
      }
    }
  });

  // Search users query
  const { data: searchResults, loading: searchLoading } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery },
    skip: !searchQuery
  });

  // Send message mutation
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      refetchMessages(); // Refetch messages after sending
      refetchConversations(); // Refetch conversations to update last message
    }
  });

  // Create conversation mutation
  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    onCompleted: (data) => {
      if (data?.createConversation?.id) {
        setSelectedConversation(data.createConversation.id);
        setSearchQuery('');
        refetchConversations(); // Refetch conversations after creating new one
      }
    }
  });

  // Real-time updates
  useSubscription(MESSAGE_RECEIVED, {
    variables: { conversationId: selectedConversation },
    skip: !selectedConversation,
    onData: ({ data }) => {
      const newMessage = data?.data?.messageReceived;
      if (newMessage) {
        refetchMessages();
        refetchConversations();
        scrollToBottom();
      }
    },
  });

  useSubscription(CONVERSATION_UPDATED, {
    variables: { userId: userEmail },
    skip: !userEmail,
    onData: ({ data }) => {
      const updatedConversation = data?.data?.conversationUpdated;
      if (updatedConversation) {
        // Force refresh conversations when updated
        refetchConversations();
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Event handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        variables: {
          conversationId: selectedConversation,
          content: messageInput,
        },
      });
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewConversation = async (participantId: string) => {
    try {
      await createConversation({
        variables: {
          participantIds: [participantId],
        },
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (conversationsLoading) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', bgcolor: 'background.paper' }}>
      {/* Conversations List */}
      <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <List>
          {searchQuery ? (
            searchLoading ? (
              <ListItem><Typography>Searching...</Typography></ListItem>
            ) : searchResults?.searchUsers?.map((user: any) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleStartNewConversation(user.id)}
              >
                <Typography>{`${user.firstName} ${user.lastName} (${user.email})`}</Typography>
              </ListItem>
            ))
          ) : conversationsData?.conversations?.length === 0 ? (
            <ListItem>
              <Typography>No conversations yet. Search for users to start chatting!</Typography>
            </ListItem>
          ) : (
            conversationsData?.conversations?.map((conversation: any) => (
              <ListItem
                key={conversation.id}
                button
                selected={selectedConversation === conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                sx={{
                  borderBottom: '1px solid #eee',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  '&.Mui-selected': { bgcolor: 'primary.light' },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography>
                    {conversation.participants
                      .filter((p: any) => p.email !== userEmail)
                      .map((p: any) => `${p.firstName} ${p.lastName}`)
                      .join(', ')}
                  </Typography>
                  {conversation.lastMessage && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {conversation.lastMessage.content}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {/* Messages View */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
              {messagesData?.messages?.map((message: any) => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    bgcolor: message.sender.email === userEmail ? 'primary.light' : 'grey.100',
                    borderRadius: 1,
                    maxWidth: '70%',
                    alignSelf: message.sender.email === userEmail ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {`${message.sender.firstName} ${message.sender.lastName}`}
                  </Typography>
                  <Typography>{message.content}</Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Select a conversation or search for users to start a new one</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessagingView;
