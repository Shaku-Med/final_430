export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  thumbnail?: {
    id?: string;
    name?: string;
    type?: string;
    url?: string;
  };
  profile?: string;
  likes: number;
  comments: number;
  shares: number;
  client: string;
  budget: string;
  team: string;
  startDate: string;
  endDate: string;
}

export interface ProjectCardProps {
  project: Project;
}

export function ProjectCard(props: ProjectCardProps): JSX.Element; 