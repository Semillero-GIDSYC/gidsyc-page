import { Course } from '../types';

// Asset Imports
import CURSO1_IMG from '/assets/courses/construccion_experimental_modelos_lenguaje_pequenos.png';
import CURSO1_AUDIO from '/assets/courses/construccion_experimental_modelos_lenguaje_pequenos.mp3';
import CURSO2_IMG from '/assets/courses/fundamentos_de_transformers.jpeg';
import CURSO2_AUDIO from '/assets/courses/fundamentos_de_transformers.mp3';
import CURSO3_AUDIO from '/assets/courses/modelos_difusion_ia_generativa.mp3';
import CURSO3_IMG from '/assets/courses/formulacion_modelado_generativo.png';

export const COURSES: Course[] = [
  {
    name: 'Modelos de difusión',
    category: 'IA Generativa',
    desc: 'Aprende a diseñar, entrenar y evaluar modelos de difusión de IA generativa con enfoque práctico y experimental.',
    url: 'https://github.com/sanchezgt/modelos_difusion_ia_generativa/tree/main',
    duration: '6 h 15 min',
    level: 'Avanzado',
    lessons: '18 lecciones',
    image: CURSO3_IMG,
    audio: CURSO3_AUDIO
  },
  {
    name: 'Construcción experimental de modelos de lenguaje pequeños',
    category: 'Procesamiento de Lenguaje Natural',
    desc: 'Guía práctica para el desarrollo de SLMs (Small Language Models) enfocada en optimización de recursos y eficiencia.',
    url: 'https://github.com/sanchezgt/construccion_experimental_modelos_lenguaje_pequenos',
    duration: '4 h 30 min',
    level: 'Intermedio',
    lessons: '12 lecciones',
    image: CURSO1_IMG,
    audio: CURSO1_AUDIO
  },
  {
    name: 'Fundamentos de Transformers',
    category: 'Deep Learning',
    desc: 'Exploración profunda de los mecanismos de atención en redes neuronales, desde RNNs hasta Transformers modernos.',
    url: 'https://github.com/gidsyc',
    duration: '3 h 45 min',
    level: 'Intermedio',
    lessons: '10 lecciones',
    image: CURSO2_IMG,
    audio: CURSO2_AUDIO
  }
];
