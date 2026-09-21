import React from 'react';
import {
  Code,
  Globe,
  MessageSquare,
  Music,
  BookOpen,
  GitBranch,
  Headphones,
  Terminal,
  Video,
  Coffee,
  AppWindow,
  Layers,
  Monitor,
  Folder,
  Layout,
  LucideProps,
} from 'lucide-react';

interface AppIconProps extends LucideProps {
  name: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
  switch (name.toLowerCase()) {
    case 'code':
    case 'vscode':
      return <Code {...props} />;
    case 'figma':
    case 'layout':
      return <Layout {...props} />;
    case 'globe':
    case 'chrome':
      return <Globe {...props} />;
    case 'messagesquare':
    case 'slack':
      return <MessageSquare {...props} />;
    case 'music':
    case 'spotify':
      return <Music {...props} />;
    case 'bookopen':
    case 'notion':
      return <BookOpen {...props} />;
    case 'gitbranch':
    case 'github':
      return <GitBranch {...props} />;
    case 'headphones':
    case 'discord':
      return <Headphones {...props} />;
    case 'terminal':
      return <Terminal {...props} />;
    case 'video':
    case 'zoom':
      return <Video {...props} />;
    case 'coffee':
    case 'idle':
      return <Coffee {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'monitor':
      return <Monitor {...props} />;
    default:
      return <AppWindow {...props} />;
  }
};
