import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { api } from '../api/client';

type TabKey = 'overview' | 'users' | 'billing';

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
  revenueTrend: Array<{ label: string; value: number }>;
  usageTrend: Array<{ label: string; value: number }>;
  lastUpdated: string;
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_seen: string;
}

interface BillingData {
  totalRevenue: string;
  arpu: string;
  monthlyRevenue: Array<{ month: string; revenue: number; customers: number }>;
  subscriptionBreakdown: Array<{ plan: string; users: number; revenue: number }>;
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

const fallbackUsers: DashboardUser[] = [{ name: 'Loading...', email: 'loading@mydevai.app', plan: '—' }];
const fallbackActivity = ['Loading dashboard insights...'];
const fallbackSystemHealth = [
  { label: 'API Health', value: '--', color: '#10a37f' },
  { label: 'Queue Health', value: '--', color: '#f59e0b' },
  { label: 'Error Rate', value: '--', color: '#3b82f6' },
];
const fallbackTrend = [
  { label: 'Jan', value: 18 },
  { label: 'Feb', value: 22 },
  { label: 'Mar', value: 26 },
  { label: 'Apr', value: 31 },
  { label: 'May', value: 34 },
  { label: 'Jun', value: 40 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [overview, setOverview] = useState<DashboardResponse | null>(null);
  const [userRows, setUserRows] = useState<AdminUserRow[]>([]);
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewData, usersData, billingData] = await Promise.all([
          api.adminOverview().catch(() => null),
          api.adminUsers().catch(() => ({ users: [] })),
          api.adminBilling().catch(() => null),
        ]);

        setOverview(overviewData);
        setUserRows(usersData.users ?? []);
        setBilling(billingData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const summaryCards = overview?.summary ?? fallbackSummary;
  const modelStats = overview?.modelBreakdown ?? fallbackModels;
  const recentUsers = overview?.recentUsers ?? fallbackUsers;
  const activity = overview?.activity ?? fallbackActivity;
  const systemHealth = overview?.systemHealth ?? fallbackSystemHealth;
  const revenueTrend = overview?.revenueTrend ?? fallbackTrend;
  const usageTrend = overview?.usageTrend ?? fallbackTrend;

  const totalRevenue = billing?.totalRevenue ?? '$0';
  const arpu = billing?.arpu ?? '$0';
  const monthlyRevenue = billing?.monthlyRevenue ?? [
    { month: 'Jan', revenue: 18, customers: 120 },
    { month: 'Feb', revenue: 22, customers: 126 },
    { month: 'Mar', revenue: 26, customers: 132 },
  ];
  const subscriptionBreakdown = billing?.subscriptionBreakdown ?? [
    { plan: 'Starter', users: 0, revenue: 0 },
    { plan: 'Pro', users: 0, revenue: 0 },
    { plan: 'Team', users: 0, revenue: 0 },
  ];

  const navItems: Array<{ key: TabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'billing', label: 'Billing' },
  ];

  const revenueChartData = useMemo(
    () => revenueTrend.map((item) => ({ ...item, pv: item.value })),
    [revenueTrend]
  );

  const usageChartData = useMemo(
    () => usageTrend.map((item) => ({ ...item, pv: item.value })),
    [usageTrend]
  );

  const renderOverview = () => (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
        {summaryCards.map((card) => (
          <Card key={card.label} sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.05)', background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.98) 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{card.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.06em' }}>{card.value}</Typography>
                <Chip label={card.change} size="small" sx={{ bgcolor: `${card.color}1A`, color: card.color, fontWeight: 700 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.3fr 0.7fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Revenue trend</Typography>
              <Chip label={totalRevenue} sx={{ bgcolor: 'rgba(16,163,127,0.12)', color: '#0f766e', fontWeight: 700 }} />
            </Box>
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10a37f" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10a37f" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#64748b" />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip />
                  <Area type="monotone" dataKey="pv" stroke="#10a37f" strokeWidth={3} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>System health</Typography>
            <Stack spacing={2}>
              {systemHealth.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: 1, borderColor: 'rgba(17,24,39,0.06)', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Chip label={item.value} sx={{ bgcolor: `${item.color}1A`, color: item.color, fontWeight: 700 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Usage trends</Typography>
              <Chip label="+18.6%" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#2563eb', fontWeight: 700 }} />
            </Box>
            <Box sx={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={usageChartData}>
                  <defs>
                    <linearGradient id="usageFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#64748b" />
                  <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip />
                  <Area type="monotone" dataKey="pv" stroke="#3b82f6" strokeWidth={3} fill="url(#usageFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model usage</Typography>
            <Stack spacing={2.5}>
              {modelStats.map((item) => (
                <Box key={item.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.value}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(17,24,39,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                    <Box sx={{ width: `${Math.max(6, item.value)}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)` }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Recent activity</Typography>
            <List disablePadding>
              {activity.map((item) => (
                <Box key={item}>
                  <ListItem disableGutters sx={{ py: 1.25 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mr: 1.5, flexShrink: 0 }} />
                    <ListItemText primary={<Typography variant="body2" color="text.primary">{item}</Typography>} />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Active users</Typography>
            <Stack spacing={1.5}>
              {recentUsers.map((user) => (
                <Box key={`${user.email}-${user.name}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 1.5, border: 1, borderColor: 'rgba(17,24,39,0.06)', borderRadius: 3 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                  <Chip label={user.plan} size="small" sx={{ bgcolor: 'rgba(16,163,127,0.08)', color: '#0f766e', fontWeight: 700 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );

  const renderUsers = () => (
    <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>User management</Typography>
          <Chip label={`${userRows.length} users`} sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#2563eb', fontWeight: 700 }} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No users available yet.
                  </TableCell>
                </TableRow>
              ) : (
                userRows.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'user'}
                        size="small"
                        sx={{ bgcolor: user.role === 'admin' ? 'rgba(16,163,127,0.12)' : 'rgba(148,163,184,0.12)', color: user.role === 'admin' ? '#0f766e' : '#475569', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{ bgcolor: user.status === 'active' ? 'rgba(16,163,127,0.12)' : 'rgba(239,68,68,0.12)', color: user.status === 'active' ? '#0f766e' : '#b91c1c', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{new Date(user.last_seen).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderBilling = () => (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">Total revenue</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mt: 1, letterSpacing: '-0.05em' }}>{totalRevenue}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>ARPU {arpu}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">Subscription mix</Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {subscriptionBreakdown.map((tier) => (
                <Box key={tier.plan} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{tier.plan}</Typography>
                  <Typography variant="body2" fontWeight={700}>{tier.users} users</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)', mt: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Monthly revenue</Typography>
          <Box sx={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {monthlyRevenue.map((entry, index) => (
                    <Cell key={`${entry.month}-${index}`} fill={index % 2 === 0 ? '#10a37f' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f5f4' }}>
      <Box sx={{ width: 260, background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)', color: '#f8fafc', p: 2.5, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>M</Box>
          <Typography variant="h6" fontWeight={800}>MyDevAI</Typography>
        </Box>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? 'contained' : 'text'}
              onClick={() => setActiveTab(item.key)}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 1.2,
                borderRadius: 2,
                color: activeTab === item.key ? '#ecfeff' : '#cbd5e1',
                backgroundColor: activeTab === item.key ? 'rgba(16,163,127,0.14)' : 'transparent',
                fontWeight: activeTab === item.key ? 700 : 500,
                textTransform: 'none',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', p: 2, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.6)', border: 1, borderColor: 'rgba(148,163,184,0.2)' }}>
          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Workspace Health</Typography>
          <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>99.9%</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>ADMIN OVERVIEW</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.06em' }}>MyDevAI Dashboard</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip label={loading ? 'Refreshing' : 'System healthy'} sx={{ bgcolor: loading ? 'rgba(59,130,246,0.12)' : 'rgba(16,163,127,0.12)', color: loading ? '#1d4ed8' : '#0f766e', fontWeight: 700, px: 0.5, py: 0.5 }} />
                {overview?.lastUpdated && (
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(overview.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Box>
            </Box>

            {error && (
              <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(239,68,68,0.2)', bgcolor: 'rgba(239,68,68,0.04)' }}>
                <CardContent sx={{ py: 2, px: 2.5 }}>
                  <Typography variant="body2" color="error.main" fontWeight={600}>{error}</Typography>
                </CardContent>
              </Card>
            )}

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'billing' && renderBilling()}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
