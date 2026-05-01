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

export type ViewType = 'main' | 'estudiantes' | 'cursos';

export interface NavLink {
  title: string;
  view: ViewType;
  hash?: string;
}
