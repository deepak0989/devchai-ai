import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import ChatIcon from '@mui/icons-material/Chat';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AgentWorkspace from '../components/AgentWorkspace';
import {
  AgentProject,
  deleteAgentProject,
  loadAgentProjects,
  saveAgentProject,
} from '../lib/agentStore';

const RAIL_WIDTH = 260;

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AgentPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AgentProject[]>(() => loadAgentProjects());
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  function handleProjectUpdated(project: AgentProject) {
    const updated = saveAgentProject(project);
    setProjects(updated);
    setActiveId(project.id);
  }

  function handleNewProject() {
    setActiveId(null);
  }

  function handleDelete(id: string) {
    const updated = deleteAgentProject(id);
    setProjects(updated);
    if (activeId === id) setActiveId(null);
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box
        component="nav"
        sx={{
          width: RAIL_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>
            Agent Studio
          </Typography>
          <Tooltip title="Back to chat">
            <IconButton onClick={() => navigate('/')} size="small" aria-label="Back to chat">
              <ChatIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleNewProject}
          >
            New Project
          </Button>
        </Box>

        <Divider sx={{ mx: 2 }} />

        <Box sx={{ px: 3, py: 1.5 }}>
          <Typography variant="overline" color="text.secondary">
            My Projects
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 1 }}>
          <List disablePadding>
            {projects.map((project) => {
              const selected = project.id === activeId;
              return (
                <ListItem
                  key={project.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="Delete project"
                      onClick={() => handleDelete(project.id)}
                      sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={selected}
                    onClick={() => setActiveId(project.id)}
                    sx={{
                      borderRadius: 2,
                      mr: 4,
                      '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.08)' },
                      '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap fontWeight={selected ? 600 : 400}>
                          {project.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(project.createdAt)} · {project.raw.length > 0 ? 'generated' : 'draft'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {projects.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', mt: 3, px: 2 }}
              >
                No projects yet.
                <br />
                Create your first one!
              </Typography>
            )}
          </List>
        </Box>
      </Box>

      <AgentWorkspace
        project={activeProject}
        onNewProject={handleNewProject}
        onProjectUpdated={handleProjectUpdated}
      />
    </Box>
  );
}
