export interface Project {
  title: string;
  desc: string;
  url: string;
}

export interface TeamMember {
  name: string;
  role: string;
  field: string;
  url: string;
  image?: string;
}

export interface Student {
  name: string;
  role: string;
}

export interface Course {
  name: string;
  category: string;
  desc: string;
  url: string;
  duration: string;
  level: string;
  lessons: string;
  image: string;
  audio: string;
}

export interface ResearchPublication {
  slug: string;
  title: string;
  authors: string[];
  citation: string;
  year: number;
  abstract?: string;
  doi?: string;
  sourceUrl?: string;
  pdfUrl?: string;
  journalTitle?: string;
  volume?: string;
  issue?: string;
  firstPage?: string;
  lastPage?: string;
  teamAuthors: string;
  googleScholarUrl: string;
}

export interface ResearchLine {
  id: string;
  title: string;
  publications: ResearchPublication[];
}

export type ViewType = 'main' | 'estudiantes' | 'cursos' | 'lineas';

export interface NavLink {
  title: string;
  view: ViewType;
  hash?: string;
}
