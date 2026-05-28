export type SponsorCategory =
  | 'sponsor'
  | 'selfpromo'
  | 'interaction'
  | 'intro'
  | 'outro'
  | 'preview'
  | 'music_offtopic'
  | 'filler';

export interface SponsorSegment {
  UUID: string;
  category: SponsorCategory;
  actionType: 'skip' | 'mute' | 'poi' | 'chapter';
  segment: [number, number];
  videoDuration: number;
  locked: number;
  votes: number;
  description: string;
}

export interface ParsedSegment {
  id: string;
  category: SponsorCategory;
  start: number;
  end: number;
  label: string;
  color: string;
}

export const CATEGORY_META: Record<SponsorCategory, { label: string; color: string }> = {
  sponsor: { label: 'Patrocínio', color: '#00d400' },
  selfpromo: { label: 'Autopromoção', color: '#ffff00' },
  interaction: { label: 'Interação', color: '#cc00ff' },
  intro: { label: 'Introdução', color: '#00ffff' },
  outro: { label: 'Encerramento', color: '#0202ed' },
  preview: { label: 'Preview', color: '#008fd6' },
  music_offtopic: { label: 'Música off-topic', color: '#ff9900' },
  filler: { label: 'Filler', color: '#7300ab' },
};
