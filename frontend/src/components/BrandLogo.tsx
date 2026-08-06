import { Box, SxProps, Theme } from '@mui/material';
import { getAppSettings } from '../lib/settings';
import { darkenHex, isValidHex } from '../lib/color';

interface BrandLogoProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export default function BrandLogo({ size = 30, sx }: BrandLogoProps) {
  const { branding } = getAppSettings();
  const { logo, appName, logoUrl, accent } = branding;
  const accentMain = isValidHex(accent) ? accent.trim() : '#10a37f';

  return (
    <Box
      component="span"
      aria-label={`${appName} logo`}
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size / 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: logoUrl
          ? 'transparent'
          : `linear-gradient(135deg, ${accentMain} 0%, ${darkenHex(accentMain)} 100%)`,
        flexShrink: 0,
        ...sx,
      }}
    >
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt={`${appName} logo`}
          draggable={false}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <Box
          component="span"
          sx={{ fontWeight: 800, color: '#fff', fontSize: size * 0.5, lineHeight: 1, userSelect: 'none' }}
        >
          {logo}
        </Box>
      )}
    </Box>
  );
}
