import React from 'react';

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24'
};

const Icon = ({ children, ...props }) => (
  <svg {...baseProps} {...props}>
    {children}
  </svg>
);

export const MoreIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const BackIcon = (props) => (
  <Icon {...props}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
);

export const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const FullscreenIcon = (props) => (
  <Icon {...props}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
);

export const PauseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="7" y="5" width="4" height="14" rx="1.5" />
    <rect x="13" y="5" width="4" height="14" rx="1.5" />
  </svg>
);

export const FileIcon = (props) => (
  <Icon {...props}>
    <path d="M6 3h7l5 5v13H6z" />
    <path d="M13 3v5h5" />
  </Icon>
);

export const ViewIcon = (props) => (
  <Icon {...props}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
);

export const SettingsIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </Icon>
);

export const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5.5l10 6.5-10 6.5z" />
  </svg>
);

export const SpriteIcon = (props) => (
  <Icon {...props}>
    <rect x="4" y="4" width="9" height="9" rx="2" />
    <rect x="11" y="11" width="9" height="9" rx="2" />
  </Icon>
);

export const StageIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8" />
  </Icon>
);

export const CostumeIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 16l5-4 4 3 3-2 6 4" />
  </Icon>
);

export const SoundIcon = (props) => (
  <Icon {...props}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="16" cy="16" r="3" />
  </Icon>
);

export const PuzzleIcon = (props) => (
  <Icon {...props}>
    <path d="M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v1a2 2 0 1 1-4 0v-1H6a1 1 0 0 1-1-1v-3H4a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h4z" />
  </Icon>
);

export const CodeIcon = (props) => (
  <Icon {...props}>
    <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" />
  </Icon>
);

export const ReadmeIcon = (props) => (
  <Icon {...props}>
    <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    <path d="M14 4v5h5M8 13h7M8 17h5" />
  </Icon>
);
