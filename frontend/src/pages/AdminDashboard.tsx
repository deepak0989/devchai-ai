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

const summaryCards = [
  { label: 'Total Users', value: '24.8K', change: '+12.4%', tone: '#10a37f' },
  { label: 'Active Chats', value: '1,426', change: '+8.1%', tone: '#3b82f6' },
  { label: 'Messages Sent', value: '96.2K', change: '+18.6%', tone: '#8b5cf6' },
  { label: 'Avg. Response', value: '1.8s', change: '-0.4s', tone: '#f59e0b' },
];

const modelStats = [
  { name: 'GPT-4o mini', value: 74, color: '#10a37f' },
  { name: 'Claude 3.5 Sonnet', value: 46, color: '#d97757' },
  { name: 'Gemini 2.0 Flash', value: 32, color: '#4285f4' },
  { name: 'DeepSeek V3', value: 18, color: '#4d6bfe' },
];

const recentUsers = [
  { name: 'Alicia Smith', email: 'alicia@acme.dev', plan: 'Pro' },
  { name: 'Ravi Patel', email: 'ravi@northstar.io', plan: 'Team' },
  { name: 'Priya Shah', email: 'priya@luma.ai', plan: 'Enterprise' },
  { name: 'Marcus Lee', email: 'marcus@copperlabs.ai', plan: 'Pro' },
];

const activity = [
  '12 new signups in the last 24 hours',
  'AI model uptime remained above 99.9%',
  '2 support tickets resolved automatically',
  'Peak concurrency hit 480 users today',
];

const systemHealth = [
  { label: 'API Health', value: '99.9%', color: '#10a37f' },
  { label: 'Queue Health', value: '96%', color: '#f59e0b' },
  { label: 'Error Rate', value: '0.8%', color: '#3b82f6' },
];

export default function AdminDashboard() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f5f4 0%, #eef3f1 100%)',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1360, mx: 'auto' }}>
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
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.4 }}>
                ADMIN OVERVIEW
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.05em' }}>
                MyDevAI Dashboard
              </Typography>
            </Box>
            <Chip
              label="System healthy"
              color="success"
              sx={{
                bgcolor: 'rgba(16,163,127,0.12)',
                color: '#0f766e',
                fontWeight: 700,
                px: 0.5,
                py: 0.5,
              }}
            />
          </Box>

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
                  boxShadow: '0 14px 32px rgba(15,23,42,0.04)',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.05em' }}>
                      {card.value}
                    </Typography>
                    <Chip
                      label={card.change}
                      size="small"
                      sx={{
                        bgcolor: `${card.tone}1A`,
                        color: card.tone,
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
            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)' }}>
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
                            width: `${item.value}%`,
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

            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  System health
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
            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)' }}>
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

            <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  Active users
                </Typography>
                <Stack spacing={1.5}>
                  {recentUsers.map((user) => (
                    <Box
                      key={user.email}
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
