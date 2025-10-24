import { useState, useEffect } from 'react';
import type { Professor } from '../lib/types';

const PROFESSOR_STORAGE_KEY = 'classtune_professor';

export function useAuth() {
  const [professor, setProfessor] = useState<Professor | null>(() => {
    const stored = localStorage.getItem(PROFESSOR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (professor) {
      localStorage.setItem(PROFESSOR_STORAGE_KEY, JSON.stringify(professor));
    } else {
      localStorage.removeItem(PROFESSOR_STORAGE_KEY);
    }
  }, [professor]);

  const login = (professorData: Professor) => {
    setProfessor(professorData);
  };

  const logout = () => {
    setProfessor(null);
  };

  return {
    professor,
    isAuthenticated: !!professor,
    login,
    logout,
  };
}
