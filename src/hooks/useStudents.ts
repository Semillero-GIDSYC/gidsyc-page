import { useState, useEffect } from 'react';
import { Student } from '../types';
import { parseStudentsCSV } from '../services/csvParser';
import STUDENTS_CSV from '/assets/students/students_name.csv?url';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(STUDENTS_CSV);
        if (!response.ok) throw new Error('Failed to fetch students');
        const text = await response.text();
        const formattedStudents = parseStudentsCSV(text);
        setStudents(formattedStudents);
      } catch (err) {
        console.error('Error cargando estudiantes:', err);
        setError('Error al cargar la lista de estudiantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return { students, loading, error };
};
