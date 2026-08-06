import { Box, SxProps, Theme } from '@mui/material';
import { getAppSettings } from '../lib/settings';

interface BrandLogoProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export default function BrandLogo({ size = 30, sx }: BrandLogoProps) {
  const { logo, appName } = getAppSettings();

  return (
    <Box
      component="span"
      aria-label={`${appName} logo`}
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size / 3,
        background: 'linear-gradient(135deg, #10a37f 0%, #0d8a6d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        color: '#fff',
        fontSize: size * 0.5,
        lineHeight: 1,
        userSelect: 'none',
        ...sx,
      }}
    >
      {logo}
    </Box>
  );
}
