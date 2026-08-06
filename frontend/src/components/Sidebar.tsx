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
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { Chat } from '../types';
import { useThemeMode } from '../context/ThemeModeProvider';
import { useAppSettings } from '../lib/settings';
import BrandLogo from './BrandLogo';

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

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 86400000);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) return 'Previous 7 days';
  return 'Older';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 days', 'Older'];

export default function Sidebar({
  chats,
  activeChatId,
  userEmail,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onLogout,
}: SidebarProps) {
  const { mode, toggleMode } = useThemeMode();
  const { branding } = useAppSettings();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.default',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.25 }}>
        <BrandLogo size={34} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            noWrap
            sx={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}
          >
            {branding.appName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {branding.tagline}
          </Typography>
        </Box>
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
        {chats.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3, px: 2, lineHeight: 1.7 }}
          >
            No conversations yet.
            <br />
            Start a new chat!
          </Typography>
        ) : (
          GROUP_ORDER.map((group) => {
            const groupChats = chats.filter((chat) => groupLabel(chat.updated_at) === group);
            if (groupChats.length === 0) return null;
            return (
              <Box key={group} sx={{ mb: 1.5 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 1.5,
                    py: 0.75,
                    color: 'text.secondary',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: 1.1,
                  }}
                >
                  {group}
                </Typography>
                <List disablePadding>
                  {groupChats.map((chat) => {
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
                              bgcolor: 'action.hover',
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
                </List>
              </Box>
            );
          })
        )}
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
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton
            size="small"
            onClick={toggleMode}
            color="inherit"
            sx={{ borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
          >
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Log out">
          <IconButton
            size="small"
            onClick={onLogout}
            color="inherit"
            sx={{ borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
