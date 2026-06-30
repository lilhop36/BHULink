// src/services/resourceService.js

const STORAGE_KEY = 'bhu_resources';

export const getResources = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  // Seed demo data
  const demoResources = [
    {
      id: 'r1',
      title: 'Introduction to AI - Lecture Notes',
      description: 'Slides and notes from the first AI lecture.',
      link: 'https://example.com/ai-notes.pdf',
      facultyId: 'faculty_1',
      facultyName: 'Prof. Sarah Johnson',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'r2',
      title: 'Database Design Cheatsheet',
      description: 'Quick reference for SQL and normalization.',
      link: 'https://example.com/db-cheatsheet.pdf',
      facultyId: 'faculty_2',
      facultyName: 'Dr. Michael Chen',
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoResources));
  return demoResources;
};

export const addResource = (resource) => {
  const resources = getResources();
  const newResource = {
    id: Date.now().toString(),
    ...resource,
    createdAt: new Date().toISOString(),
  };
  const updated = [newResource, ...resources];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newResource;
};

export const deleteResource = (id) => {
  const resources = getResources();
  const filtered = resources.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getResourcesByFaculty = (facultyId) => {
  const resources = getResources();
  // If facultyId is null or undefined, return all resources (for students to view)
  if (!facultyId) {
    return resources;
  }
  return resources.filter((r) => r.facultyId === facultyId);
};