import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { FaMedal } from 'react-icons/fa';
import { AuthedImage } from '@shared/components/AuthedImage';

interface AchievementMedallionProps {
  /** Slug (e.g. `badge-gold`) or a media-proxy path / URL. */
  icon?: string;
  /** Hex color used to render the medallion when [icon] is a slug. */
  color?: string;
  size?: number;
  glyph?: React.ReactNode;
}

const isImage = (icon?: string) => {
  const t = (icon ?? '').trim().toLowerCase();
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/');
};

/**
 * Renders a badge/medal icon. Real artwork (proxy path / URL) loads via the
 * authenticated <AuthedImage>; slug placeholders render as a colored gradient
 * medallion so the Achievement section looks intentional before art is uploaded.
 */
export const AchievementMedallion: React.FC<AchievementMedallionProps> = ({
  icon,
  color = '#FFAD12',
  size = 56,
  glyph,
}) => {
  const medallion = (
    <Flex
      align="center"
      justify="center"
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      color="white"
      fontSize={`${size * 0.45}px`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${color}, ${shade(color, -0.35)})`,
        boxShadow: `0 0 ${size * 0.18}px ${color}66`,
        border: '1px solid rgba(255,255,255,0.25)',
      }}
    >
      {glyph ?? <FaMedal />}
    </Flex>
  );

  if (!isImage(icon)) return medallion;

  return (
    <Box w={`${size}px`} h={`${size}px`} borderRadius="full" overflow="hidden">
      <AuthedImage
        src={icon}
        w={`${size}px`}
        h={`${size}px`}
        objectFit="cover"
        fallback={medallion}
      />
    </Box>
  );
};

/** Darkens (negative amt) / lightens a #RRGGBB hex by a fraction. */
function shade(hex: string, amt: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp((num >> 16) + 255 * amt);
  const g = clamp(((num >> 8) & 0xff) + 255 * amt);
  const b = clamp((num & 0xff) + 255 * amt);
  return `rgb(${r}, ${g}, ${b})`;
}
