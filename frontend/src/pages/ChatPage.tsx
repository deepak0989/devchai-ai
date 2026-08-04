import { useCallback, useEffect, useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Chat } from '../types';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const DRAWER_WIDTH = 280;

export default function ChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [model, setModel] = useState<string>('openai/gpt-4o-mini');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const { chats: list } = await api.listChats();
      setChats(list);
    } catch {
      // Sidebar refresh failures are non-fatal
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleNewChat = useCallback(async (): Promise<Chat | null> => {
    try {
      const { chat } = await api.createChat({ model });
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      if (isMobile) setDrawerOpen(false);
      return chat;
    } catch {
      return null;
    }
  }, [isMobile, model]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      if (isMobile) setDrawerOpen(false);
    },
    [isMobile]
  );

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      try {
        await api.deleteChat(chatId);
      } catch {
        // If deletion fails, still remove it from the UI list
      }
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) setActiveChatId(null);
    },
    [activeChatId]
  );

  const sidebar = (
    <Sidebar
      chats={chats}
      activeChatId={activeChatId}
      userEmail={user?.email ?? ''}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onLogout={logout}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              border: 'none',
            },
          }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <ChatWindow
          chatId={activeChatId}
          model={model}
          onModelChange={setModel}
          onOpenDrawer={() => setDrawerOpen(true)}
          onChatsChanged={loadChats}
          onNewChat={handleNewChat}
        />
      </Box>
    </Box>
  );
}
