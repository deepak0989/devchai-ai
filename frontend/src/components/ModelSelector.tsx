import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getModelOption, MODELS } from '../types';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

function ModelBadge({ label, color }: { label: string; color: string }) {
  return (
    <Box
      component="span"
      sx={{
        width: 26,
        height: 26,
        borderRadius: 1,
        bgcolor: color,
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Box>
  );
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const current = getModelOption(value);

  function handleChange(event: SelectChangeEvent<string>) {
    onChange(event.target.value);
  }

  return (
    <Select
      value={current.model}
      onChange={handleChange}
      size="small"
      variant="outlined"
      IconComponent={ExpandMoreIcon}
      renderValue={(selected) => {
        const option = getModelOption(selected);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ModelBadge label={option.badge} color={option.color} />
            <Typography variant="body2">{option.label}</Typography>
          </Box>
        );
      }}
      sx={{
        minWidth: 150,
        bgcolor: 'transparent',
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          border: 1,
          borderColor: 'divider',
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: { bgcolor: 'background.paper' },
        },
      }}
    >
      {MODELS.map((option) => (
        <MenuItem key={option.key} value={option.model}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
            <ModelBadge label={option.badge} color={option.color} />
            <Box>
              <Typography variant="body2">{option.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.model}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
