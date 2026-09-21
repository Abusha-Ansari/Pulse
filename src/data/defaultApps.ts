import { Application } from '../types/tracker';

export const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'Development',
    productivityType: 'Productive',
    iconName: 'Code',
    color: '#3B82F6',
    description: 'Code editor, debugging, and development environment.',
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design',
    productivityType: 'Productive',
    iconName: 'Figma',
    color: '#A855F7',
    description: 'Collaborative interface design and prototyping tool.',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    category: 'Productivity',
    productivityType: 'Neutral',
    iconName: 'Globe',
    color: '#EAB308',
    description: 'Web browsing, documentation search, and web testing.',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    productivityType: 'Neutral',
    iconName: 'MessageSquare',
    color: '#EC4899',
    description: 'Team messaging, channels, and work sync.',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Entertainment',
    productivityType: 'Distracting',
    iconName: 'Music',
    color: '#10B981',
    description: 'Audio streaming and background music playback.',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    productivityType: 'Productive',
    iconName: 'BookOpen',
    color: '#6366F1',
    description: 'Workspace, knowledge base, notes, and task planning.',
  },
  {
    id: 'github',
    name: 'GitHub Desktop',
    category: 'Development',
    productivityType: 'Productive',
    iconName: 'GitBranch',
    color: '#64748B',
    description: 'Git version control, staging commits, and PR reviews.',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    productivityType: 'Distracting',
    iconName: 'Headphones',
    color: '#818CF8',
    description: 'Voice chat, developer communities, and social servers.',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    category: 'Development',
    productivityType: 'Productive',
    iconName: 'Terminal',
    color: '#059669',
    description: 'Command line shell, scripts, build tools, and docker.',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Communication',
    productivityType: 'Productive',
    iconName: 'Video',
    color: '#0284C7',
    description: 'Video conferencing, sprint planning, and client meetings.',
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Development: '#3B82F6',
  Design: '#A855F7',
  Communication: '#06B6D4',
  Entertainment: '#F43F5E',
  Productivity: '#6366F1',
  System: '#94A3B8',
};

export const PRODUCTIVITY_COLORS = {
  Productive: '#10B981', // Neon Emerald
  Neutral: '#F59E0B',    // Amber
  Distracting: '#F43F5E',// Rose
};
