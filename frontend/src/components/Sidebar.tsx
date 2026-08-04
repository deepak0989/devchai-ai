import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  userEmail: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onLogout: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Sidebar({
  chats,
  activeChatId,
  userEmail,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onLogout,
}: SidebarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#f5f5f5',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.25 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 163, 127, 0.18)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} noWrap>
          DevChat AI
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{
            py: 1.1,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #10a37f 0%, #0f8d6c 100%)',
            boxShadow: 'none',
            '&:hover': { background: 'linear-gradient(135deg, #0f8d6c 0%, #0d7d5f 100%)' },
          }}
        >
          New Chat
        </Button>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.8 }} />

      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1.2, fontWeight: 700 }}
        >
          Recent Chats
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 1 }}>
        <List disablePadding>
          {chats.map((chat) => {
            const selected = chat.id === activeChatId;
            return (
              <ListItem
                key={chat.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="Delete chat"
                    onClick={() => onDeleteChat(chat.id)}
                    sx={{
                      color: 'text.secondary',
                      opacity: selected ? 1 : 0,
                      '&:hover': { color: 'error.main', opacity: 1 },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selected}
                  onClick={() => onSelectChat(chat.id)}
                  sx={{
                    borderRadius: 2.5,
                    mr: 4,
                    px: 1.5,
                    py: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(16,163,127,0.12)',
                      border: 1,
                      borderColor: 'rgba(16,163,127,0.2)',
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'rgba(16,163,127,0.15)',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(17, 24, 39, 0.04)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ pr: 0.5 }}
                        fontWeight={selected ? 700 : 500}
                      >
                        {chat.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(chat.updated_at)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
          {chats.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 3, px: 2, lineHeight: 1.7 }}
            >
              No conversations yet.
              <br />
              Start a new chat!
            </Typography>
          )}
        </List>
      </Box>

      <Divider sx={{ opacity: 0.8 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}
        >
          {userEmail.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 500 }}>
          {userEmail}
        </Typography>
        <Tooltip title="Log out">
          <IconButton
            size="small"
            onClick={onLogout}
            color="inherit"
            sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(17,24,39,0.04)' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
