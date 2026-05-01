import { Student } from '../types';

export const parseStudentsCSV = (text: string): Student[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const hasHeader = lines[0].toLowerCase().includes('nombre') || lines[0].toLowerCase().includes('name');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map(line => {
    const parts = line.split(';').map(p => p.trim());
    let fullName = '';
    if (parts.length >= 4) {
      fullName = `${parts[2]} ${parts[3]} ${parts[0]} ${parts[1]}`;
    } else {
      fullName = parts.join(' ');
    }
    return { name: fullName.trim(), role: 'Estudiante Activo' };
  });
};
