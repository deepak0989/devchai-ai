import { useCallback, ChangeEvent, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  Switch,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { api, AdminUserRow } from '../api/client';
import { Message } from '../types';
import { useAppSettings } from '../lib/settings';
import { darkenHex, isValidHex } from '../lib/color';
import BrandLogo from '../components/BrandLogo';
import { lightTheme, lightBackground } from '../theme';

type TabKey = 'overview' | 'users' | 'billing' | 'settings';

interface SummaryCard {
  label: string;
  value: string;
  change: string;
  color: string;
}

interface ModelSlice {
  name: string;
  count: number;
  value: number;
  color: string;
}

interface OverviewResponse {
  summary: SummaryCard[];
  modelBreakdown: ModelSlice[];
  recentUsers: Array<{ name: string; email: string; joined: string | null }>;
  activity: string[];
  systemHealth: Array<{ label: string; status: 'ok' | 'error'; detail: string; color: string }>;
  usageTrend: Array<{ label: string; value: number }>;
  chatsTrend: Array<{ label: string; value: number }>;
  lastUpdated: string;
}

interface AdminUsersResponse {
  users: AdminUserRow[];
  total: number;
  counts: { all: number; admin: number; active: number; disabled: number };
}

interface UserChatsResponse {
  user: { id: string; email: string | null };
  chats: Array<{
    id: string;
    title: string;
    model: string;
    created_at: string;
    updated_at: string;
    messages: Message[];
  }>;
}

interface BillingResponse {
  totalCredits: number | null;
  totalSpend: number | null;
  remaining: number | null;
  totalUsers: number;
  totalMessages: number;
  monthlyActivity: Array<{ month: string; messages: number }>;
  modelBreakdown: ModelSlice[];
  lastUpdated: string;
}

const PAGE_SIZE = 10;

const AVATAR_COLORS = ['#10a37f', '#3b82f6', '#8b5cf6', '#f59e0b', '#d97757', '#0ea5e9'];

function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initialsOf(name: string): string {
  return name
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function TrendChartCard({ title, subtitle, data, color, height = 240 }: { title: string; subtitle?: string; data: Array<{ label: string; value: number }>; color: string; height?: number }) {
  return (
    <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
        <Box sx={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
              <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={36} />
              <ChartTooltip />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#fill-${color.replace('#', '')})`} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function SkeletonCard({ height = 180 }: { height?: number }) {
  return (
    <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton width="40%" height={18} />
        <Skeleton width="70%" height={40} sx={{ mt: 1.5 }} />
        <Skeleton width="100%" height={Math.max(60, height - 110)} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { branding } = useAppSettings();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [userRows, setUserRows] = useState<AdminUserRow[]>([]);
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [usersRefreshing, setUsersRefreshing] = useState(false);
  const [usersCounts, setUsersCounts] = useState<AdminUsersResponse['counts'] | null>(null);

  const [chatsDialogUser, setChatsDialogUser] = useState<AdminUserRow | null>(null);
  const [chatsData, setChatsData] = useState<UserChatsResponse | null>(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<{ user: AdminUserRow; action: 'ban' | 'unban' } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [brandingDraft, setBrandingDraft] = useState({ appName: '', logo: '', tagline: '', logoUrl: '', accent: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [limitsDialogUser, setLimitsDialogUser] = useState<AdminUserRow | null>(null);
  const [limitsDraft, setLimitsDraft] = useState({ maxChats: '', maxMessages: '', note: '' });
  const [limitsSaving, setLimitsSaving] = useState(false);
  const [limitsError, setLimitsError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const isMobile = useMediaQuery('(max-width: 900px)');
  const isSmall = useMediaQuery('(max-width: 600px)');

  const previewAccent = isValidHex(brandingDraft.accent) ? brandingDraft.accent.trim() : '#10a37f';

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, usersData, billingData, settingsData] = await Promise.all([
        api.adminOverview(),
        api.adminUsers(),
        api.adminBilling(),
        api.adminGetSettings().catch(() => null),
      ]);
      setOverview(overviewData);
      setUserRows(usersData.users);
      setUsersCounts(usersData.counts);
      setBilling(billingData);
      if (settingsData) {
        setVoiceEnabled(settingsData.voiceEnabled);
        setMaintenanceEnabled(settingsData.maintenance.enabled);
        setMaintenanceMessage(settingsData.maintenance.message);
        setBrandingDraft({
          appName: settingsData.branding?.appName ?? '',
          logo: settingsData.branding?.logo ?? '',
          tagline: settingsData.branding?.tagline ?? '',
          logoUrl: settingsData.branding?.logoUrl ?? '',
          accent: settingsData.branding?.accent ?? '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  const loadUsers = useCallback(
    async (query: string, role: string, status: string) => {
      setUsersRefreshing(true);
      try {
        const data = await api.adminUsers({
          search: query || undefined,
          role,
          status,
        });
        setUserRows(data.users);
        setUsersCounts(data.counts);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to load users.');
      } finally {
        setUsersRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search, roleFilter, statusFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, loadUsers]);

  const pageCount = Math.max(1, Math.ceil(userRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedUsers = userRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const topUsersByChats = useMemo(
    () =>
      [...userRows]
        .sort((a, b) => b.chat_count - a.chat_count)
        .slice(0, 8)
        .map((user) => ({ label: user.name, chats: user.chat_count })),
    [userRows]
  );

  async function openChats(user: AdminUserRow) {
    setChatsDialogUser(user);
    setChatsData(null);
    setChatsError(null);
    setExpandedChat(null);
    setChatsLoading(true);
    try {
      const data = await api.adminUserChats(user.id);
      setChatsData(data);
    } catch (err) {
      setChatsError(err instanceof Error ? err.message : 'Failed to load chats.');
    } finally {
      setChatsLoading(false);
    }
  }

  async function changeRole(user: AdminUserRow, role: 'admin' | 'user') {
    setActionBusyId(user.id);
    setActionError(null);
    try {
      await api.adminSetRole(user.id, role);
      setUserRows((rows) => rows.map((row) => (row.id === user.id ? { ...row, role } : row)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setActionBusyId(null);
    }
  }

  async function confirmStatusChange() {
    if (!confirmUser) return;
    const { user, action } = confirmUser;
    setActionBusyId(user.id);
    setActionError(null);
    try {
      const banned = action === 'ban';
      await api.adminSetStatus(user.id, banned);
      setUserRows((rows) =>
        rows.map((row) => (row.id === user.id ? { ...row, status: banned ? 'disabled' : 'active' } : row))
      );
      setConfirmUser(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setActionBusyId(null);
    }
  }

  function openLimitsDialog(user: AdminUserRow) {
    setLimitsDialogUser(user);
    setLimitsDraft({
      maxChats: user.limits.maxChats !== null ? String(user.limits.maxChats) : '',
      maxMessages: user.limits.maxMessages !== null ? String(user.limits.maxMessages) : '',
      note: user.limits.note ?? '',
    });
    setLimitsError(null);
  }

  async function saveLimits() {
    if (!limitsDialogUser) return;
    setLimitsSaving(true);
    setLimitsError(null);
    try {
      const maxChats = limitsDraft.maxChats.trim() === '' ? null : Number(limitsDraft.maxChats);
      const maxMessages =
        limitsDraft.maxMessages.trim() === '' ? null : Number(limitsDraft.maxMessages);
      const note = limitsDraft.note.trim() === '' ? null : limitsDraft.note.trim();

      if (maxChats !== null && (!Number.isInteger(maxChats) || maxChats < 1)) {
        setLimitsError('Max chats must be a positive whole number or empty.');
        return;
      }
      if (maxMessages !== null && (!Number.isInteger(maxMessages) || maxMessages < 1)) {
        setLimitsError('Max messages must be a positive whole number or empty.');
        return;
      }

      const result = await api.adminSetLimits(limitsDialogUser.id, {
        maxChats,
        maxMessages,
        note,
      });
      setUserRows((rows) =>
        rows.map((row) =>
          row.id === limitsDialogUser.id ? { ...row, limits: result.limits } : row
        )
      );
      setLimitsDialogUser(null);
    } catch (err) {
      setLimitsError(err instanceof Error ? err.message : 'Failed to save limits.');
    } finally {
      setLimitsSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.adminExportUsers({
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devchat-users-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to export users.');
    } finally {
      setExporting(false);
    }
  }

  const navItems: Array<{ key: TabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'billing', label: 'Billing' },
    { key: 'settings', label: 'Settings' },
  ];

  const renderOverview = () => {
    if (loading) {
      return (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} height={120} />)}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
            <SkeletonCard height={280} />
            <SkeletonCard height={280} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
            <SkeletonCard height={280} />
            <SkeletonCard height={280} />
          </Box>
        </Stack>
      );
    }

    if (!overview) {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          No overview data available.
        </Alert>
      );
    }

    const healthOk = overview.systemHealth.filter((h) => h.status === 'ok').length;
    const healthTotal = overview.systemHealth.length;

    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
          {overview.summary.map((card) => (
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

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
          <TrendChartCard
            title="Messages per day"
            subtitle="Last 14 days"
            data={overview.usageTrend}
            color="#10a37f"
          />
          <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>System health</Typography>
                <Chip label={`${healthOk}/${healthTotal} healthy`} size="small" sx={{ bgcolor: healthOk === healthTotal ? 'rgba(16,163,127,0.12)' : 'rgba(239,68,68,0.12)', color: healthOk === healthTotal ? '#0f766e' : '#b91c1c', fontWeight: 700 }} />
              </Box>
              <Stack spacing={2}>
                {overview.systemHealth.map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: 1, borderColor: 'rgba(17,24,39,0.06)', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    </Box>
                    <Chip label={item.detail} size="small" sx={{ bgcolor: `${item.color}1A`, color: item.color, fontWeight: 700 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Chats started per day</Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={overview.chatsTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={36} />
                    <ChartTooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {overview.chatsTrend.map((entry, index) => (
                        <Cell key={`${entry.label}-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#93c5fd'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Model usage (7 days)</Typography>
              <Stack spacing={2.5}>
                {overview.modelBreakdown.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No model usage in the last 7 days.</Typography>
                )}
                {overview.modelBreakdown.map((item) => (
                  <Box key={item.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.count} msgs</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(17,24,39,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                      <Box sx={{ width: `${Math.max(4, item.value)}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)` }} />
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
              {overview.activity.length === 0 && (
                <Typography variant="body2" color="text.secondary">No activity yet.</Typography>
              )}
              <List disablePadding>
                {overview.activity.map((item, index) => (
                  <Box key={`${item}-${index}`}>
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
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Top users by chats</Typography>
              {topUsersByChats.length === 0 && (
                <Typography variant="body2" color="text.secondary">No chat activity yet.</Typography>
              )}
              <Stack spacing={1.5}>
                {topUsersByChats.map((entry) => (
                  <Box key={entry.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, border: 1, borderColor: 'rgba(17,24,39,0.06)', borderRadius: 3 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: avatarColorFor(entry.label), fontSize: 13, fontWeight: 700 }}>
                      {initialsOf(entry.label)}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.label}
                    </Typography>
                    <Chip label={`${entry.chats} chats`} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#2563eb', fontWeight: 700 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    );
  };

  const renderUsers = () => {
    if (loading) {
      return <SkeletonCard height={400} />;
    }

    return (
      <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>User management</Typography>
                <Typography variant="body2" color="text.secondary">
                  {usersCounts
                    ? `${usersCounts.all} registered · ${usersCounts.admin} admin · ${usersCounts.active} active`
                    : `${userRows.length} registered user${userRows.length === 1 ? '' : 's'}`}
                </Typography>
              </Box>
              {usersRefreshing && <CircularProgress size={16} sx={{ ml: 0.5 }} />}
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                onClick={handleExport}
                disabled={exporting || userRows.length === 0}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, borderColor: 'rgba(17,24,39,0.15)' }}
              >
                Export CSV
              </Button>
              <TextField
                size="small"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: isMobile ? 180 : 240 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                size="small"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as string);
                  setPage(1);
                }}
                sx={{ minWidth: 110 }}
              >
                <MenuItem value="all">All roles</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
                <MenuItem value="user">Users</MenuItem>
              </Select>
              <Select
                size="small"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as string);
                  setPage(1);
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </Stack>
          </Box>

          {actionError && (
            <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2, borderRadius: 2 }}>
              {actionError}
            </Alert>
          )}

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: isMobile ? 680 : undefined }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Chats</TableCell>
                  <TableCell>Limits</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Last seen</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      {userRows.length === 0 ? 'No users registered yet.' : 'No users match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: avatarColorFor(user.email), fontSize: 13, fontWeight: 700 }}>
                            {initialsOf(user.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 120 : 200 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 120 : 200, display: 'block' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          icon={user.role === 'admin' ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{user.chat_count}</Typography>
                      </TableCell>
                      <TableCell>
                        {user.limits.maxChats === null && user.limits.maxMessages === null ? (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        ) : (
                          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                            {user.limits.maxChats !== null && (
                              <Chip
                                size="small"
                                label={`${user.limits.maxChats} chats`}
                                sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#b45309', fontWeight: 700, height: 20 }}
                              />
                            )}
                            {user.limits.maxMessages !== null && (
                              <Chip
                                size="small"
                                label={`${user.limits.maxMessages} msgs`}
                                sx={{ bgcolor: 'rgba(139,92,246,0.12)', color: '#6d28d9', fontWeight: 700, height: 20 }}
                              />
                            )}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(user.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{formatDate(user.last_seen)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Read chats">
                            <span>
                              <IconButton size="small" onClick={() => openChats(user)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Set limits">
                            <span>
                              <IconButton size="small" onClick={() => openLimitsDialog(user)}>
                                <TuneIcon fontSize="small" sx={{ color: '#6d28d9' }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                            <span>
                              <IconButton size="small" disabled={actionBusyId === user.id} onClick={() => changeRole(user, user.role === 'admin' ? 'user' : 'admin')}>
                                {actionBusyId === user.id ? <CircularProgress size={16} /> : user.role === 'admin' ? <PersonIcon fontSize="small" /> : <AdminPanelSettingsIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={user.status === 'active' ? 'Disable user' : 'Re-enable user'}>
                            <span>
                              <IconButton size="small" disabled={actionBusyId === user.id} onClick={() => setConfirmUser({ user, action: user.status === 'active' ? 'ban' : 'unban' })}>
                                {user.status === 'active' ? <BlockIcon fontSize="small" color="error" /> : <CheckCircleOutlineIcon fontSize="small" color="success" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Pagination
                count={pageCount}
                page={safePage}
                onChange={(_event, value) => setPage(value)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  async function toggleVoiceFeature(next: boolean) {
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const result = await api.adminUpdateSettings({ voiceEnabled: next });
      setVoiceEnabled(result.voiceEnabled);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      setVoiceEnabled(!next);
      setSettingsError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  }

  async function saveMaintenance(enabled: boolean, message: string) {
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const result = await api.adminUpdateSettings({
        maintenance: { enabled, message },
      });
      setMaintenanceEnabled(result.maintenance.enabled);
      setMaintenanceMessage(result.maintenance.message);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Failed to save maintenance mode.');
    } finally {
      setSettingsSaving(false);
    }
  }

  async function saveBranding() {
    setSettingsSaving(true);
    setSettingsError(null);
    setSettingsSaved(false);
    try {
      const result = await api.adminUpdateSettings({
        branding: {
          appName: brandingDraft.appName,
          logo: brandingDraft.logo,
          tagline: brandingDraft.tagline,
          logoUrl: brandingDraft.logoUrl,
          accent: brandingDraft.accent,
        },
      });
      setBrandingDraft({
        appName: result.branding?.appName ?? brandingDraft.appName,
        logo: result.branding?.logo ?? brandingDraft.logo,
        tagline: result.branding?.tagline ?? brandingDraft.tagline,
        logoUrl: result.branding?.logoUrl ?? brandingDraft.logoUrl,
        accent: result.branding?.accent ?? brandingDraft.accent,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : 'Failed to save branding.');
    } finally {
      setSettingsSaving(false);
    }
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSettingsError('Please choose an image file (PNG, JPG, WEBP, GIF or SVG).');
      return;
    }
    if (file.size > 512 * 1024) {
      setSettingsError('Logo image must be 512 KB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        setBrandingDraft((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  }

  const renderSettings = () => {
    if (loading) {
      return <SkeletonCard height={280} />;
    }

    return (
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <SettingsIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700}>Feature settings</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Changes apply instantly to all users.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PaletteIcon sx={{ color: '#6d28d9' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Branding</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customize the app name, logo and tagline shown across the app and login page.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                {brandingDraft.logoUrl ? (
                  <Box
                    component="img"
                    src={brandingDraft.logoUrl}
                    alt="Logo preview"
                    draggable={false}
                    sx={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 2 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.5,
                      background: `linear-gradient(135deg, ${previewAccent} 0%, ${darkenHex(previewAccent)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: 21,
                    }}
                  >
                    {brandingDraft.logo || '?'}
                  </Box>
                )}
                {settingsSaving && <CircularProgress size={18} />}
                {settingsSaved && (
                  <Chip label="Saved" size="small" sx={{ bgcolor: 'rgba(16,163,127,0.12)', color: '#0f766e', fontWeight: 700 }} />
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              <TextField
                size="small"
                label="App name"
                value={brandingDraft.appName}
                onChange={(event) => setBrandingDraft((prev) => ({ ...prev, appName: event.target.value }))}
                placeholder="MyDevAI"
                inputProps={{ maxLength: 40 }}
                disabled={settingsSaving}
              />
              <TextField
                size="small"
                label="Logo (emoji or 1-4 characters)"
                value={brandingDraft.logo}
                onChange={(event) => setBrandingDraft((prev) => ({ ...prev, logo: event.target.value }))}
                placeholder="M"
                inputProps={{ maxLength: 4 }}
                disabled={settingsSaving}
              />
              <TextField
                size="small"
                label="Tagline"
                value={brandingDraft.tagline}
                onChange={(event) => setBrandingDraft((prev) => ({ ...prev, tagline: event.target.value }))}
                placeholder="AI for developers"
                inputProps={{ maxLength: 90 }}
                disabled={settingsSaving}
                sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
              />
              <TextField
                size="small"
                label="Logo image URL (optional)"
                value={brandingDraft.logoUrl}
                onChange={(event) => setBrandingDraft((prev) => ({ ...prev, logoUrl: event.target.value }))}
                placeholder="https://example.com/logo.png"
                inputProps={{ maxLength: 700000 }}
                disabled={settingsSaving}
                sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  gridColumn: { xs: 'auto', md: '1 / -1' },
                }}
              >
                <Box
                  component="label"
                  title="Pick accent color"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: '1px solid rgba(17,24,39,0.15)',
                    background: `linear-gradient(135deg, ${previewAccent} 0%, ${darkenHex(previewAccent)} 100%)`,
                    boxShadow: 'inset 0 0 0 4px #fff, 0 1px 4px rgba(15,23,42,0.12)',
                  }}
                >
                  <input
                    id="accent-color-picker"
                    type="color"
                    value={previewAccent}
                    onChange={(event) => setBrandingDraft((prev) => ({ ...prev, accent: event.target.value }))}
                    disabled={settingsSaving}
                    style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }}
                  />
                </Box>
                <TextField
                  size="small"
                  label="Accent color (hex) — buttons, highlights, logo tile"
                  value={brandingDraft.accent}
                  onChange={(event) => setBrandingDraft((prev) => ({ ...prev, accent: event.target.value }))}
                  placeholder="#10a37f"
                  inputProps={{ maxLength: 7 }}
                  disabled={settingsSaving}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
              <Button
                component="label"
                variant="outlined"
                size="small"
                disabled={settingsSaving}
                startIcon={<UploadFileIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, borderColor: 'rgba(17,24,39,0.15)' }}
              >
                Upload logo image
                <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
              </Button>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG, WEBP, GIF or SVG — max 512 KB. Replaces the emoji/text logo everywhere.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                disabled={settingsSaving || brandingDraft.appName.trim() === ''}
                onClick={saveBranding}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}
              >
                Save branding
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'rgba(16,163,127,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MicIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Voice chat</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Allow users to speak their messages (mic input) and hear AI replies (text-to-speech). Uses the browser microphone.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                {settingsSaving && <CircularProgress size={18} />}
                {settingsSaved && (
                  <Chip label="Saved" size="small" sx={{ bgcolor: 'rgba(16,163,127,0.12)', color: '#0f766e', fontWeight: 700 }} />
                )}
                <Switch
                  checked={voiceEnabled}
                  onChange={(event) => toggleVoiceFeature(event.target.checked)}
                  disabled={settingsSaving}
                  color="primary"
                />
              </Box>
            </Box>
            {settingsError && (
              <Alert severity="error" onClose={() => setSettingsError(null)} sx={{ mt: 2, borderRadius: 2 }}>
                {settingsError}
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BuildCircleIcon sx={{ color: '#d97706' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Maintenance mode</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Temporarily block all non-admin users with a custom message. Admins keep full access.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                {settingsSaving && <CircularProgress size={18} />}
                {settingsSaved && (
                  <Chip label="Saved" size="small" sx={{ bgcolor: 'rgba(16,163,127,0.12)', color: '#0f766e', fontWeight: 700 }} />
                )}
                <Switch
                  checked={maintenanceEnabled}
                  onChange={(event) => saveMaintenance(event.target.checked, maintenanceMessage)}
                  disabled={settingsSaving}
                  color="warning"
                />
              </Box>
            </Box>

            {maintenanceEnabled && (
              <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, border: 1, borderColor: 'rgba(245,158,11,0.3)', bgcolor: 'rgba(245,158,11,0.06)' }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#92400e', mb: 1 }}>
                  Maintenance is active — non-admin users are blocked.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Public message"
                  value={maintenanceMessage}
                  onChange={(event) => setMaintenanceMessage(event.target.value)}
                  placeholder="We are performing scheduled maintenance. Please check back shortly."
                  disabled={settingsSaving}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#ffffff' } }}
                />
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  disabled={settingsSaving}
                  onClick={() => saveMaintenance(true, maintenanceMessage)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}
                >
                  Update message
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  };

  const renderBilling = () => {
    if (loading) {
      return (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} height={120} />)}
          </Box>
          <SkeletonCard height={280} />
        </Stack>
      );
    }

    if (!billing) {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          No usage data available.
        </Alert>
      );
    }

    const creditCards = [
      { label: 'Total credits purchased', value: formatCurrency(billing.totalCredits), color: '#10a37f' },
      { label: 'Total usage', value: formatCurrency(billing.totalSpend), color: '#f59e0b' },
      { label: 'Credits remaining', value: formatCurrency(billing.remaining), color: '#3b82f6' },
      { label: 'Total messages sent', value: billing.totalMessages.toLocaleString(), color: '#8b5cf6' },
    ];

    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
          {creditCards.map((card) => (
            <Card key={card.label} sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.05em', color: card.color }}>{card.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
          <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Messages per month</Typography>
              {billing.monthlyActivity.every((item) => item.messages === 0) ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No message activity yet.</Typography>
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={billing.monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} width={36} />
                      <ChartTooltip />
                      <Bar dataKey="messages" radius={[8, 8, 0, 0]}>
                        {billing.monthlyActivity.map((entry, index) => (
                          <Cell key={`${entry.month}-${index}`} fill={index % 2 === 0 ? '#10a37f' : '#6ee7b7'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, border: 1, borderColor: 'rgba(17,24,39,0.06)', boxShadow: '0 18px 38px rgba(15,23,42,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Spend by model (all time)</Typography>
              {billing.modelBreakdown.length === 0 && (
                <Typography variant="body2" color="text.secondary">No model usage recorded yet.</Typography>
              )}
              <Stack spacing={2.5}>
                {billing.modelBreakdown.map((item) => (
                  <Box key={item.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.count} msgs</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(17,24,39,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                      <Box sx={{ width: `${Math.max(4, item.value)}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}CC 100%)` }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    );
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: lightBackground, backgroundAttachment: 'fixed' }}>
      <Box sx={{ width: 260, background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)', color: '#f8fafc', p: 2.5, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}>
          <BrandLogo size={30} />
          <Typography variant="h6" fontWeight={800}>{branding.appName}</Typography>
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
          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Admin</Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>mc9958211@gmail.com</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.5, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>ADMIN OVERVIEW</Typography>
                <Typography variant={isSmall ? 'h4' : 'h3'} fontWeight={800} sx={{ letterSpacing: '-0.06em' }}>{branding.appName} Dashboard</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {!loading && overview && (
                  <Chip
                    label={`${overview.systemHealth.filter((h) => h.status === 'ok').length}/${overview.systemHealth.length} systems healthy`}
                    sx={{ bgcolor: overview.systemHealth.every((h) => h.status === 'ok') ? 'rgba(16,163,127,0.12)' : 'rgba(239,68,68,0.12)', color: overview.systemHealth.every((h) => h.status === 'ok') ? '#0f766e' : '#b91c1c', fontWeight: 700 }}
                  />
                )}
                {overview?.lastUpdated && (
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(overview.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
                <Tooltip title="Refresh data">
                  <IconButton onClick={loadData} disabled={loading} size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: { xs: 'flex', lg: 'none' }, gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeTab === item.key ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setActiveTab(item.key)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, flexShrink: 0 }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 3 }} action={<Button color="inherit" size="small" onClick={loadData}>Retry</Button>}>
                {error}
              </Alert>
            )}

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'billing' && renderBilling()}
            {activeTab === 'settings' && renderSettings()}
          </Stack>
        </Box>
      </Box>

      <Dialog open={chatsDialogUser !== null} onClose={() => setChatsDialogUser(null)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            {chatsDialogUser && (
              <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColorFor(chatsDialogUser.email), fontSize: 14, fontWeight: 700 }}>
                {initialsOf(chatsDialogUser.name)}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chatsDialogUser?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chatsDialogUser?.email} · {chatsDialogUser?.chat_count} chats
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setChatsDialogUser(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1.5, md: 3 } }}>
          {chatsError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{chatsError}</Alert>}
          {chatsLoading ? (
            <Stack spacing={2}>
              {[0, 1, 2].map((i) => <SkeletonCard key={i} height={90} />)}
            </Stack>
          ) : chatsData && chatsData.chats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              This user has no chats yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {chatsData?.chats.map((chat) => (
                <Card key={chat.id} variant="outlined" sx={{ borderRadius: 3, borderColor: 'rgba(17,24,39,0.08)' }}>
                  <ListItemButton onClick={() => setExpandedChat(expandedChat === chat.id ? null : chat.id)} sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={700} sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 180 : 420 }}>
                            {chat.title || 'Untitled chat'}
                          </Typography>
                          <Chip label={chat.model || 'assistant'} size="small" sx={{ bgcolor: 'rgba(16,163,127,0.08)', color: '#0f766e', fontWeight: 600, height: 20 }} />
                          <Chip label={`${chat.messages.length} msgs`} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#2563eb', fontWeight: 600, height: 20 }} />
                        </Box>
                      }
                      secondary={`Updated ${formatDateTime(chat.updated_at)}`}
                    />
                    <KeyboardArrowDownIcon sx={{ transform: expandedChat === chat.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'text.secondary' }} />
                  </ListItemButton>
                  {expandedChat === chat.id && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Divider sx={{ mb: 1.5 }} />
                      <Stack spacing={1}>
                        {chat.messages.length === 0 && (
                          <Typography variant="body2" color="text.secondary">No messages in this chat.</Typography>
                        )}
                        {chat.messages.slice(0, 30).map((message) => (
                          <Box key={message.id} sx={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', p: 1.25, borderRadius: 2.5, bgcolor: message.role === 'user' ? 'rgba(16,163,127,0.1)' : 'rgba(17,24,39,0.05)' }}>
                            <Typography variant="caption" fontWeight={700} sx={{ color: message.role === 'user' ? '#0f766e' : '#475569', display: 'block', mb: 0.25 }}>
                              {message.role === 'user' ? 'You' : chat.model || 'Assistant'}
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {truncate(message.content ?? '', 500)}
                            </Typography>
                          </Box>
                        ))}
                        {chat.messages.length > 30 && (
                          <Typography variant="caption" color="text.secondary">Showing first 30 of {chat.messages.length} messages.</Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmUser !== null} onClose={() => setConfirmUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{confirmUser?.action === 'ban' ? 'Disable user?' : 'Re-enable user?'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmUser?.action === 'ban'
              ? `${confirmUser?.user.name} (${confirmUser?.user.email}) will lose access to their account immediately. They can be re-enabled at any time.`
              : `${confirmUser?.user.name} (${confirmUser?.user.email}) will regain access to their account.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmUser(null)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color={confirmUser?.action === 'ban' ? 'error' : 'success'}
            disabled={actionBusyId !== null}
            onClick={confirmStatusChange}
          >
            {actionBusyId !== null ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
            {confirmUser?.action === 'ban' ? 'Disable' : 'Re-enable'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={limitsDialogUser !== null} onClose={() => setLimitsDialogUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>Set limits</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {limitsDialogUser?.name} ({limitsDialogUser?.email}) · {limitsDialogUser?.chat_count} chats
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Max chats (empty = unlimited)"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              value={limitsDraft.maxChats}
              onChange={(event) => setLimitsDraft((draft) => ({ ...draft, maxChats: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Max messages (empty = unlimited)"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              value={limitsDraft.maxMessages}
              onChange={(event) => setLimitsDraft((draft) => ({ ...draft, maxMessages: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Custom message when blocked"
              multiline
              minRows={2}
              value={limitsDraft.note}
              onChange={(event) => setLimitsDraft((draft) => ({ ...draft, note: event.target.value }))}
              placeholder="e.g. Free trial exhausted — contact support to upgrade."
            />
            <Typography variant="caption" color="text.secondary">
              Users are blocked with a 429 response once they reach the limit. Leave all fields empty and save to remove limits.
            </Typography>
            {limitsError && (
              <Alert severity="error" onClose={() => setLimitsError(null)} sx={{ borderRadius: 2 }}>
                {limitsError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setLimitsDialogUser(null)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={limitsSaving}
            onClick={saveLimits}
          >
            {limitsSaving ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
            Save limits
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </ThemeProvider>
  );
}