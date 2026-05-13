import { TeamMember } from '../types';
import CARLOS_HENRIQUEZ_IMG from '/assets/team/carlos-henriquez.png';
import JESUS_RIOS_IMG from '/assets/team/jesus-rios.jpeg';
import NALLIG_LEAL_IMG from '/assets/team/nallig-leal.jpeg';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'PhD. German Sanchez Torres',
    role: 'Director de Semillero',
    field: 'Investigador Principal',
    url: 'https://scholar.google.com/citations?hl=es&user=83jcC2sAAAAJ'
  },
  {
    name: 'PhD. Carlos Henríquez Miranda',
    role: 'Investigador',
    field: 'Investigador Senior',
    url: 'https://scholar.google.com/citations?user=eSAme6cAAAAJ',
    image: CARLOS_HENRIQUEZ_IMG
  },
  {
    name: 'PhD. Nallig Leal Narvaez',
    role: 'Investigador',
    field: 'Investigador Senior',
    url: 'https://scholar.google.com/citations?user=kL63KHQAAAAJ&hl=es',
    image: NALLIG_LEAL_IMG
  },
  {
    name: 'PhD. Esmeide Leal',
    role: 'Investigador',
    field: 'Investigador Senior',
    url: 'https://scholar.google.com/citations?user=OD6w2l8AAAAJ&hl=es'
  },
  {
    name: 'MSc. Jesús Ríos Pérez',
    role: 'Investigador',
    field: 'Investigador Senior',
    url: 'https://scholar.google.com/citations?user=0Gv4kvgAAAAJ&hl=es',
    image: JESUS_RIOS_IMG
  }
];
