import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { api } from '../api/client';

interface DashboardSummary {
  label: string;
  value: string;
  change: string;
  color: string;
}

interface DashboardModelBreakdown {
  name: string;
  count: number;
  value: number;
  color: string;
}

interface DashboardUser {
  name: string;
  email: string;
  plan: string;
}

interface DashboardResponse {
  summary: DashboardSummary[];
  modelBreakdown: DashboardModelBreakdown[];
  recentUsers: DashboardUser[];
  activity: string[];
  systemHealth: Array<{ label: string; value: string; color: string }>;
  lastUpdated: string;
}

const fallbackSummary: DashboardSummary[] = [
  { label: 'Total Users', value: '--', change: '+0.0%', color: '#10a37f' },
  { label: 'Active Chats', value: '--', change: '+0.0%', color: '#3b82f6' },
  { label: 'Messages Sent', value: '--', change: '+0.0%', color: '#8b5cf6' },
  { label: 'Avg. Response', value: '--', change: '0.0s', color: '#f59e0b' },
];

const fallbackModels: DashboardModelBreakdown[] = [
  { name: 'GPT-4o mini', count: 0, value: 0, color: '#10a37f' },
  { name: 'Claude 3.5 Sonnet', count: 0, value: 0, color: '#d97757' },
  { name: 'Gemini 2.0 Flash', count: 0, value: 0, color: '#4285f4' },
  { name: 'DeepSeek V3', count: 0, value: 0, color: '#4d6bfe' },
];

const fallbackUsers: DashboardUser[] = [
  { name: 'Loading...', email: 'loading@mydevai.app', plan: '—' },
];

const fallbackActivity = ['Loading dashboard insights...'];

const fallbackSystemHealth = [
  { label: 'API Health', value: '--', color: '#10a37f' },
  { label: 'Queue Health', value: '--', color: '#f59e0b' },
  { label: 'Error Rate', value: '--', color: '#3b82f6' },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        const overview = await api.adminOverview();
        setData(overview);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const summaryCards = data?.summary ?? fallbackSummary;
  const modelStats = data?.modelBreakdown ?? fallbackModels;
  const recentUsers = data?.recentUsers ?? fallbackUsers;
  const activity = data?.activity ?? fallbackActivity;
  const systemHealth = data?.systemHealth ?? fallbackSystemHealth;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, rgba(16,163,127,0.12), transparent 38%), linear-gradient(180deg, #f5f5f4 0%, #eef3f1 100%)',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                ADMIN OVERVIEW
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.06em' }}>
                MyDevAI Dashboard
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={loading ? 'Refreshing' : 'System healthy'}
                sx={{
                  bgcolor: loading ? 'rgba(59,130,246,0.12)' : 'rgba(16,163,127,0.12)',
                  color: loading ? '#1d4ed8' : '#0f766e',
                  fontWeight: 700,
                  px: 0.5,
                  py: 0.5,
                }}
              />
              {data?.lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Updated {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              )}
            </Box>
          </Box>

          {error && (
            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(239,68,68,0.2)', bgcolor: 'rgba(239,68,68,0.04)' }}>
              <CardContent sx={{ py: 2, px: 2.5 }}>
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {summaryCards.map((card) => (
              <Card
                key={card.label}
                sx={{
                  border: 1,
                  borderColor: 'rgba(17,24,39,0.06)',
                  boxShadow: '0 18px 38px rgba(15,23,42,0.05)',
                  borderRadius: 4,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.98) 100%)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.06em' }}>
                      {card.value}
                    </Typography>
                    <Chip
                      label={card.change}
                      size="small"
                      sx={{
                        bgcolor: `${card.color}1A`,
                        color: card.color,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' },
              gap: 2,
            }}
          >
            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Model Usage
                </Typography>
                <Stack spacing={2.5}>
                  {modelStats.map((item) => (
                    <Box key={item.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {item.value}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 10,
                          bgcolor: 'rgba(17,24,39,0.05)',
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.max(6, item.value)}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  System Health
                </Typography>
                <Stack spacing={2}>
                  {systemHealth.map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        border: 1,
                        borderColor: 'rgba(17,24,39,0.06)',
                        borderRadius: 3,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Chip
                        label={item.value}
                        sx={{
                          bgcolor: `${item.color}1A`,
                          color: item.color,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.25fr 1fr' },
              gap: 2,
            }}
          >
            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  Recent activity
                </Typography>
                <List disablePadding>
                  {activity.map((item) => (
                    <Box key={item}>
                      <ListItem disableGutters sx={{ py: 1.25 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            mr: 1.5,
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="text.primary">
                              {item}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  Active users
                </Typography>
                <Stack spacing={1.5}>
                  {recentUsers.map((user) => (
                    <Box
                      key={`${user.email}-${user.name}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1.5,
                        border: 1,
                        borderColor: 'rgba(17,24,39,0.06)',
                        borderRadius: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={user.plan}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16,163,127,0.08)',
                          color: '#0f766e',
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
